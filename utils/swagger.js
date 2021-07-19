const express = require('express');
let swaggerHost = require('../config/app-config').swaggerHost;



let options = {
    swaggerDefinition: {
      info: {
        description: '',
        title: 'TEST Structure',
        version: '1.0.0'
      },
      host: swaggerHost,
      basePath: '/api/v1',
      produces: [
        "application/json",
        "application/xml"
      ],
      schemes: ['http', 'https'],
      securityDefinitions: {
        JWT: {
          type: 'apiKey',
          in: 'header',
          name: 'x-access-token',
          description: "JSON web token",
        }
      }
    },
    basedir: __dirname, //app absolute path
    files: ['../router/api/**/*.js'] //Path to the API handle folder
  };


  module.exports = options;