import { Construct } from "constructs";
import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { IQueue } from "aws-cdk-lib/aws-sqs";
import { SqsQueue } from "aws-cdk-lib/aws-events-targets";

interface SwnEventBusProps {
    publisherFunction: IFunction;
    targetQueue: IQueue;
};

export class SwnEventBus extends Construct {
    constructor(scope: Construct, id: string, props: SwnEventBusProps) {
        super(scope, id);

        // Event Bus
        const bus = new EventBus(this, "SwnEventBus", {
            eventBusName: "SwnEventBus"
        });
    
        // Event rule
        const checkoutBasketRule = new Rule(this, "CheckoutBasketRule", {
            eventBus: bus,
            enabled: true,
            description: "When Basket microservice checkout the basket",
            eventPattern: {
                source: ["com.swn.basket.checkoutbasket"],
                detailType: ["CheckoutBasket"]
            },
            ruleName: "CheckoutBasketRule"
        });
    
        checkoutBasketRule.addTarget(new SqsQueue(props.targetQueue));
        
        bus.grantPutEventsTo(props.publisherFunction);
    }
}