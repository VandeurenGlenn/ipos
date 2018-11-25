export default system.define(class IposCalculatorOutput extends system.ProgramBase(HTMLElement) {
  static get properties() {
    return {
      outputs: {
        value: []
      },
      result: {
        value: null
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
          justify-content: flex-end;
          user-select: none;
        }
      </style>
      <slot></slot>
    `;
  }

  constructor() {
    super()
    this.outputs = []
    this.result = '';
  }
  calculate() {
    let out = this.outputs.map(o => o.number || o.function);
    if (isNaN(out[out.length - 1])) return this.result || 0;
    out = out.join('');
    out = out.replace(/\u00D7/g, '*').replace(/\u00F7/g, '/');
    try {
      this.result = eval(out).toString()
    } catch (e) {
      this.result = 'NAN';
    }

    this.innerHTML = `<span>${this.result}</span>`;
  }

  add(item) {
    this.outputs.push(item);
    this.calculate();
  }

  clean() {
    this.outputs = [];
    this.result = '';
    this.innerHTML = '';
  }

  remove() {
    this.outputs.splice(this.outputs.length - 1)
    this.calculate()
  }
})
