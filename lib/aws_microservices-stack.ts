import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { join } from "path";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";

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

    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          "aws-sdk"
        ]
      },
      environment: {
        PRIMARY_KEY: "id",
        DYNAMODB_TABLE_NAME: productTable.tableName
      },
      runtime: Runtime.NODEJS_18_X
    };

    // Product microservices Lambda function
    const productFunction = new NodejsFunction(this, "productLambdaFunction", {
      entry: join(__dirname, "/../src/product/index.js"),
      ...nodeJsFunctionProps
    });

    productTable.grantReadWriteData(productFunction);

    const apigw = new LambdaRestApi(this, "productApi", {
      restApiName: "Product Service",
      handler: productFunction,
      proxy: false
    });

    const product = apigw.root.addResource("product");

    product.addMethod("GET"); // GET /product
    product.addMethod("POST"); // POST /products

    const singleProduct = product.addResource("{id}"); // /product/{id}
    
    singleProduct.addMethod("GET"); // GET /product/{id}
    singleProduct.addMethod("PUT"); // PUT /product/{id}
    singleProduct.addMethod("DELETE"); // DELETE /product/{id}
  }
}