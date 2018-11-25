import Speaker from 'speaker';
import {Transform} from 'stream';
export default class AudioOutput extends Transform {
  constructor(format) {
    super();

    this.playing = false;
    this.paused = false;
    this.speaker = new Speaker(format)
    this.items = []
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
    this.items.forEach(p => this.push(p))
  }

  _transform(chunk, enc, cb) {
    if (this.paused) {
      this.items.push(chunk)
      this.resume = () => {
        this.items.forEach(p => cb(null, p))
      }
    } else {
      cb(null, chunk)
    }
  }
}
