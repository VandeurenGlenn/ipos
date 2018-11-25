import './launcher-bar.js';
import './launcher-menu.js';
import './launcher-tile.js';
export default system.define(class IposLauncher extends system.ProgramBase(HTMLElement) {

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
      const tiles = Array.from(this.menu.querySelectorAll('launcher-tile'))
      const programs = await system.api.readLocal('system/program.index');
      console.log("programs", programs);
      this.programs = JSON.parse(programs)
      this.programs.forEach((program, index) => {
        let tile = tiles[index];
        let newTile = false;

        if (!tile) {
          newTile = true;
          tile = document.createElement('launcher-tile')
          tile.setAttribute('slot', 'programs');
        }

        tile.icon = program[1];
        tile.link = program[0];

        if (newTile) this.menu.appendChild(tile);
      })
  }

  iconClick() {
    this.opened = !this.opened;
    if (this.opened) {
      this.initTiles()
      this.classList.add('open')
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
})
