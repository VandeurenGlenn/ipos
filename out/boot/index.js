function _interopDefault$1 (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var express = _interopDefault$1(require('express'));
var opn = _interopDefault$1(require('opn'));
var os = require('os');
var fs = require('fs');
var util = require('util');
var Speaker = _interopDefault$1(require('speaker'));
require('stream');
var decode = _interopDefault$1(require('audio-decode'));
require('audio-play');
require('audio-loader');
var download = _interopDefault$1(require('download'));
var lame = _interopDefault$1(require('lame'));
var websocket = require('websocket');
require('http');
var drivelist = _interopDefault$1(require('drivelist'));
var musicmetadata = _interopDefault$1(require('musicmetadata'));
var sharp = _interopDefault$1(require('sharp'));
var chokidar = require('chokidar');
var path = require('path');

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

const server = express();
const os$1 = os.type();

var boot = (async () => {
  Promise.resolve().then(function () { return api; });
  Promise.resolve().then(function () { return audioServer; });
  let chrome = 'chrome';

  if (os$1 === 'Darwin') {
    chrome = 'google chrome';
  } else if (os$1 === 'Linux') {
    chrome = 'google-chrome';
  }
  console.log(__dirname);
  server.use('/', express.static(__dirname.replace('boot', '')));
  server.use('/', express.static(__dirname));
  server.listen('4040', async () => {
    // await os.boot();
    console.log('serving on http://localhost:4040/');
  });

  opn('http://localhost:4040/index.html', { app: [chrome, '--kiosk'] });
})();

const join = paths => [paths].reduce((p, c) => { p += `/${c}`;}, '');

const read = util.promisify(fs.readFile);

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

class Audio {
  constructor() {
    // this.reader.pipe(this.speaker);
  }

  volumeDown() {

  }

  volumeUp() {

  }

  mute() {

  }

  async toAudioBuffer(file) {
    const audioBuffer = await decode(file);
  }

  beforPlay(path$$1) {
    this.checkSource(path$$1);
  }

  playUrl(url) {
    this.decoder = this.getDecoder(url);
    this.stream = download(url);
    this.decoded = this.stream.pipe(this.decoder);//.on('format', format => {
        // this.format = format;
    this.speaker = new Speaker();
    this.audio = this.decoded.pipe(this.speaker);
    this.pause = () => {
      this.decoded.unpipe(this.speaker);
    };
    this.resume = () => {
      this.decoded.pipe(this.speaker);
    };
        // merge(this.audio, new Speaker(format))
        // this.decoded.pipe(this.speaker);
      // });
  }

  getDecoder(path$$1) {
    if (path$$1.includes('.mp3')) return new lame.Decoder();
  }
  // TODO: read ... so pausing is realtime
  play({path: path$$1}) {
    if (path$$1.includes('https://')) return this.playUrl(path$$1)
    this.decoder = this.getDecoder(path$$1);
    return fs.createReadStream(path$$1, {highWaterMark: 16}).pipe(this.decoder);
    this.decoded = this.stream.pipe(this.decoder);//.on('format', format => {
        // this.format = format;
        return this.decoded
    // this.speaker = new Speaker();
    // this.audio = this.decoded.pipe(this.speaker);
    // this.pause = () => {
    //   this.speaker.removeAllListeners('close');
    //   this.decoded.unpipe(this.speaker)
    // }
    // this.resume = () => {
    //   this.decoded.pipe(this.speaker)
    // }
    // createReadStream(path)
    //   .pipe(new lame.Decoder())
    //   .on('format', function (format) {
    //     this.pipe(new Speaker(format));
    //   });

  }

  // pipe(stream) {
  //   stream.pipe(this.speaker)
  // }
}

/**
 * @module socketResponse
 *
 * @param {object} connection socket connection
 * @param {string} route the route to handle
 */
var socketConnection = request => {
  // console.log(request);
  const connection = request.accept('echo-protocol', request.origin);
  console.log((new Date()) + ' Connection accepted.');
  return connection;
};

/**
 * @module socketResponse
 *
 * @param {object} connection socket connection
 * @param {string} url the request url
 */
var response = (connection, url, id) => {
  const send = (data = 'ok', status = 200) => connection.send(
    JSON.stringify({id, url, status, value: data})
  );
  const error = data => connection.send(JSON.stringify({id, url, value: data}));
  return {
    send,
    error
  }
};

const socketRequestServer = ({httpServer, port}, routes) => {
  if (!httpServer) {
    const { createServer } = require('http');
    httpServer = createServer();

    httpServer.listen(port, () => {
      console.log(`listening on ${port}`);
    });
  }

	const socketServer = new websocket.server({
  	httpServer,
  	autoAcceptConnections: false
	});

	const originIsAllowed = origin => {
  	// put logic here to detect whether the specified origin is allowed.
  	return true;
	};

  const connections = [];
  let connection;

	socketServer.on('request', request => {
  	if (!originIsAllowed(request.origin)) {
  		// Make sure we only accept requests from an allowed origin
  		request.reject();
  		console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
  		return;
  	}

    connection = socketConnection(request);
    connections.push(connection);

    const routeHandler = message => {
      let data;
      if (message.type) {
        switch (message.type) {
          case 'binary':
            data = message.binaryData.toString();
            break;
          case 'utf8':
            data = message.utf8Data;
            break;
        }
      }
      const { route, params, url, id } = JSON.parse(data);
      if (routes[url]) routes[url](params, response(connection, url, id));
      else return `nothing found for ${message.url}`;
    };

    connection.on('message', routeHandler);
	});

  return {
    close: () => socketServer.shutDown(),
    connections: () => connections
  };
};

const read$1 = util.promisify(fs.readFile);
const write = util.promisify(fs.writeFile);
const list = util.promisify(drivelist.list);

const audio = new Audio();
// node communication api
socketRequestServer({ port: 5005 }, {
  programs: async ({path: path$$1, id}, response) => {
    console.log(path$$1);
    // if (!path)
      // return response.error('Expected path to be defined');
    try {
      const data = await read$1('system/program.index', 'base64');
        console.log(response.url, data);
      response.send(data);
    } catch (error) {
      console.log(error);
      if (error.code === 'ENOENT') {
        await write('system/program.index', '[]');
        response.send(Buffer.from('[]').toString('base64'));
      } else {
        response.error(error);
      }
    }
  },
  readLocal: async ({path: path$$1, id}, response) => {
    if (!path$$1)
      return response.error('Expected path to be defined');
    try {
      const data = await read$1(path$$1, 'base64');
      response.send(data);
    } catch (error) {
      console.log(error);
      if (error.code === 'ENOENT') {
        await write(path$$1, '[]');
        response.send(Buffer.from('[]').toString('base64'));
      } else {
        response.error(error);
      }

    }
  },
  writeLocal: async ({path: path$$1, content}, response) => {
    if (!path$$1 || content === undefined)
      return response.error('Expected path & data to be defined');

    try {
      await write(path$$1, JSON.stringify(content));
      response.send('ok');
    } catch (error) {
      console.log(error);
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
  },
  play: async (path$$1, response) => {
    response.send(audio.play(path$$1));
  },
  pause: async (path$$1, response) => {
    audio.pause(path$$1);
  },
  resume: async (path$$1, response) => {
    audio.resume(path$$1);
  },
  drives: async (object, response) => {
    try {
      const drives = await list();
      // console.log(drives);
      // console.log(drives[1].mountpoints[0]);
      response.send(new Buffer.from(JSON.stringify(drives)).toString('base64'));
    } catch (error) {
      response.error(error);
    }
  }
});

var api = /*#__PURE__*/Object.freeze({

});

var id3 = path$$1 => new Promise((resolve, reject) => {
  const stream$$1 = fs.createReadStream(path$$1);
  musicmetadata(stream$$1, (error, meta) => {
    if (error) reject(error);
    stream$$1.close();
    resolve(meta);
  });
});

/**
 * @param {buffer} path
 */
var resizeImage = async ({path: path$$1, buffer, width = 64, height = 64, out}) => {
  if (!path$$1) throw 'Expected path to be defined';
  if (!buffer) buffer = await read(path$$1);
  if (!out) {
    if (width === height) out = `${path$$1}-${width}.webp`;
    else out = `${path$$1}-${width}-${height}.webp`;
  }

  sharp(buffer)
  .resize(width, height)
  .toFile(out, (error, info) => {
    if (error) throw error;
  });
};

const read$2 = util.promisify(fs.readFile);
const write$1 = util.promisify(fs.writeFile);

const musicFolder = __dirname.replace('boot', 'user/music');
const audioApi = express();

(async () => {
  let ignored;
  let db;

  const updateDB = song => {
    db.push(song);
    write$1('system/db/music', JSON.stringify(db));
  };

  try {
    db = await read$2('system/db/music');
    db = JSON.parse(db.toString());
  } catch (e) {
    db = [];
    await write$1('system/db/music', JSON.stringify(db));
  }
  const writeid3 = path$$1 => new Promise(async (resolve, reject) => {
    const file = path.join('user/music', path$$1);
    const { title, artist, album, year, picture } = await id3(file);
    const filename = file.replace(/.mp3|.ogg|.webm|.aac|.mp4|.flac|.wav/, '');
    const cover = `${filename}-64.webp`;
    console.log(title);
    // console.log(picture);
    await resizeImage({
      path: filename,
      buffer: picture[0].data,
      width: 64,
      height: 64
    });

    await resizeImage({
      path: filename,
      buffer: picture[0].data,
      width: 128,
      height: 128
    });

    await resizeImage({
      path: filename,
      buffer: picture[0].data,
      width: 600,
      height: 600
    });

    const song = [file, {
      title,
      album,
      artist,
      year,
      cover
    }];
    if (db.indexOf(song) === -1) updateDB(song);
    resolve();
    // id3({ file, type: id3.OPEN_LOCAL }, (err, tags) => {
    //   const { title, album, artist, year } = tags;
    //   const { image, track } = tags.v2;
    //   const cover = file.replace(/.mp3|.ogg|.webm|.aac|.mp4|.flac|.wav/, '.cover')
    //   write(cover, new Buffer.from(image.data, 'arrayBuffer'))
    //   const song = [path, {
    //     title,
    //     album,
    //     artist,
    //     year,
    //     track,
    //     cover
    //   }]
    //   if (db.indexOf(song) === -1) updateDB(song)
    // })
  });

  try {
    ignored = await read$2('system/music');
    ignored = JSON.parse(ignored.toString());
  } catch (e) {
    await write$1('system/music', JSON.stringify([]));
    ignored = [];
  }

  const musicWatcher = chokidar.watch('**.{mp3,ogg,webm,aac,mp4,flac,wav}', {
    ignored,
    cwd: musicFolder
  });

  musicWatcher.on('add', path$$1 => {
    ignored.push(path$$1);
    write$1('system/music', JSON.stringify(ignored));
    console.log(path$$1);
    writeid3(path$$1);
  });
})();
audioApi.use('/', express.static(musicFolder));
audioApi.listen('20', async () => {
  // await os.boot();
  console.log('audio server ready on http://localhost:20/');
});

var audioServer = /*#__PURE__*/Object.freeze({

});

module.exports = index;
