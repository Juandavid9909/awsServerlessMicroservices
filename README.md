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