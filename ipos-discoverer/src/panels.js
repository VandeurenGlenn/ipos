import SelectMixin from '../../ipos-window-manager/node_modules/custom-select-mixins/src/select-mixin';

export default system.define(class IposDiscovererPanels extends SelectMixin(system.ProgramBase(HTMLElement)) {
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
      }
    </style>
    <slot></slot>
    `;
  }
})
