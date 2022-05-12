const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('morgan');
const compression = require('compression');
const app = express();
const options = require('../utils/swagger');
const expressSwagger = require('express-swagger-generator')(app);


expressSwagger(options);
app.enable("trust proxy"); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
app.use(compression());
app.use(cors());
app.use(bodyParser.json());

process.on('SIGINT', () => {
    console.log("stopping the server", 'info');
    process.exit();
})

process.on('uncaughtException', function(err) {
  
  // Handle the error safely
  console.log("unhandled exception: ", err)
})

logger.token('id', function getId(req) {
    return req.id
});

logger.token('req', function (req) {
    return JSON.stringify(req.body)
});

let loggerFormat = 'Logger -- :id [:date[web]] ":method :url" :status :response-time :req ';

let routes = require('../router')(app);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error)
  })
  
  app.use((error, req, res, next) => {
    console.log(error)
    res.status(error.status || 500)
    res.json({
      error: {
        message: error
      }
    })
  })

  module.exports = app;