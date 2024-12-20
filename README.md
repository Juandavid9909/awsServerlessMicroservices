# Arquitectura

![architecture](https://github.com/user-attachments/assets/e322ff62-6eae-4afc-8c58-ce050ff78505)


# ¿Qué es monorepo?

- Una estrategia de desarrollo de software donde muchos proyectos de código son almacenados en el mismo repositorio.
- Un sólo repositorio guarda todo nuestro código y archivos para cada proyecto.
- Empresas como Google, Facebook, Microsoft, Uber, Airbnb y Twitter lo usan.
- Una sola fuente, fácil de compartir el código, fácil hacer refactoring.
- ¿Por qué usar Monorepo?
	- Parte de microservicios.
	- Parte de infraestructura.
- Guardar código de microservicios e infraestructura en el mismo repositorio.


# Estructura de código del proyecto

- **Carpetas principales:** bin, lib y src. Las carpetas bin/lib generadas por la plantilla de proyecto AWS CDK.
- **bin:** Punto inicial de nuestra aplicación.
- **lib:** Infraestructura como código. Pilas IaC Serverless con AWS CDK.
- **src:** Código de desarrollo de microservicios con NodeJS.


# Tipos de triggers en funciones Lambda

Hay 3 tipos de invocación:

- Lambda Synchronous invocation.
- Lambda Asynchronous invocation.
- Lambda Event Source Mapping.


## Lambda Synchronous invocation

- Ejecuta immediatamente cuando se realiza una invocación a nuestra API Lambda.
- Espera a que la función procese y retorna una respuesta.
- **API Gateway + Lambda + DynamoDB**.
- La bandera **invocation-type** debe ser **"RequestResponse"**.
- Responsable de inspeccionar la respuesta, determinar si hubo un error y decidir si hacer un reintento.
- Servicios AWS que pueden activar nuestra función Lambda de forma síncrona: ELB (Application Load Balancer), Cognito, Lex, Alexa, API Gateway, CloudFront, Kinesis Data Firehouse.


## Lambda Asynchronous invocation

- Lambda envía el evento a una pila interna y retorna una respuesta exitosa sin ninguna información adicional.
- Separa el proceso en eventos de lectura desde la pila y corre nuestra función Lambda.
- **S3 / SNS + Lambda + DynamoDB**.
- Bandera **invocation-type** debe ser **"Event"**.
- Lambda setea la política de reintentos.
	- Conteo de reintentos = 2.
	- Agregado a Dead-Letter Queue (DLQ).
- Servicios AWS que pueden activar nuestra función Lambda asíncrona: S3, EventBridge, SNS, SES, CloudFormation, CloudWatch Logs, CloudWatch Events, CodeCommit.


## Lambda Event Source Mapping

- El modelo de invocación **Pool-Based** nos permite integrarnos con **AWS Stream** y servicios basados en colas.
- Lambda sondeará desde AWS SQS o Kinesis Streams, recuperará los registros e invocará funciones.
- El flujo o la cola de datos se leen en lotes.
- La función recibe múltiples items cuando se ejecuta.
- Los tamaños de los lotes pueden configurarse acorte a los tipos de servicio.
- **SQS + Lambda**.
- Procesamiento basado en Streams con **DynamoDB Streams + Lambda**.
- Servicios AWS que pueden activar nuestro Event Source Mapping: Amazon Kinesis, DynamoDB, Simple Queue Service (SQS).


# Mejores prácticas de seguridad en cuentas AWS

- AWS tiene 2 tipo de usuarios principales.
	- Usuario raíz.
	- Usuario IAM.
- La cuenta raíz tiene todo el poder de nuestra cuenta AWS, y tiene acceso sin restricción sobre toda la cuenta AWS.
- El usuario IAM es un subusuario debajo del usuario raíz, y define políticas sobre esta cuenta y se puede restringir el acceso a servicios.
- Mejor práctica de seguridad es que después de activar nuestra cuenta, lo primero que deberíamos hacer es crear un usuario IAM para el uso diario de la consola de AWS.


# Lambda

Lambda corre instancias de nuestra función para procesar eventos. Podemos invocar nuestras funciones directamente usando la API de Lambda, o podemos configurar un servicio o recurso AWS para invocar la función.

La función Lambda tiene código para procesar los eventos que le pasamos en nuestra función, o los que otros servicios AWS le envían con el objeto JSON del evento.

El objeto de evento contiene toda la información sobre el evento que disparó la función.

El objeto de contexto contiene la información sobre el runtime de nuestra función Lambda.

Retorna la función callback con los resultados.

```typescript
exports.myHandler = function(event, context, callback) {
	// Nuestro proceso
callback(Error error, Object result);
}
```


## Conceptos clave de las funciones Lambda

- **Runtime:** Selecciona el runtime como parte de la configuración de la función, y Lambda carga ese runime cuando inicializa el ambiente.
- **Handler:** La función corre iniciando por el método handler.
- **Function:** Es un recurso que podemos invocar para correr nuestro código en Lambda.
- **Trigger:** Es un recurso o configuración que invoca una función lambda.
- **Event:** Es un documento JSON que contiene información de una función Lambda para procesar.
- **Execution environment:** Provee un runtime seguro y aislado para nuestra función.
- **Layer:** Puede contener librerías, un runtime personalizado, datos, o archivos de configuración. Al usar esto, podemos reducir el tamaño de los archivos de despliegues cargados y hacer que los despliegues de nuestro código sean más rápidos.
- **Concurrency:** Es el número de solicitudes que nuestra función está corriendo en cualquier momento. Cuando nuestra función es invocada, Lambda provee una instancia para procesar el evento. Cuando la función finaliza su ejecución, puede disparar otra solicitud.
- **Destination:** Es un recurso AWS donde Lambda puede enviar eventos desde una invocación asíncrona. Configurar un destino para eventos que fallan en su procesamiento, como setear DLQ para fallos Lambda.


## Mejores prácticas

- Tomar ventaja del reuso de ambientes, y chequear los procesos completados por debajo.
- Administrar la conexión de base de datos con un proxy. Persistir el estado externamente.
- Configurar la función con **Resource-based policy**. Esto da permisos para invocar nuestra función Lambda. Los roles de ejecución definen los permisos de una función para interactuar con recursos.
- Usar variables de entornos para almacenar secretos de forma segura y ajustar el comportamiento de la función sin actualizar el código.


# API Gateway

- Servicio completamente administrador por los desarrolladores para crear, publicar, mantener, monitorear y asegurar APIs en cualquier escala.
- Primera puerta para las aplicaciones para acceder a datos, lógica de negocios desde nuestros servicios backend.
- Podemos crear APIs RESTful y APIs WebSocket.
- Las APIs RESTful exponen endpoints HTTP del backend, funciones Lambda o incluso otros servicios de AWS. Están optimizadas para cargas de trabajo serverless y para backends HTTP usando APIs HTTP.
- Las APIs WebSocket son de comunicación en 2 sentidos en tiempo real.


## Arquitectura

- Provee a nuestros clientes una experiencia de desarrollo integrada y consistente.
- Maneja tareas en cientos de miles de llamados API concurrentes aceptando y procesando.
- Mecanismos de autenticación flexibles, soporta protocolos OAuth2 y OpenID.
- Despliegues con release Canary para rolling outs seguros.
- Sistemas de logs y monitoreo con CloudTrail y CloudWatch en uso de API y cambios de la misma.


# IaC

- Es el proceso de provisionar o administrar infraestructura definida a través de código.
- Esto permite a los usuarios editar y distribuir configuraciones fácilmente, podemos crear configuraciones de infraestructura reproducible.
- Es un proceso que automatiza el aprovisionamiento y administración de recursos en la nube.


## Ventajas

- Velocidad, ya que evita la intervención manual, por lo que los despliegues de infraestructura con rápidos y seguros.
- Consistencia, porque podemos desplegar infraestructura identifica a través del portal, evitando tener que configurar cada una sin ser necesario.
- Reusabilidad, porque hace fácil el reuso de módulos.
- Costo reducido, ya que permite tener máquinas virtuales administradas de forma programada.


# EventBridge

- Es un bus de eventos Serverless para servicios de AWS.
- Podemos construir aplicaciones manejadas por eventos a escala utilizando los eventos generados desde nuestras aplicaciones.
- Usado para conectar nuestras aplicaciones con datos desde una gran cantidad de fuentes, aplicaciones SaaS integradas.
- Servicios de AWS como objetivos, tales como funciones Lambda de AWS.
- Formalmente llamados Amazon CloudWatch Events.


## Ventajas

- **Construir arquitecturas basadas en eventos:** Con EventBridge, nuestros destinatarios de eventos no necesitan preocuparse por las fuentes eventos, porque podemos filtrar y publicar directamente a EventBridge. Mejora la habilidad de desarrollo así como la resiliencia de la aplicación con con arquitecturas impulsadas por eventos acopladas de forma flexible.
- **Conexión con aplicaciones SaaS:** EventBridge ingiere datos de aplicaciones SaaS compatibles y los envía a servicios de AWS y destinos SaaS. Aplicaciones SaaS para activar flujos de trabajo para atención al cliente y operaciones comerciales.
- **Escribir menos código personalizado:** Puede ingerir, filtrar, transformar y entregar eventos sin escribir código personalizado. El registro de esquemas de EventBridge almacena una colección de esquemas de eventos fáciles de encontrar.
- **Reducir los gastos operativos:** No hay servidores que aprovisionar, parchar ni administrar. Escala automáticamente en función de la cantidad de eventos ingresados. Disponibilidad distribuida y tolerancia a fallas integradas. Capacidad nativa de reproducción y archivo de eventos.


## Conceptos clave

### Amazon EventBridge Events
Un evento indica un cambio en un ambiente tal como un ambiente de AWS o un servicio SaaS asociado. Los eventos son representados como objetos JSON y todos tienen una estructura similar, y los mismos campos de nivel superior.

```json
{
	"version": "0",
	"id": "guid",
	"detail-type": "EC2 Instance State-change Notification",
	"source": "aws.ec2",
	"account": "111122223333",
	"time": "2017-12-22T18:43:48Z",
	"region": "us-west-1",
	"resources": [
		"arn:aws:ec2:us-west-1:123456789012:instance/i-1234567890abcdef0"
	],
	"detail": {
		"instance-id": "i-123456789abcdef0",
		"state": "terminated"
	}
}
```

### Amazon EventBridge Rules
Una regla hace coincidir los eventos entrantes y los envía a los destinos para su procesamiento. Una sola regla puede enviar un evento a varios destinos, que luego se ejecutan en paralelo. Un patrón de evento define la estructura del evento y los campos con los que coincide una regla.

### Amazon EventBridge Targets
Un destino es un recurso o punto final al que EventBridge envía un evento cuando este coincide con el patrón de eventos definido para una regla. La regla procesa los datos del evento y envía la información relevante al destino.

### Amazon EventBrige Event Buses
Un bus de eventos es una canalización que recibe eventos. Las reglas asociadas con el bus de eventos evalúan los eventos a medida que llegan. Una política basada en recursos especifica qué eventos se deben permitir y qué entidades tienen permiso para crear o modificar reglas u objetivos para un evento.

```bash
# Ejecutar evento de EventBridge con archivo JSON
aws events put-events --entries file://checkoutbasketevents.json
```


# SQS

- Amazon SQS significa Simple Queue Service y son colas de mensajes totalmente administradas para microservicios, sistemas distribuidos y aplicaciones sin servidor.
- Nos permite desacoplar y escalar microservicios, sistemas distribuidos y aplicaciones sin servidor.
- Elimina la complejidad y la sobrecarga asociadas con la gestión y operación de middleware orientado a mensajes.
- Envía, almacena y recibe mensajes entre los componentes de software a cualquier volumen.
- Hay 2 tipos de colas de mensajes:
	- Las colas estándar ofrecen máximo rendimiento, pedidos con el mejor esfuerzo y entrega al menos una vez.
	- Las colas FIFO están diseñadas para garantizar que los mensajes se procesen exactamente una vez, en el orden exacto en que se envían.
- Integrar y desacoplar sistemas y componentes de software distribuidos.
- Proporciona una API de servicios web genérica a la que puede acceder mediante cualquier lenguaje de programación compatible con el SDK de AWS.


## Ventajas

- **Eliminar la sobrecarga administrativa:** AWS administra todas las operaciones en curso y la infraestructura subyacente necesarias para proporcionar un servicio de colas de mensajes altamente disponible y escalable. Las colas de SQS se crean de forma dinámica y se escalan automáticamente.
- **La durabilidad y la confiabilidad transmiten mensajes:** Amazon SQS los almacena en varios servidores. Las colas estándar admiten la entrega de mensajes al menos una vez, y las colas FIFO admiten el procesamiento de mensajes exactamente una vez. SQS bloquea los mensajes durante el procesamiento, de modo que varios productores puedan enviar y varios consumidores puedan recibir mensajes al mismo tiempo.
- **Escalabilidad, disponibilidad y rentabilidad:** SQS se escala de forma elástica con nuestra aplicación, por lo que no tenemos que preocuparnos por la planificación de la capacidad ni por el aprovisionamiento previo. No hay límite para la cantidad de mensajes por cola y las colas estándar brindan un rendimiento casi ilimitado.
- **Seguridad - mantenga seguros los datos confidenciales:** Amazon SQS intercambia datos confidenciales entre aplicaciones mediante el cifrado del lado del servidor (SSE) para cifrar cada cuerpo del mensaje.


# CloudFormation

- Modela, provisiona y administra recursos AWS usando IaC.
- Plataforma de automatización de infraestructura de AWS que despliega recursos AWS en una manera repetitiba, testeable y fácil de auditar.
- Usa archivos de plantilla para automatizar el setup de los recursos.
- Nos permite crear y aprovisionar despliegues de infraestructura AWS predecible y repetitiva.


# Cloud Development Kit (CDK)

- Framework de desarrollo de software de código abierto para definir nuestros recursos en la nube usando un lenguaje de programación familiar.
- Usa el poder de la familiaridad y expresividad  de la programación para modelar nuestras aplicaciones.
- Provee componentes de alto nivel llamados constructores que preconfiguran los recursos en la nube.
- Provee una librería de constructores en muchos lenguajes de programación para automatizar fácilmente infraestructura de AWS.
- Aprovisiona nuestros recursos en una manera segura y repetible a través de CloudFormation.
- Soporta TypeScript, JavaScript, Python, Java, Go y C#.


## Conceptos clave

### Apps
Incluyen todo lo necesario para desplegar nuestra aplicación en un ambiente en la nube.

### Stack
La unidad de despliegue en nuestro AWS CDK es llamado pila.

### Constructs
El bloque de construcción básico para aplicaciones AWS CDK. Un constructor representa un componente de nube.

### Environments
Cada instancia de pila en nuestra app AWS CDK es explícitamente o implícitamente asociada a un ambiente.


## Patrón constructor

### Nivel 1 (L1)
Representaciones directas de recursos de CloudFormation. Debe proveer todos los atributos requeridos de CloudFormation. Son nombradas CfnXyz.

### Nivel 2 (L2)
Representa un recurso en la nube en particular. Bucket S3 por ejemplo. No tenemos que configurar cada atributo. Es de alto nivel. La clase s3.Bucket representa un Amazon S3, tal como such as bucket.addLifeCycleRule().

### Nivel 3 (L3)
Representa un grupo de recursos en la nube que trabajan juntos para cumplir con una tarea en particular. Podemos crear un balanceador de carga ApplicationLoadBalancedFargateService. Constructores de alto nivel, los cuales llamamos patrones de llamado.

Para ver ejemplos oficiales de implementaciones con AWS CDK podemos ingresar en el siguiente [link](https://github.com/cdk-patterns/serverless).


## Iniciar proyecto CDK

```bash
npm install -g aws-cdk

cdk init app --language=typescript
```


## Comandos útiles

- `npm run build` compila TypeScript en JS.
- `npm run watch` observa los cambios y compila.
- `npm run test` realiza las pruebas unitarias de jest.
- `cdk deployment` implementa esta pila en tu cuenta/región de AWS predeterminada.
- `cdk diff` compara la pila implementada con el estado actual.
- `cdk synth` emite la plantilla CloudFormation sintetizada.
- `cdk destroy` para eliminar todos nuestros recursos.

> [!NOTE]
> Comandos para desplegar con AWS CDK
```bash
# Comandos para despliegue
cdk synth
cdk diff
cdk deploy
```

> [!IMPORTANT]
> Comandos para eliminar los recursos creados con CDK

```bash
cdk destroy
```