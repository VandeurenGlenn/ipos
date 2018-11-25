system.define(class LauncherBar extends system.ProgramBase(HTMLElement) {
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
});

system.define(class LauncherMenu extends system.ProgramBase(HTMLElement) {
  constructor() {
    super();
  }
  get template() {
    return html`
    <style>
      :host {
        mixin(--css-column)
        background: #eee;
        min-width: 320px;
        max-height: 480px;
        box-sizing: border-box;
      }
      slot {
        display: flex;
        flex-direction: row;
        padding: 10px 12px 0 12px;
        box-sizing: border-box;
      }
      h4 {
        padding: 10px 10px;
        margin: 0;
      }
      .pins, .recents {
        min-height: calc(4 * 48px);
        min-width: 60px;
        box-sizing: border-box;
        padding: 10px 12px 0 12px;
      }
      .recents {
        min-height: 48px;
        height: 48px;
        width: 100%;
      }
      apply(--css-column)
      apply(--css-row)
    </style>
    <span class="row">
      <h4>Pins</h4>
      <span class="column pins">
        <slot name="pins"></slot>
      </span>
      <span class="column">
        <h4>Programs</h4>
        <slot name="programs"></slot>
      </span>
    </span>

    <h4>Recents</h4>
    <span class="row recents">
      <slot name="recents"></slot>
    </span>
    <slot name="actions"></slot>
    `;
  }
});

system.define(class LauncherTile extends system.ProgramBase(HTMLElement) {
  static get properties() {
    return system.merge(super.properties, {
      link: {
        value: '',
        observer: '_linkChanged'
      },
      name: {
        value: ''
      },
      tag: {
        value: ''
      },
      icon: {
        value: ''
      }
    })
  }

  constructor() {
    super();
  }

  _linkChanged() {
    if (this.link) {
      console.log(this.link);
      this.tag = this.link.match(/(?!.*\/)(.*?)(?=\.js)/)[0];
      this.name = this.tag.replace('ipos-', '');
    }

  }

  get template() {
    return html`
    <style>
      :host {
        mixin(--css-row)
        height: var(--tile-height, 44px);
        width: var(--tile-width, 44px);
        box-sizing: border-box;
        overflow: hidden;
        cursor: pointer;
      }
      system-shortcut {
        height: var(--sh-height, 44px);
        width: var(--sh-width, 44px);
      }
      .medium {
        --tile-height: 88px;
        --tile-width: 132px;
        --sh-height: 88px;
        --sh-width: 132px;
      }
      .medium, .large {
        align-items: center;
      }
      .large {
        mixin(--css-column)
        justify-content: center;
        height: 132px;
        width: 132px;
      }
    </style>
    <system-shortcut src="${'icon'}" link="${'link'}" tag="${'tag'}"></system-shortcut>

    <h4>${'name'}</h4>
    `;
  }
});

var index = system.define(class IposLauncher extends system.ProgramBase(HTMLElement) {

  static get properties() {
    return system.merge(super.properties, {
      name: {
        value: 'ipos-launcher'
      },
      programs: {
        value: []
      },
      actions: {
        value: []
      }
    })
  }

  get launcherIcon() {
    return this.shadowRoot.querySelector('[icon="launcher"]');
  }

  get menu() {
    return this.shadowRoot.querySelector('launcher-menu');
  }

  constructor() {
    super();
    this.iconClick = this.iconClick.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    this.opened = false;
    this.launcherIcon.addEventListener('click', this.iconClick);


  }

  async initTiles() {
      const tiles = Array.from(this.menu.querySelectorAll('launcher-tile'));
      const programs = await system.api.readLocal('system/program.index');
      console.log("programs", programs);
      this.programs = JSON.parse(programs);
      this.programs.forEach((program, index) => {
        let tile = tiles[index];
        let newTile = false;

        if (!tile) {
          newTile = true;
          tile = document.createElement('launcher-tile');
          tile.setAttribute('slot', 'programs');
        }

        tile.icon = program[1];
        tile.link = program[0];

        if (newTile) this.menu.appendChild(tile);
      });
  }

  iconClick() {
    this.opened = !this.opened;
    if (this.opened) {
      this.initTiles();
      this.classList.add('open');
    }
    else this.classList.remove('open');
  }

  get template() {
    return html`
    <style>
      :host {
        mixin(--css-column)
      }
      system-icon {
        cursor: pointer;
      }

      launcher-menu {
        position: absolute;
        bottom: 44px;
        left: 0;
        opacity: 0;
        pointer-events: none;
      }

      :host(.open) > launcher-menu {
        opacity: 1;
        pointer-events: auto;
      }
    </style>
    <launcher-bar>
      <system-icon icon="launcher"></system-icon>
    </launcher-bar>
    <launcher-menu>

      ${this.actions.map(({name, icon}) => `
        <launcher-tile name="${name}" icon="${icon}" slot="actions"></launcher-tile>`
      )}
    </launcher-menu>
    `;
  }
});

export default index;
