#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { DeployWebAppStack } from "../lib/deploy-web-app-stack.js";

const app = new cdk.App();
new DeployWebAppStack(app, "DeployWebAppStack-task-4", {
  tags: {
    branch: "task-4",
  },
});
