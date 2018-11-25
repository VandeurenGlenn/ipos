'use strict';

// const express = require('express');
// const serveIndex = require('serve-index');
// const server = express();
const os = require('../out/boot');

// server.use('/', express.static('node_modules'))
// server.get('/', () => {
//
// })
// server.use('/', express.static('node_modules'));
// server.use('/', express.static('./../out/boot'))
// server.use('/', express.static('../out'))
// server.use('/', express.static('../out/system'))
//
// server.cwd = '/out';
// server.listen('4040', async () => {
//   await ;
//   console.log('serving on http://localhost:4040/');
// })
os.boot()
