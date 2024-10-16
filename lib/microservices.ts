import { Construct } from "constructs";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { join } from "path";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";

interface SwnMicroservicesProps {
    productTable: ITable;
    basketTable: ITable;
};

export class SwnMicroservices extends Construct {
    public readonly productMicroservice: NodejsFunction;
    public readonly basketMicroservice: NodejsFunction;

    constructor(scope: Construct, id: string, props: SwnMicroservicesProps) {
        super(scope, id);
  
        this.productMicroservice = this.createProductFunction(props.productTable);
        this.basketMicroservice = this.createBasketFunction(props.basketTable);
    }

    createProductFunction(productTable: ITable): NodejsFunction {
        const productFunctionProps: NodejsFunctionProps = {
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
          ...productFunctionProps
        });
    
        productTable.grantReadWriteData(productFunction);
  
        return productFunction;
    }

    createBasketFunction(basketTable: ITable): NodejsFunction {
        const basketFunctionProps: NodejsFunctionProps = {
          bundling: {
            externalModules: [
              "aws-sdk"
            ]
          },
          environment: {
            PRIMARY_KEY: "userName",
            DYNAMODB_TABLE_NAME: basketTable.tableName
          },
          runtime: Runtime.NODEJS_18_X
        };
    
        // Product microservices Lambda function
        const basketFunction = new NodejsFunction(this, "basketLambdaFunction", {
          entry: join(__dirname, "/../src/basket/index.js"),
          ...basketFunctionProps
        });
    
        basketTable.grantReadWriteData(basketFunction);
  
        return basketFunction;
    }
}