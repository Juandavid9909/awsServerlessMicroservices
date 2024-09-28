import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { join } from "path";
import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";

export class AwsMicroservicesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const productTable = new Table(this, "product", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING
      },
      tableName: "product",
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST
    });

    const fn = new Function(this, "MyFunction", {
      runtime: Runtime.NODEJS_12_X,
      handler: "index.handler",
      code: Code.fromAsset(join(__dirname, "lambda-handler"))
    });
  }
}
