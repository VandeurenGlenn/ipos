export default (() => system.define(class SystemLayout extends system.ProgramBase(HTMLElement) {
  static get observedAttributes() {
    return ['grid', 'horizontal']
  }
  constructor() {
    super();
  }

  get template() {
    return html`
    <style>
      :host {
        mixin(--css-column)
      }
      :host([grid]) {
        justify-content: space-around;
        flex-flow: row wrap;
      }

      :host([grid]), :host([horizontal]) {
        mixin(--css-row)
      }
    </style>
    <slot></slot>
    `;
  }
}))()
