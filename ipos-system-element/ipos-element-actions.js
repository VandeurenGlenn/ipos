
export default system.define(class IposElementActions extends system.ProgramBase(HTMLElement) {

  static get properties() {
    return system.merge(super.properties, {
      mobile: {
        value: false
      },
      name: {
        reflect: true
      },
      fullscreensupport: {
        value: true,
        reflect: true
      }
    })
  }
  get programHost() {
    return this.parentNode.host.parentNode.host
  }
  constructor() {
    super();
    this.close = this.close.bind(this);
    this.minimize = this.minimize.bind(this);
    this.doubleClickEvent = this.doubleClickEvent.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('dblclick', this.doubleClickEvent)
    this.icons = Array.from(this.shadowRoot.querySelectorAll('system-icon'));
    this.icons.forEach(icon => {
      icon.addEventListener('mouseup', this[icon.getAttribute('name')])
    })
  }

  close(event) {
    event.preventDefault();
    event.stopPropagation();
    window.windowManager.close(this.programHost);
  }

  doubleClickEvent(event) {
    if (this.fullscreensupport) {
      this.fullscreen = !this.fullscreen;
      if (this.fullscreen) this.programHost.classList.add('fullscreen');
      else this.programHost.classList.remove('fullscreen');
    }
  }

  minimize() {

  }

  get template() {
    return html`
      <style>
        :host {
          display: flex;
          flex-direction: row;

          height: 30px;
          padding: 6px 12px;
          box-sizing: border-box;

          background: #455a64e6;
          color: #fff;
          user-select: none;

          align-items: center;
          pointer-events: auto;
          mixin(--css-elevation-2dp)
        }
        system-icon {
          display: flex;
          padding: 8px;
          height: 30px;
          width: 30px;
          box-sizing: border-box;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          cursor: pointer;
          --svg-icon-color: #eee;
        }
        apply(--css-flex)
      </style>
      <slot></slot>
      <system-icon icon="remove" name="minimize">-</system-icon>
      <system-icon icon="close" name="close">x</system-icon>
    `;
  }
})
