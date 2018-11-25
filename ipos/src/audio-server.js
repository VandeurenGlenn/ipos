import express from 'express';
import { promisify } from 'util';
import { readFile, writeFile, createReadStream } from 'fs';
import {watch} from 'chokidar';
import id3 from './id3-parser';
import { join } from 'path';
import resizeImage from './img-resize';

const read = promisify(readFile);
const write = promisify(writeFile);

const musicFolder = __dirname.replace('boot', 'user/music')
const audioApi = express();

(async () => {
  let ignored;
  let db;

  const updateDB = song => {
    db.push(song)
    write('system/db/music', JSON.stringify(db))
  }

  try {
    db = await read('system/db/music')
    db = JSON.parse(db.toString())
  } catch (e) {
    db = []
    await write('system/db/music', JSON.stringify(db))
  }
  const writeid3 = path => new Promise(async (resolve, reject) => {
    const file = join('user/music', path);
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
    })

    await resizeImage({
      path: filename,
      buffer: picture[0].data,
      width: 128,
      height: 128
    })

    await resizeImage({
      path: filename,
      buffer: picture[0].data,
      width: 600,
      height: 600
    })

    const song = [file, {
      title,
      album,
      artist,
      year,
      cover
    }]
    if (db.indexOf(song) === -1) updateDB(song)
    resolve()
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
    ignored = await read('system/music')
    ignored = JSON.parse(ignored.toString())
  } catch (e) {
    await write('system/music', JSON.stringify([]))
    ignored = []
  }

  const musicWatcher = watch('**.{mp3,ogg,webm,aac,mp4,flac,wav}', {
    ignored,
    cwd: musicFolder
  });

  musicWatcher.on('add', path => {
    ignored.push(path)
    write('system/music', JSON.stringify(ignored))
    console.log(path);
    writeid3(path);
  })
})()
audioApi.use('/', express.static(musicFolder))
audioApi.listen('20', async () => {
  // await os.boot();
  console.log('audio server ready on http://localhost:20/');
});
