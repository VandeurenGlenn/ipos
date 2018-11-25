export default system.define(class LauncherTile extends system.ProgramBase(HTMLElement) {
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
      this.tag = this.link.match(/(?!.*\/)(.*?)(?=\.js)/)[0]
      this.name = this.tag.replace('ipos-', '')
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
})
