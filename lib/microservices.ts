import { Construct } from "constructs";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { join } from "path";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";

interface SwnMicroservicesProps {
    productTable: ITable;
    basketTable: ITable;
    orderTable: ITable;
};

export class SwnMicroservices extends Construct {
    public readonly productMicroservice: NodejsFunction;
    public readonly basketMicroservice: NodejsFunction;
    public readonly orderingMicroservice: NodejsFunction;

    constructor(scope: Construct, id: string, props: SwnMicroservicesProps) {
        super(scope, id);
  
        this.productMicroservice = this.createProductFunction(props.productTable);
        this.basketMicroservice = this.createBasketFunction(props.basketTable);
        this.orderingMicroservice = this.createOrderingFunction(props.orderTable);
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
            DYNAMODB_TABLE_NAME: basketTable.tableName,
            EVENT_SOURCE: "com.swn.basket.checkoutbasket",
            EVENT_DETAILTYPE: "CheckoutBasket",
            EVENT_BUSNAME: "SwnEventBus"
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

    createOrderingFunction(orderTable: ITable): NodejsFunction {
        const orderFunctionProps: NodejsFunctionProps = {
          bundling: {
            externalModules: [
              "aws-sdk"
            ]
          },
          environment: {
            PRIMARY_KEY: "userName",
            SORT_KEY: "orderDate",
            DYNAMODB_TABLE_NAME: orderTable.tableName
          },
          runtime: Runtime.NODEJS_18_X
        };

        const orderFunction = new NodejsFunction(this, "orderingLambdaFunction", {
          entry: join(__dirname, "/../src/ordering/index.js"),
          ...orderFunctionProps
        });

        orderTable.grantReadWriteData(orderFunction);

        return orderFunction;
    }
}