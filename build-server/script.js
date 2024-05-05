const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");
require("dotenv").config();
const Redis = require("ioredis");

const publisher = new Redis(process.env.REDIS_URL);

const s3Client = new S3Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  }, 
});

const PROJECT_ID = process.env.PROJECT_ID;

function publishLog(log) {
  publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify({log}));
}

async function init() {

  console.log("Executing script.js");

  publishLog("Starting to build the project");

  const outDirPath = path.join(__dirname, "output");

  const p = exec(`cd ${outDirPath} && npm install && npm run build`);

  p.stdout.on("data", (data) => {
    console.log(data.toString());
    publishLog(data.toString());
  });

  p.stdout.on("error", (error) => {
    console.log("Error", error.toString());
    publishLog("Error: ",error.toString());
  });

  p.on("close", async () => {
    console.log("Build Colmpleted Successfully");
    publishLog("Build Colmpleted Successfully");
    const distDirPath = path.join(__dirname, "output", "dist");
    const distDirContent = fs.readdirSync(distDirPath, { recursive: true });

    console.log('Starting to upload');
    publishLog("Starting to upload");
    for (const file of distDirContent) {
      filePath = path.join(distDirPath, file);
      if (fs.lstatSync(filePath).isDirectory()) continue;

      console.log("Uploading", filePath);
      publishLog(`Uploading ${filePath}`);
      const command = new PutObjectCommand({
        Bucket: "deployment-pipeline-bucket",
        Key: `__outputs/${PROJECT_ID}/${file}`,
        Body: fs.createReadStream(filePath),
        ContentType: mime.lookup(filePath),
      });

      await s3Client.send(command);
      console.log("Uploaded", filePath);
      publishLog(`Uploaded ${filePath}`);
    }
    console.log("Done");
    publishLog("Done");
  });

  console.log("Script executed successfully");
  publishLog("Script executed successfully");
}

init();
