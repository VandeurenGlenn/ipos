import '../../ipos-system-element/index.js';
import './ipos-vibes-list.js';
import './ipos-vibes-playing';

export default system.define(class IposVibes extends system.Program(HTMLElement) {
  static get properties() {
    return system.merge(super.properties, {
      name: {
        value: 'Vibes'
      },
      /**
       * set singleClick mode for app
       */
      singleClick: {
        value: true
      },
      /**
       * disable fullScreenSupport
       */
      fullscreensupport: {
        value: true
      },

      nowPlaying: {
        observer: 'nowPlayingChanged'
      }
    })
  }

  get template() {
    return html`
    <style>
      :host {
        mixin(--css-column)
        width: 320px;
        height: 480px;
        pointer-events: auto;
        font-size: 20px;
      }

      ipos-vibes-list {
        height: calc(100% - 126px);
      }

      ipos-vibes-playing {
        height: 96px;
      }
    </style>
    <ipos-system-element name="${'name'}">
      <ipos-vibes-list></ipos-vibes-list>
      <ipos-vibes-playing></ipos-vibes-playing>
      <system-audio></system-audio>
    </ipos-system-element>
    `;
  }

  get list() {
    return this.shadowRoot.querySelector('ipos-vibes-list')
  }

  get audio() {
    return this.shadowRoot.querySelector('system-audio')
  }

  constructor() {
    super();

      (async () => {
        const db = await system.api.readLocal('system/db/music');
        // console.log(db);
        this.db = new Map(JSON.parse(db))
        // this.db = new Map(JSON.parse(db))
        console.log(this.db);
        this.list.items = this.db
      })()
  }

  play(src) {
    if (!this.audio.playing && this.audio.src === src) this.audio.resume()
    else if (this.audio.playing && this.audio.src === src) this.audio.pause()
    else this.audio.play(src);
    const { title, artist, cover } = this.db.get(src);

    console.log(title, artist, cover);
    this.shadowRoot.querySelector('ipos-vibes-playing').cover = cover;
    this.shadowRoot.querySelector('ipos-vibes-playing').title = title;
    this.shadowRoot.querySelector('ipos-vibes-playing').artist = artist;
  }

  clickEvent({path}) {
    console.log(path);
    const key = path[0].dataset.selection;
    if (key)
      if (this.iposElementFocused) {
        if (!isNaN(key)) {
          this.display.add({number: key})
        } else if (key === '+' || key === '-' || key === '/' || key === '*') {
          this.display.add({function: key})
        }
        else if (key === '=') this.display.calculate();
        else if (key === 'CLR') this.display.clean();
        else if (key === 'DEL') this.display.remove();
      }
  }

  keyEvent({ code, location, key }) {
    if (this.iposElementFocused) {
      super.keyEvent({ code, location, key });
      if (!isNaN(key)) {
        this.display.add({number: key})
      } else if (key === '+' || key === '-' || key === '/' || key === '*') {
        this.display.add({function: key})
      }
      else if (key === '=' || code === 13) this.display.calculate()
      else if (code === 27) this.display.clean();
      else if (key === 18) this.display.remove();
    }
  }
})
