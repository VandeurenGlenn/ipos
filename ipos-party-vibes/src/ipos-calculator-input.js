export default system.define(class IposCalculatorInput extends system.ProgramBase(HTMLElement) {
  static get properties() {
    return {
      inputs: {
        value: []
      }
    }
  }
  get template() {
    return html`
      <style>
        :host  {
          display: flex;
          flex-direction: row;
          overflow: hidden;
          user-select: none;
          cursor: default;
        }
        apply(--css-flex)
      </style>
      <span class="flex"></span>
      <slot></slot>
    `;
  }

  constructor() {
    super()
    this.inputs = []
  }

  add(item) {
    this.inputs.push(item)
    const inputs = this.inputs.map(o => o.number || o.function);
    this.innerHTML = inputs.join('') || ''
  }

  clean() {
    this.inputs = []
    this.innerHTML = '';
  }

  remove() {
    this.inputs.splice(this.inputs.length - 1)
    const inputs = this.inputs.map(o => o.number || o.function);
    this.innerHTML = inputs.join('') || ''
  }
})
