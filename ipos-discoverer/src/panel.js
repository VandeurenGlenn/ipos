export default system.define(class IposDiscovererPanel extends system.ProgramBase(HTMLElement) {
  constructor() {
    super()
  }

  connectedCallback() {
    super.connectedCallback();
  }

  get template() {
    return html`
    <style>
      :host {
        mixin(--css-column)
        height: 100%;
        padding: 12px;
        box-sizing: border-box;

        box-shadow: 8px 0px 10px 1px rgba(0, 0, 0, 0.14),
                    3px 0px 14px 2px rgba(0, 0, 0, 0.12),
                    5px 0px 5px -3px rgba(0, 0, 0, 0.4);
      }
    </style>
    <system-layout>
      <slot></slot>
    </system-layout>
    `;
  }
})
