import SelectorMixin from '../../ipos-window-manager/node_modules/custom-select-mixins/src/selector-mixin';

export default system.define(class IposDiscovererDrawer extends system.ProgramBase(SelectorMixin(HTMLElement)) {
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
        pointer-events: auto;
        min-width: 220px;
        padding: 12px;
        box-sizing: border-box;
        /* border-right: 1px solid rgba(0, 0, 0, 0.5); */
        box-shadow: 8px 0px 10px 1px rgba(0, 0, 0, 0.14),
                    3px 0px 14px 2px rgba(0, 0, 0, 0.12),
                    5px 0px 5px -3px rgba(0, 0, 0, 0.4);
      }
    </style>
    <slot></slot>
    `;
  }
})
