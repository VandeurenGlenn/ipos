
export default system.define(class iposWebview extends HTMLElement {
  static get observedAttributes() {
    return ['url'];
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'})
    this.shadowRoot.innerHTML = `
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
