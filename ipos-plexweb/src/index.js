export default system.define(class iposPlexweb extends system.ProgramBase(HTMLElement) {
  static get properties() {
    return system.merge(super.properties, {
      name: {
        value: 'plexweb'
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
          flex-direction: column;
          height: 900px;
          width: 1920px;
        }
        ipos-system-element {
          height: 100%;
        }
      </style>
      <ipos-system-element name="${'name'}">
        <system-webview url="http://127.0.0.1:32400/web/index.html"></system-webview>
      </ipos-system-element>

    `
  }
})
