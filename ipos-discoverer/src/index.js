import './drawer.js';
import './panels.js';
import './devices.js';
export default system.define(class IposDiscoverer extends system.Program(HTMLElement) {
  static get properties() {
    return system.merge(super.properties, {
      name: {
        value: 'discoverer'
      },
      drives: {
        value: [],
        observer: 'drivesChanged'
      }
    })
  }

  get drawer() {
    return this.shadowRoot.querySelector('ipos-discoverer-drawer');
  }
  constructor() {
    super();
    this._onSelected = this._onSelected.bind(this)
  }

  connectedCallback() {
    super.connectedCallback();

    this.drawer.addEventListener('selected', this._onSelected)
  }

  _onSelected() {
    this.shadowRoot.querySelector(`ipos-discoverer-${this.drawer.selected}`).stamp()
    // this.selected.stamp()
  }

  get template() {
    return html`
      <style>
        :host {
          mixin(--css-column)
          width: 960px;
          height: 480px;
          pointer-events: auto;
          font-size: 16px;
          background: #fff;
        }
        header {
          mixin(--css-row)
          height: 30px;
          width: 100%;
        }
        main {
          display: flex;
          flex-direction: row;
          height: calc(100% - 30px);
          position: absolute;
          top: 30px;
        }
        section {
          mixin(--css-column)
        }
        strong, .device {
          mixin(--css-row)
          align-items: flex-end;
          overflow: hidden;
          white-space: nowrap;
        }
        ipos-system-element {
          height: 100%;
        }
      </style>
      <ipos-system-element name="discoverer">
        <header>

        </header>

        <main>
          <ipos-discoverer-drawer>
            <system-item name="devices" icon="devices">devices</system-item>
            <system-item name="files" icon="folder">files</system-item>
            <system-item name="spaces" icon="folder">spaces</system-item>
            <system-item name="orbits" icon="folder">orbits</system-item>
          </ipos-discoverer-drawer>
          <ipos-discoverer-panels class="content">
            <ipos-discoverer-devices name="devices"></ipos-discoverer-devices>
            <ipos-discoverer-files name="files"></ipos-discoverer-files>
            <ipos-discoverer-spaces name="spaces"></ipos-discoverer-spaces>
            <ipos-discoverer-orbits name="orbits"></ipos-discoverer-orbits>
          </ipos-discoverer-panels>
        </main>
      </ipos-system-element>
    `;
  }
});
