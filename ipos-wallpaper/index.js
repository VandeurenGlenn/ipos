
export default system.define(class IposWallpaper extends system.ProgramBase(HTMLElement) {
  constructor() {
    super();
  }
  static get template() {
    return html`
    <style>
      :host {
        mixin(--css-column)
      }
      :host slot([name="launcher"]) {
        left: 0;
        right: 0;
        bottom: 0;
        height: 64px;
      }
      :host slot([name="window-manager"]) {
        left: 0;
        right: 0;
        top: 0;
        height: calc(100% - 64px);
      }
    </style>
    <slot name="programs"></slot>
    <slot name="actions"></slot>
    `;
  }
})
