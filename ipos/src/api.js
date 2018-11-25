import { promisify } from 'util';
import { readFile, writeFile, createReadStream } from 'fs';
import { createServer } from 'http';
import Audio from './audio.js';
import server from '../node_modules/socket-request-server/src/index';
import drivelist from 'drivelist'

const read = promisify(readFile);
const write = promisify(writeFile);
const list = promisify(drivelist.list);

const audio = new Audio();
// node communication api
server({ port: 5005 }, {
  programs: async ({path, id}, response) => {
    console.log(path);
    // if (!path)
      // return response.error('Expected path to be defined');
    try {
      const data = await read('system/program.index', 'base64');
        console.log(response.url, data);
      response.send(data);
    } catch (error) {
      console.log(error);
      if (error.code === 'ENOENT') {
        await write('system/program.index', '[]');
        response.send(Buffer.from('[]').toString('base64'))
      } else {
        response.error(error);
      }
    }
  },
  readLocal: async ({path, id}, response) => {
    if (!path)
      return response.error('Expected path to be defined');
    try {
      const data = await read(path, 'base64');
      response.send(data);
    } catch (error) {
      console.log(error);
      if (error.code === 'ENOENT') {
        await write(path, '[]');
        response.send(Buffer.from('[]').toString('base64'))
      } else {
        response.error(error);
      }

    }
  },
  writeLocal: async ({path, content}, response) => {
    if (!path || content === undefined)
      return response.error('Expected path & data to be defined');

    try {
      await write(path, JSON.stringify(content));
      response.send('ok')
    } catch (error) {
      console.log(error);
      response.error(error);
    }
  },
  read: async ({cid}, response) => {
    if (!cid)
      return response.error('Expected cid to be defined');

    try {
      const block = await ipfs.get.put(object)
      response.send(block)
    } catch (error) {
      response.error(error);
    }
  },
  write: async ({object}, response) => {
    if (!object && typeof object !== 'object')
      return response.error('Expected object to be defined & typeof object');

    try {
      await ipfs.block.put(object)
      response.send('ok')
    } catch (error) {
      response.error(error);
    }
  },
  play: async (path, response) => {
    response.send(audio.play(path))
  },
  pause: async (path, response) => {
    audio.pause(path)
  },
  resume: async (path, response) => {
    audio.resume(path)
  },
  drives: async (object, response) => {
    try {
      const drives = await list()
      // console.log(drives);
      // console.log(drives[1].mountpoints[0]);
      response.send(new Buffer.from(JSON.stringify(drives)).toString('base64'))
    } catch (error) {
      response.error(error)
    }
  }
})
