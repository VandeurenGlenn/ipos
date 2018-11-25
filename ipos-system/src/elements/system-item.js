export default system.define(class SystemItem extends system.ProgramBase(HTMLElement) {
  static get properties() {
    return system.merge(super.properties, {
      icon: {
        reflect: true,
        render: true
      },
      name: {
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
          cursor: pointer;
          pointer-events: auto;
          height: 48px;
          box-sizing: border-box;
          padding: 10px;
          font-size: 16px;
          text-transform: uppercase;
        }
        system-icon {
          pointer-events: none;
          padding-right: 12px;
        }
      </style>
      <system-icon icon="${'icon'}"></system-icon>
      ${'name'}
    `;
  }
})
