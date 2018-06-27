var express = require("express");
var bodyParser = require("body-parser");
var kafka = require("node-rdkafka");
var app = express();

app.use(bodyParser.json({
    type: "*/*"
}));

// See https://github.com/expressjs/body-parser/issues/122
app.use(function(err, req, res, next) {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      console.error('Bad JSON');
      res.status(400).send();
    } else {
        console.error(err);
    }    
});

var producer = new kafka.Producer({
    'metadata.broker.list': process.env.KAFKA_BROKERS,
    'message.send.max.retries': 10,
    'socket.keepalive.enable': true,
    'queue.buffering.max.messages': 200000,
    'queue.buffering.max.ms': 2000,
    'batch.num.messages': 1000000,
    'socket.send.buffer.bytes': 100000000,
    'socket.receive.buffer.bytes': 100000000,
    'dr_cb': true,
});

app.get('/ping', (req, res) => res.send('pong'))

// Check if we can get the topic metadata of __consumer_offsets
// as per https://github.com/Blizzard/node-rdkafka/issues/217
app.get("/healthz", function(req, res) {
    var opts = {
        topic: '__consumer_offsets',
        timeout: 10000
      };
      
      producer.getMetadata(opts, function(err, metadata) {
        if (err) {
          console.error('Error getting metadata');
          console.error(err);
          res.sendStatus(500);
        } else {
          console.log('Got metadata');
          res.sendStatus(200);
        }
      });
});

app.post("/produce/:topic", function (req, res) {    
    try {       
        producer.produce(
          req.params.topic,          
          null,
          Buffer.from(JSON.stringify(req.body)),
          null,
          Date.now(),
        );
      } catch (err) {
        console.error('A problem occurred when sending our message');
        console.error(err);
        res.sendStatus(500);
      }
      res.sendStatus(200);
});

producer.setPollInterval(100);
producer.connect();

producer.on('ready', function() {
    var server = app.listen(process.env.PORT, function () {
        console.log("app running on port: ", server.address().port);
    });
});

producer.on('event.error', function(err) {
    console.error('Error from producer');
    console.error(err);
})
