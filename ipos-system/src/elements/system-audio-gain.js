export default system.define(class SystemAudioGain extends system.ProgramBase(HTMLElement) {
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
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioCtx.createAnalyser();
  }

  _srcChanged() {
    // if (this.src) this.audioElement.src = this.src;

  }


})
