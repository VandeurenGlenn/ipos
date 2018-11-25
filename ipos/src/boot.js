import express from 'express';
import opn from 'opn';
import { type } from 'os';

const server = express();
const os = type();

export default (async () => {
  import('./api.js');
  import('./audio-server.js');
  let chrome = 'chrome';

  if (os === 'Darwin') {
    chrome = 'google chrome';
  } else if (os === 'Linux') {
    chrome = 'google-chrome';
  }
  console.log(__dirname);
  server.use('/', express.static(__dirname.replace('boot', '')))
  server.use('/', express.static(__dirname))
  server.listen('4040', async () => {
    // await os.boot();
    console.log('serving on http://localhost:4040/');
  })

  opn('http://localhost:4040/index.html', { app: [chrome, '--kiosk'] })
})()
