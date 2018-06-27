# Kafka REST Nodejs

A simple REST proxy for Kafka. Only one endpoint is currently available for producing messages to a **preexisting** topic.

`/produce/{topic}` Requires a JSON payload message.