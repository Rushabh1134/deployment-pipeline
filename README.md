# Deployment Pipeline

This project is a clone of Vercel's deployment pipeline.

## Introduction

The deployment pipeline is a crucial part of the software development lifecycle. It allows for the automated and efficient delivery of software changes from development to production environments. This README provides an overview of the deployment pipeline and its components.

## Components

The deployment pipeline consists of the following components:

1. **Build**: The build process compiles the source code, runs tests, and generates artifacts that are ready for deployment.

2. **Test**: The test phase ensures that the application functions as expected and meets the specified requirements.

3. **Deploy**: The deployment phase takes the artifacts generated in the build phase and deploys them to the target environment.

4. **Release**: The release phase involves making the deployed application available to end-users.

5. **Monitor**: The monitoring phase involves tracking the application's performance and health in the production environment.

## Getting Started

To get started with this deployment pipeline, follow these steps:

1. Clone the repository: `git clone https://github.com/deployment-pipeline.git`


2. cd into deployment-pipeline: `cd deployment-pipeline`

3. Configure build-server: 
    - cd into build-server: `cd build-server`
    - Install Node Dependencies: `npm i`
    - Replace `deployment-pipeline-output` in `built-server/script.js` with your AWS S3 Bucket name
    - While creating S3 bucket set `Block all public access` checkbox to false
    - Set Bucket Policy same as give in this json file `/bucket_policy.json`
    - Replace `process.env.ACCESS_KEY` and `process.env.SECRET_ACCESS_KEY` your `ACCESS_KEY` and `SECRET_ACCESS_KEY`
    - Create an `AWS ECR` to push and create the Docker Image
    - Create an `AWS ECS` 

## Conclusion

The deployment pipeline is an essential tool for ensuring the smooth and efficient delivery of software changes. By automating the process, it reduces the risk of errors and enables faster time-to-market. This project aims to provide a clone of Vercel's deployment pipeline, allowing developers to easily implement and customize their own deployment workflows.
