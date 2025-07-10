const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const uploadRouter = require('./routes/upload');
const { cleanOldFiles } = require('./utils/fileCleaner');
const path = require('path');

class App {
  constructor() {
    this.app = express();
    this._initializeMiddlewares();
    this._initializeRoutes();
    this._initializeCleanup();
  }

  _initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(morgan('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  _initializeRoutes() {
    this.app.use('/api/upload', uploadRouter);
    
    // Serve uploaded files statically
    this.app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  }

  _initializeCleanup() {
    cleanOldFiles();
  }
}

module.exports = new App().app;