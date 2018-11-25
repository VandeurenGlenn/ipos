export default system.define(class SystemShortcut extends system.ProgramBase(HTMLElement) {
  static get properties() {
    return system.merge(super.properties, {
      // TODO: support png
      icon: {
        value: 'link',
      },
      src: {
        value: '',
        observer: '_change'
      },
      title: {
        value: '',
        reflect: true
      },
      tag: {
        value: '',
        reflect: true
      },
      link: {
        value: '',
        reflect: true
      },
    })
  }
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback()

    this.addEventListener('click', () => {
      windowManager.load({name: this.tag, path: `./../${this.link}`, position: [0,0]})
    })
  }

  _change() {
    let icon;
    if (this.src) {
      icon = document.createElement('img');
      icon.src = this.src;
    // } else if (this.svg) {
    //
    //   // const content = sourceSvg.cloneNode(true);
    //   const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    //   const viewBox = '0 0 ' + 24 + ' ' + 24;
    //   const cssText = 'pointer-events: none; display: block; width: 100%; height: 100%;';
    //   svg.setAttribute('viewBox', viewBox);
    //   svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    //   svg.style.cssText = cssText;
    //   svg.appendChild(content).removeAttribute('id');
    } else {
      icon = document.createElement('system-icon');
      icon.icon = this.icon;

    }
    this.innerHTML = icon.outerHTML;
  }
  get template() {
    return html`
    <style>
      :host {
        mixin(--css-column)
        align-items: center;
        justify-content: center;
        height: 48px;
        width: 48px;
        box-sizing: border-box;
      }
      ::slotted(img) {
        height: -webkit-fill-available;
        width: -webkit-fill-available;
      }
    </style>
    <slot></slot>
    `;
  }
})
