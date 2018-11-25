import '../lib/pubsub';
import { subscribe, unsubscribe } from '../lib/mouse-listener';

export default (base = HTMLElement) => class MouseMixin extends base {
  static get properties() {
    return system.merge(super.properties, {
      singleClick: {
        value: false
      }
    });
  }
  get iposElementFocused() {
    const focused = this.classList.contains('focused');
    return  focused || this.classList.contains('custom-selected')
  }
  constructor() {
    super();
    this.beforeEvent = this.beforeEvent.bind(this);
  }
  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    if (this.clickEvent) subscribe(this.beforeEvent, this);
  }

  disconnectedCallback() {
    if (this.clickEvent) unsubscribe(this.beforeEvent, this);
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  beforeEvent(event) {
    const timeStamp = event.timeStamp;
    if (this.lastTimeStamp) this.between = this.timeStamp - this.lastTimeStamp

    if (this.between <= 500 && this.between < 100 && !this.singleClick) this.doubleClickEvent(event);
    else this.clickEvent(event)
  }

  /**
   * @param { object } { code, location }
   *
   * @example {code: 17, location: 2} // right control key
   * @example {code: 17, location: 1} // left control key
   * @example {code: 27, location: 0} // Escape key
   * location = 0 when a key is unique...
   */
  clickEvent({path}) {
    if (!this.iposElementFocused && path === this) console.log('should focus');
      // select item by default
      this.selected = path[0].dataset.selection;
  }

  doubleClickEvent(event) {
    event.preventDefault()
  }
}
