import SelectorMixin from '../node_modules/custom-select-mixins/src/selector-mixin.js';

export default (() => {
  if (!window.windowManager) {
    const loaded = []
    const desktop = document.querySelector('ipos-desktop');

    const close = el => {
      if (el.beforeClose) el.beforeClose();
      desktop.querySelector('window-manager').removeChild(el);
    }

    const load = async ({path, name, position, id}) => {
      if (loaded.indexOf(path) === -1) await import(path);
      const el = document.createElement(name);
      desktop.querySelector('window-manager').appendChild(el);
      el.__position = position;
      if (id) el.id = id;
      loaded.push(path);
    }

    window.windowManager = {
      close,
      load
    }

    system.define(class WindowManager extends SelectorMixin(HTMLElement) {
      constructor() {
        super()
        this.attachShadow({mode: 'open'});
        this.shadowRoot.innerHTML = `
        <style>
          :host {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
          }

          :host ::slotted(*) {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
          }
          :host ::slotted(.custom-selected) {
            z-index: 1000 !important;
          }
        </style>
        <slot></slot>
        `;
        this.attrForSelected = 'id'
        this.addEventListener('selected', ({detail}) => {
          // find host with id
          let parent = detail.parentNode;
          while (!parent.id) {
            parent = parent.host || parent.parentNode
          }
          this.selected = parent;
        })
        const slot = this.shadowRoot.querySelector('slot');
        slot.addEventListener('slotchange', e => {
          slot.assignedNodes().forEach((node, index) => {
            node.style.zIndex = index;
          })
        });
      }
    })
  }
})()
