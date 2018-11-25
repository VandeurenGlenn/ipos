export default system.define(class SystemAudio extends system.ProgramBase(HTMLElement) {
  static get properties() {
    return system.merge(super.properties, {
      name: {
        value: 'Audio'
      },
      src: {
        observer: '_srcChanged'
      }
    })
  }

  get template() {
    return html`
    <style>
      :host {
        display: none;
      }
    </style>
    <audio></audio>
    `;
  }

  get audioElement() {
    return this.shadowRoot.querySelector('audio');
  }

  constructor() {
    super();
    this.render()
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.source = this.audioCtx.createMediaElementSource(this.audioElement);
    this.gain = this.audioCtx.createGain();

    this.source.connect(this.gain)
    this.gain.connect(this.audioCtx.destination)
  }

  _srcChanged() {
    // if (this.src) this.audioElement.src = this.src;
    // if (this.playing) return alert('you changed song input while still playing'); // for dj's
    if (this.src) this.audioElement.src = this.src;
  }

  async play(src) {
    if (src) this.src = src;
    this.audioElement.play();
    this.playing = true;
  }

  pause() {
    if (this.playing) this.audioCtx.suspend();
    this.playing = false;
  }

  resume() {
    if (!this.playing) this.audioCtx.resume();
    // if (!this.playing) this.audioElement.resume();
    this.playing = true;
    // system.api.resume()
  }


})
