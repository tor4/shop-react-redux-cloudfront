import { Construct } from "constructs";
import {
  aws_cloudfront,
  aws_cloudfront_origins,
  aws_s3,
  aws_s3_deployment,
  CfnOutput,
  RemovalPolicy,
  StackProps,
} from "aws-cdk-lib";

const path = "./resources/build";

export class DeploymentService extends Construct {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id);

    const branchTag = props?.tags?.branch || "";

    const hostingBucket = new aws_s3.Bucket(
      this,
      `FrontendBucket-${branchTag}`,
      {
        blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      },
    );

    const distribution = new aws_cloudfront.Distribution(
      this,
      `FrontendDistribution-${branchTag}`,
      {
        defaultBehavior: {
          origin:
            aws_cloudfront_origins.S3BucketOrigin.withOriginAccessControl(
              hostingBucket,
            ),
          viewerProtocolPolicy:
            aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        defaultRootObject: "index.html",
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
          },
        ],
      },
    );

    new aws_s3_deployment.BucketDeployment(
      this,
      `FrontendDeployment-${branchTag}`,
      {
        sources: [aws_s3_deployment.Source.asset(path)],
        destinationBucket: hostingBucket,
        distribution,
        distributionPaths: ["/*"],
      },
    );

    new CfnOutput(this, `CloudFrontURL-${branchTag}`, {
      value: distribution.domainName,
      description: "The URL of the CloudFront distribution",
      exportName: `CloudfrontURL-${branchTag}`,
    });

    new CfnOutput(this, `BucketName-${branchTag}`, {
      value: hostingBucket.bucketName,
      description: "The name of the S3 bucket",
      exportName: `BucketName-${branchTag}`,
    });
  }
}
