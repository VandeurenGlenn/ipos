import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin';
import PropertyMixin from '../../node_modules/backed/src/mixins/property-mixin';
import CSSMixin from '../../node_modules/backed/src/mixins/css-mixin';
/**
 * @param {HTMLElement} base The class to extend on.
 */
export default (base = HTMLElement) => class ProgramBase extends CSSMixin(RenderMixin(PropertyMixin(base))) {
  static get properties() {
    return system.merge(super.properties, {
      name: {
        value: 'Program'
      }
    })
  }
  constructor() {
    super();
    // ensure everything is encapsulated
    // attachShadow when RenderMixin hasn't attached one.
    if (!this.shadowRoot) this.attachShadow({mode: 'open'});
  }
  get properties() {
    return customElements.get(this.localName).properties;
  }

  get template() {
    return customElements.get(this.localName).template;
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    if (this.beforeRenderCallback) this.beforeRenderCallback();
    // this.render();
    if (this.afterRenderCallback) this.afterRenderCallback();
  }
}
