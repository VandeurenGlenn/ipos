import ProgramBase from './program-base';
import KeyMixin from './keyboard-mixin';
import MouseMixin from './mouse-mixin';

/**
 * @param {HTMLElement} base The class that to extend on.
 */
export default (base = HTMLElement) => class Program extends ProgramBase(KeyMixin(MouseMixin(base))) {
  static get properties() {
    return system.merge(super.properties, {
      focused: {
        value: false
      },
      opened: {
        value: false
      },
      __position: {
        value: [],
        observer: '__positionChange'
      },
      __size: {
        value: []
      },

      id: {
        reflect: true
      }
    })
  }

  get focused() {
    return Number(this.style.zIndex) === 100;
  }

  constructor() {
    super();
  }
  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback()
    if (!this.id) {
      this.id = Math.random().toString(36).slice(-12)
    }
  }

  __positionChange() {
    console.log(this.__position);
    // console.log(this.style.top);
    requestAnimationFrame(() => {
      this.style.position = 'absolute';
      this.style.top = this.__position[1];
      this.style.left = this.__position[0];
    })
  }
}
