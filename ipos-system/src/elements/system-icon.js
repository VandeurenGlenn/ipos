import '../../node_modules/custom-svg-icon/src/custom-svg-icon.js';

export default system.define(class SystemIcon extends system.ProgramBase(HTMLElement) {
  static get properties() {
    return system.merge(super.properties, {
      icon: {
        reflect: true,
        render: true
      }
    })
  }
  constructor() {
    super();
  }
  get template() {
    return html`
      <style>
        :host {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        custom-svg-icon {
          pointer-events: none;
        }
      </style>
      <custom-svg-icon icon="${'icon'}"></custom-svg-icon>
    `;
  }
})
