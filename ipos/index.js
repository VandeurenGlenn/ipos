'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var util = require('util');
var fs = require('fs');
require('http');
var server = _interopDefault(require('socket-request-server'));

const loaded = {};

const needsLoad = src => !loaded[src];

const load = (src, {
  module = false,
  target = document.querySelector('body')
}) => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  if (module) script.setAttribute('type', 'module');
  script.onload = () => {
    loaded[src] = true;
    resolve();
  };
  script.onerror = error => reject(error);
  script.src = src;
  target.appendChild(script);
});

var load$1 = src => {if (needsLoad(src)) load(src);};

const opn = require('opn');
const { type } = require('os');
const os = type();
var boot = (async () => {
  Promise.resolve().then(function () { return api; });

  opn('http://localhost:4040/ipos/index.html', { app: ['chrome', '--kiosk'] });
});

const join = paths => [paths].reduce((p, c) => { p += `/${c}`;}, '');

/**
 * Load basic os dependencies
 *
 * @param {object} flags Enable/disable features/experimental-features
 * @param {boolean} flags.rescueMode Boot into os disabling everything except os packages
 * @return Promise
 */
const loadOS = flags => new Promise(async (resolve, reject) => {
  const packages = ['desktop', 'clock', 'launcher'].map(name => join([packageLocation, name]));
  // load apps that are defined in startup
  // const apps = startup.map(name => join([appLocation, name]));

  try {
    await load$1(packages);
    // TODO: should launcher load apps?
    await load$1(apps);
    resolve(); // everything loaded
  } catch (e) {
    reject(e);
  }
});


var index = {loadOS, boot, load: load$1};

const read = util.promisify(fs.readFile);
const write = util.promisify(fs.writeFile);

// node communication api
server({ port: 5005 }, {
  readLocal: async ({path}, response) => {
    console.log(path);
    if (!path)
      return response.error('Expected path to be defined');

    try {
      const data = await read(path, 'base64');
      console.log(data);
      response.send(data);
    } catch (error) {
      console.log(error);
      response.error(error);
    }
  },
  writeLocal: async ({path, content}, response) => {
    console.log(path, content);
    if (!path || content === undefined)
      return response.error('Expected path & data to be defined');

    try {
      await write(path, JSON.stringify(content));
      response.send('ok');
    } catch (error) {
      response.error(error);
    }
  },
  read: async ({cid}, response) => {
    if (!cid)
      return response.error('Expected cid to be defined');

    try {
      const block = await ipfs.get.put(object);
      response.send(block);
    } catch (error) {
      response.error(error);
    }
  },
  write: async ({object}, response) => {
    if (!object && typeof object !== 'object')
      return response.error('Expected object to be defined & typeof object');

    try {
      await ipfs.block.put(object);
      response.send('ok');
    } catch (error) {
      response.error(error);
    }
  }
});

var api = /*#__PURE__*/Object.freeze({

});

module.exports = index;
