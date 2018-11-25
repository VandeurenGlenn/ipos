
export default system.define(class SystemWebview extends HTMLElement {
  static get observedAttributes() {
    return ['url'];
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'})
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
        }
        iframe {
          height: 100%;
          width: 100%;
        }
      </style>
      <iframe></iframe>
    `;
  }

  get frame() {
    return this.shadowRoot.querySelector('iframe')
  }

  set url(value) {
    this.frame.src = value;
  }

  get url() {
    return this.frame.src;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = newValue
  }
})
