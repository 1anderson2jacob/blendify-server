'use strict';

// 3rd party resources
const express = require('express'),
      cors = require('cors');

// Esoteric resources 
const errorHandler = require('./middleware/500.js');
const notFound = require('./middleware/404.js');
const authRouter = require('./auth/router.js');

// Prepare express app
const app = express();

// App level middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended:true }));

// Routes
app.use(authRouter);

// Catch-alls
app.use(notFound);
app.use(errorHandler);

let isRunning = false;

module.exports = {
  server: app,
  start: (port) => {
    if( !isRunning ) {
      app.listen(port, () => {
        isRunning = true;
        console.log(`Server up on ${port}`);
      });
    }
    else {
      console.log('Server is already running');
    }
  },
};