import '../../ipos-system-element/index.js';

export default system.define(class IposAudio extends system.ProgramBase(HTMLElement) {
  static get properties() {
    return system.merge(super.properties, {
      name: {
        value: 'Audio'
      },
      src: {
        observer: 'srcChanged'
      }
    })
  }

  get template() {
    return html`
    <style>
      :host {
        display: none;
      }
    </style>
    `;
  }

  constructor() {
    super();
  }

  srcChanged() {
    console.log(this.src);
  }


})
