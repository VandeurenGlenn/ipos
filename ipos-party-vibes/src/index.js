import '../../ipos-system-element/index.js';

export default system.define(class IposVibes extends system.Program(HTMLElement) {
  static get properties() {
    return system.merge(super.properties, {
      name: {
        value: 'Audio'
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
        value: false
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
    </style>
    <vibes-list></vibes-list>
    <system-audio src="user/music/sick.mp3"></system-audio>
    `;
  }

  constructor() {
    super();
  }

  clickEvent({path}) {
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
