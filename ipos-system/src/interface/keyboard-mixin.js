import '../lib/pubsub';
import { subscribe, unsubscribe } from '../lib/keyboard-listener';

export default (base = HTMLElement) => class KeyboardMixin extends base {
  static get properties() {
    return system.merge(super.properties, {});
  }
  get iposElementFocused() {
    return this.classList.contains('custom-selected')
  }
  constructor() {
    super();
    this.keyEvent = this.keyEvent.bind(this);
  }
  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    if (this.keyEvent) subscribe(this.keyEvent, this);
  }

  disconnectedCallback() {
    if (this.keyEvent) unsubscribe(this.keyEvent, this);
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  /**
   * @param { object } { code, location }
   *
   * @example {code: 17, location: 2} // right control key
   * @example {code: 17, location: 1} // left control key
   * @example {code: 27, location: 0} // Escape key
   * location = 0 when a key is unique...
   */
  keyEvent({code, location, ctrl, alt}) {
    console.log(this.localName);
    console.log(this.classList.contains('custom-selected'));
    if (this.classList.contains('custom-selected')) {
      if (code === 27) {
        //  close focused ui-box
      } else if (code === 115) {
        if (alt) publish('close', this)
      }

    }
  }
}
