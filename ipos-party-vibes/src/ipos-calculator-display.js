import './ipos-calculator-input.js';
import './ipos-calculator-output.js';
export default system.define(class IposAudioControls extends system.ProgramBase(HTMLElement) {

  get input() {
    return this.shadowRoot.querySelector('ipos-calculator-input')
  }

  get output() {
    return this.shadowRoot.querySelector('ipos-calculator-output')
  }

  get template() {
    return html`
    <style>
      :host {
        mixin(--css-column)
        pointer-events: auto;
        z-index: 8;
        font-size: 32px;
        box-sizing: border-box;
        padding: 8px;
        user-select: none;
        border-bottom: 1px solid #888;
      }
      apply(--css-flex)
    </style>
    <span class="flex"></span>
    <ipos-calculator-input></ipos-calculator-input>
    <ipos-calculator-output></ipos-calculator-output>
    `;
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }
  add(item) {
    this.input.add(item)
    this.output.add(item)
  }

  clean() {
    this.input.clean();
    this.output.clean();
  }
  // TODO: remove by index, so formules are editable
  remove() {
    this.input.remove();
    this.output.remove();
  }

  calculate() {
    this.output.calculate();
  }
})
