import './panel.js';
import './panel-tree.js';

export default system.define(class IposDiscovererDevices extends system.ProgramBase(HTMLElement) {

  constructor() {
    super()
  }

  connectedCallback() {
    super.connectedCallback();
    this.stamp()
  }

  stamp() {
    (async () => {
      const drives = await system.api.drives()
      console.log(drives);
      this.drives = JSON.parse(drives);
      this.drives.forEach(({mountpoints, description, busType}) => {
        const mountpoint = mountpoints[0].path.replace(':\\', '');
        let el = this.querySelector(`span[mountpoint=${mountpoint}]`);
        if (!el) {
          el = document.createElement('span')

          el.classList.add('device');
          el.setAttribute('mountpoint', mountpoint);
          const icon = busType === 'USB' ? 'usb' : 'storage';
          el.innerHTML = `<system-item icon="${icon}" name="${mountpoints[0].path} - ${description}"></system-item>`
          this.appendChild(el)
        }

      })
    })()
  }

  get template() {
    return html`
    <style>
      :host {
        mixin(--css-column)
        height: 100%;
      }
    </style>
    <panel-tree>
    <ipos-discoverer-panel>
      <slot></slot>
    </ipos-discoverer-panel>
    </panel-tree>
    `;
  }
})
