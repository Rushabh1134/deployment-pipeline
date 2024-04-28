const express = require("express");
const httpProxy = require("http-proxy");

const app = express();

const PORT = 8000;

const BASE_URL = "https://deployment-pipeline-bucket.s3.eu-north-1.amazonaws.com/__outputs";

const proxy = httpProxy.createProxy();


app.listen(PORT, () => {
  console.log(`Reverse Proxy is running on PORT ${PORT}`);
});

proxy.on("proxyReq", (proxyReq, req, res) => {
    const url = req.url;
    if(url === "/") {
        proxyReq.path += "index.html";
    }
});

app.use((req, res) => {
    const hostname = req.hostname;
    const subdomain = hostname.split(".")[0];
    const resolvesTo = `${BASE_URL}/${subdomain}`
    return proxy.web(req, res, { target: resolvesTo, changeOrigin: true});
})
