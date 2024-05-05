const express = require("express");
const { generateSlug } = require("random-word-slugs");
const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");
require("dotenv").config();
const { Server } = require("socket.io");
const Redis = require(ioredis);

const app = express();

const PORT = 9000;

const subscriber = new Redis(process.env.REDIS_URL);

const io = new Server({ cors: '*' });


io.on("connection", (socket) => {
  socket.on("subscribe", (channel) => {
    socket.join(channel);
    socket.emit("message", `Joined ${channel}`);
  });
});

io.listen(9001), () => { console.log("Socket server is running on PORT 9001") };

const ecsClient = new ECSClient({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  }
})

const config = {
  CLUSTER: process.env.CLUSTER,
  TASK: process.env.TASK,
};

app.use(express.json());


app.get("/", (req, res) => {
  res.send("Hello");
});

app.post("/project", async (req, res) => {

  const { gitURL } = req.body;
  console.log(req.body);
  const slug = generateSlug();
  const projectSlug = gitURL.split("/").pop().split(".")[0] + "-" + slug;

  const command = new RunTaskCommand({
    cluster: config.CLUSTER,
    taskDefinition: config.TASK,
    launchType: "FARGATE",
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "ENABLED",
        subnets: [ //replace
          "subnet-00f43ac39bad448b1",
          "subnet-01453cb76c99ebb88",
          "subnet-034f6f4a27cb966a7",
        ],
        securityGroups: ["sg-0d473f905316a4163"], // replace
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: "builder-image",
          environment: [
            { name: "GIT_REPOSITORY__URL", value: gitURL },
            { name: "PROJECT_ID", value: projectSlug },
            { name: "ACCESS_KEY", value: process.env.ACCESS_KEY },
            { name: "SECRET_ACCESS_KEY", value: process.env.SECRET_ACCESS_KEY }
          ],
        },
      ],
    },
  });

  await ecsClient.send(command);

  return res.json({
    status: "queued",
    data: { projectSlug, url: `http://${projectSlug}.rushabh-patil.co` },
  });
});

async function initRedisSubscribe() {
  console.log("Subscribing to logs");
  subscriber.psubscribe("logs:*");
  subscriber.on("pmessage", (pattern, channel, message) => {
    io.to(channel).emit("message", message);
  });
  console.log("Subscribed to logs");
}

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
