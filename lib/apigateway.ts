import { Construct } from "constructs";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";

interface SwnApiGatewayProps {
    productMicroservice: IFunction;
    basketMicroservice: IFunction;
    orderingMicroservice: IFunction;
};

export class SwnApiGateway extends Construct {
    constructor(scope: Construct, id: string, props: SwnApiGatewayProps) {
        super(scope, id);

        this.createProductApi(props.productMicroservice);
        this.createBasketApi(props.basketMicroservice);
        this.createOrderApi(props.orderingMicroservice);
    }

    private createProductApi(productMicroservice: IFunction) {
        const apigw = new LambdaRestApi(this, "productApi", {
            restApiName: "Product Service",
            handler: productMicroservice,
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

    private createBasketApi(basketMicroservice: IFunction) {
        const apigw = new LambdaRestApi(this, "basketApi", {
            restApiName: "Basket Service",
            handler: basketMicroservice,
            proxy: false
        });
    
        const basket = apigw.root.addResource("basket");
    
        basket.addMethod("GET"); // GET /basket
        basket.addMethod("POST"); // POST /basket
    
        const singleBasket = basket.addResource("{userName}"); // /basket/{username}
        
        singleBasket.addMethod("GET"); // GET /basket/{username}
        singleBasket.addMethod("DELETE"); // DELETE /basket/{username}

        const basketCheckout = basket.addResource("checkout"); // /basket/checkout

        basketCheckout.addMethod("POST"); // POST /basket/checkout
    }

    private createOrderApi(orderingMicroservice: IFunction) {
        const apigw = new LambdaRestApi(this, "orderApi", {
            restApiName: "Order Service",
            handler: orderingMicroservice,
            proxy: false
        });

        const order = apigw.root.addResource("order");

        order.addMethod("GET");

        const singleOrder = order.addResource("{userName}");

        singleOrder.addMethod("GET");

        return singleOrder;
    }
}