var index = system.define(class IposDesktop extends system.ProgramBase(HTMLElement) {
  static get properties() {
    return system.merge(super.properties, {
      session: {
        observer: 'sessionObserver'
      },
      loaded: {
        value: []
      }
    })
  }

  get windowManager() {
    return this.querySelector('window-manager');
  }

  get windowManagerSlot() {
    return this.windowManager.shadowRoot.querySelector('slot')
  }
  get programs() {
    return this.windowManagerSlot.assignedNodes();
  }

  constructor() {
    super();
    this.sessionChange = this.sessionChange.bind(this);
  }

  sessionObserver() {
    console.log(this.session);
    if (this.session && this.session.length > 0) {
      system.api.writeLocal({path: 'system/session', content: this.session});
    }

  }

  sessionChange(event) {
    console.log(event);
    console.log(this.programs);
    this.session = this.programs.map(node => {
      return {
        name: node.localName,
        position: [node.__position[0] || 0, node.__position[1] || 0],
        id: node.id
      }
    });
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();


    (async () => {
      await import('./ipos-launcher.js');


      // await import('../out/ipos-launcher/src/index.js');
      const session = await system.api.readLocal('system/session');


      this.session = JSON.parse(session);
      this.windowManagerSlot.addEventListener('slotchange', e => {
        this.sessionChange();
        // console.log(session);
        // console.log('Element in Slot "' + this.windowManager.name + '" changed to "' + this.programs[0].outerHTML + '".');
      });
      if (session.length > 0) this.applySession(this.session);
    })();
  }

  programClose() {
    console.log('closed');
  }

  async applySession(session) {
    console.log(session);
    session.forEach(async node => {
      console.log(node);
      if (this.loaded.indexOf(node.name) === -1) await import(`../programs/${node.name}.js`);
      const el = document.createElement(node.name);
      this.windowManager.appendChild(el);
      el.__position = node.position;
      el.id = node.id;
      this.loaded.push(node.name);
      el.addEventListener('session-change', this.sessionChange);
    });
  }

  get template() {
    return html`
    <style>
      :host {
        mixin(--css-column)
      }
      :host ::slotted([slot="launcher"]) {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 44px;
      }
      slot[name="window-manager"] {
        height: calc(100% - 44px);
        display: flex;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
    </style>

    <slot name="window-manager"></slot>
    <slot name="launcher"></slot>
    `;
  }
});

export default index;
