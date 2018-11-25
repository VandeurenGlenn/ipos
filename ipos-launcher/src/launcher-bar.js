export default system.define(class LauncherBar extends system.ProgramBase(HTMLElement) {
  constructor() {
    super();
  }
  get template() {
    return html`
    <style>
      :host {
        mixin(--css-row)
        height: 44px;
        padding: 6px 10px;
        box-sizing: border-box;
        mixin(--css-elevation-4dp)
      }
    </style>

    <slot></slot>
    `;
  }
})
