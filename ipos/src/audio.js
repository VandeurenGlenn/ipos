import Speaker from 'speaker';
import {Readable} from 'stream';
import decode from 'audio-decode'
import play from 'audio-play';
import load from 'audio-loader';
import {createReadStream} from 'fs';
import download from 'download';
import lame from 'lame';
class DecodeStream extends Readable {
  constructor() {
    super({objectMode: true});
  }

  _read(path, cb) {
    decode().then(buffer => {
      console.log(buffer);
    })
  }
}
export default class Audio {
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

  beforPlay(path) {
    this.checkSource(path)
  }

  playUrl(url) {
    this.decoder = this.getDecoder(url)
    this.stream = download(url);
    this.decoded = this.stream.pipe(this.decoder)//.on('format', format => {
        // this.format = format;
    this.speaker = new Speaker();
    this.audio = this.decoded.pipe(this.speaker);
    this.pause = () => {
      this.decoded.unpipe(this.speaker)
    }
    this.resume = () => {
      this.decoded.pipe(this.speaker)
    }
        // merge(this.audio, new Speaker(format))
        // this.decoded.pipe(this.speaker);
      // });
  }

  getDecoder(path) {
    if (path.includes('.mp3')) return new lame.Decoder();
  }
  // TODO: read ... so pausing is realtime
  play({path}) {
    if (path.includes('https://')) return this.playUrl(path)
    this.decoder = this.getDecoder(path)
    return createReadStream(path, {highWaterMark: 16}).pipe(this.decoder);
    this.decoded = this.stream.pipe(this.decoder)//.on('format', format => {
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
