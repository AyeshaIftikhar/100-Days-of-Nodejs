const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const errorHandler = require('./middlewares/errorHandler');
const routes = require('./routes');
const config = require('./config');

class App {
  constructor() {
    this.app = express();
    this._initializeMiddlewares();
    this._initializeRoutes();
    this._initializeErrorHandling();
  }

  _initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
  }

  _initializeRoutes() {
    this.app.use(config.app.apiPrefix, routes);
  }

  _initializeErrorHandling() {
    this.app.use(errorHandler);
  }
}

module.exports = new App().app;