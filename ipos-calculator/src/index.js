import '../../ipos-system-element/index.js';
import './ipos-calculator-display.js';

export default system.define(class IposCalculator extends system.Program(HTMLElement) {
  static get properties() {
    return system.merge(super.properties, {
      keys: {
        value: []
      },
      name: {
        value: 'calculator'
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
      ipos-calculator-display {
        flex: 1;
        border-bottom: 1px solid rgba(0, 0, 0, 0.21);
        background: #e3f2fd;
      }
      .keys {
        display: flex;
        flex-flow: row wrap;
        background: #607D8B;
        color: #fff;
      }
      .key {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        box-sizing: border-box;
        height: calc(480px / 7);
        width: calc(320px / 5);
        cursor: pointer;
      }
      .key-3, .key-4, .key-8, .key-9, .key-13, .key-14, .key-18, .key-19 {
        background: #455a64ad;
      }
      ipos-system-element {
        height: 100%;
      }
    </style>
    <ipos-system-element name="calculator" fullscreensupport="${'fullscreensupport'}">
      <ipos-calculator-display></ipos-calculator-display>
      <span class="keys">
        ${this.keys ? this.keys.map((key, i) => `<span class="key key-${i}" data-selection="${key}">${key}</span>`) : ''}
      </span>
    </ipos-system-element>
    `;
  }

  get display() {
    return this.shadowRoot.querySelector('ipos-calculator-display');
  }

  constructor() {
    super();
    this.keys = [7, 8, 9, 'CLR', 'DEL', 4, 5, 6, '*', '/', 1, 2, 3, '-', '', '.', 0, '', '+', '='];
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
