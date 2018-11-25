/**
 * @mixin Backed
 * @module utils
 * @export merge
 *
 * some-prop -> someProp
 *
 * @param {object} object The object to merge with
 * @param {object} source The object to merge
 * @return {object} merge result
 */
var merge = (object = {}, source = {}) => {
  // deep assign
  for (const key of Object.keys(object)) {
    if (source[key]) {
      Object.assign(object[key], source[key]);
    }
  }
  // assign the rest
  for (const key of Object.keys(source)) {
    if (!object[key]) {
      object[key] = source[key];
    }
  }
  return object;
};

window.Backed = window.Backed || {};
// binding does it's magic using the propertyStore ...
window.Backed.PropertyStore = window.Backed.PropertyStore || new Map();

// TODO: Create & add global observer
var PropertyMixin = base => {
  return class PropertyMixin extends base {
    static get observedAttributes() {
      return Object.entries(this.properties).map(entry => {if (entry[1].reflect) {return entry[0]} else return null});
    }

    get properties() {
      return customElements.get(this.localName).properties;
    }

    constructor() {
      super();
      if (this.properties) {
        for (const entry of Object.entries(this.properties)) {
          const { observer, reflect, renderer } = entry[1];
          // allways define property even when renderer is not found.
          this.defineProperty(entry[0], entry[1]);
        }
      }
    }

    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();
      if (this.attributes)
        for (const attribute of this.attributes) {
          if (String(attribute.name).includes('on-')) {
            const fn = attribute.value;
            const name = attribute.name.replace('on-', '');
            this.addEventListener(String(name), event => {
              let target = event.path[0];
              while (!target.host) {
                target = target.parentNode;
              }
              if (target.host[fn]) {
                target.host[fn](event);
              }
            });
          }
      }
    }

    attributeChangedCallback(name, oldValue, newValue) {
      this[name] = newValue;
    }

    /**
     * @param {function} options.observer callback function returns {instance, property, value}
     * @param {boolean} options.reflect when true, reflects value to attribute
     * @param {function} options.render callback function for renderer (example: usage with lit-html, {render: render(html, shadowRoot)})
     */
    defineProperty(property = null, {strict = false, observer, reflect = false, renderer, value}) {
      Object.defineProperty(this, property, {
        set(value) {
          if (value === this[`___${property}`]) return;
          this[`___${property}`] = value;

          if (reflect) {
            if (value) this.setAttribute(property, String(value));
            else this.removeAttribute(property);
          }

          if (observer) {
            if (observer in this) this[observer]();
            else console.warn(`observer::${observer} undefined`);
          }

          if (renderer) {
            const obj = {};
            obj[property] = value;
            if (renderer in this) this.render(obj, this[renderer]);
            else console.warn(`renderer::${renderer} undefined`);
          }

        },
        get() {
          return this[`___${property}`];
        },
        configurable: strict ? false : true
      });
      // check if attribute is defined and update property with it's value
      // else fallback to it's default value (if any)
      const attr = this.getAttribute(property);
      this[property] = attr || this.hasAttribute(property) || value;
    }
  }
};

var SelectMixin = base => {
  return class SelectMixin extends PropertyMixin(base) {

    static get properties() {
      return merge(super.properties, {
        selected: {
          value: 0,
          observer: '__selectedObserver__'
        }
      });
    }

    constructor() {
      super();
    }

    get slotted() {
      return this.shadowRoot ? this.shadowRoot.querySelector('slot') : this;
    }

    get _assignedNodes() {
      return 'assignedNodes' in this.slotted ? this.slotted.assignedNodes() : this.children;
    }

    /**
    * @return {String}
    */
    get attrForSelected() {
      return this.getAttribute('attr-for-selected') || 'name';
    }

    set attrForSelected(value) {
      this.setAttribute('attr-for-selected', value);
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue) {
        // check if value is number
        if (!isNaN(newValue)) {
          newValue = Number(newValue);
        }
        this[name] = newValue;
      }
    }

    /**
     * @param {string|number|HTMLElement} selected
     */
    select(selected) {
      this.selected = selected;
    }

    next(string) {
      const index = this.getIndexFor(this.currentSelected);
      if (index !== -1 && index >= 0 && this._assignedNodes.length > index &&
          (index + 1) <= this._assignedNodes.length - 1) {
        this.selected = this._assignedNodes[index + 1];
      }
    }

    previous() {
      const index = this.getIndexFor(this.currentSelected);
      if (index !== -1 && index >= 0 && this._assignedNodes.length > index &&
          (index - 1) >= 0) {
        this.selected = this._assignedNodes[index - 1];
      }
    }

    getIndexFor(element) {
      if (element && element instanceof HTMLElement === false)
        return console.error(`${element} is not an instanceof HTMLElement`);

      return this._assignedNodes.indexOf(element || this.selected);
    }

    _updateSelected(selected) {
      selected.classList.add('custom-selected');
      if (this.currentSelected && this.currentSelected !== selected) {
        this.currentSelected.classList.remove('custom-selected');
      }
      this.currentSelected = selected;
    }

    /**
     * @param {string|number|HTMLElement} change.value
     */
    __selectedObserver__(value) {
      switch (typeof this.selected) {
        case 'object':
          this._updateSelected(this.selected);
          break;
        case 'string':
          for (const child of this._assignedNodes) {
            if (child.nodeType === 1) {
              if (child.getAttribute(this.attrForSelected) === this.selected) {
                return this._updateSelected(child);
              }
            }
          }
          if (this.currentSelected) {
            this.currentSelected.classList.remove('custom-selected');
          }
          break;
        default:
          // set selected by index
          const child = this._assignedNodes[this.selected];
          if (child && child.nodeType === 1) {
            this._updateSelected(child);
          // remove selected even when nothing found, better to return nothing
          } else if (this.currentSelected) {
            this.currentSelected.classList.remove('custom-selected');
          }
      }
    }
  }
};

var SelectorMixin = base => {
  return class SelectorMixin extends SelectMixin(base) {

  static get properties() {
      return merge(super.properties, {
        selected: {
          value: 0,
          observer: '__selectedObserver__'
        }
      });
    }
    constructor() {
      super();
    }
    connectedCallback() {
      super.connectedCallback();
      this._onMousedown = this._onMousedown.bind(this);
      this.addEventListener('mousedown', this._onMousedown);
    }
    disconnectedCallback() {
      this.removeEventListener('mousedown', this._onMousedown);
    }
    _onMousedown(event) {
      const target = event.path[0];
      const attr = target.getAttribute(this.attrForSelected);
      if (target.localName !== this.localName) {
        this.selected = attr ? attr : target;
        this.dispatchEvent(new CustomEvent('selected', { detail: this.selected }));
      }
    }
  }
};

system.define(class IposDiscovererDrawer extends system.ProgramBase(SelectorMixin(HTMLElement)) {
  constructor() {
    super();
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
});

system.define(class IposDiscovererPanels extends SelectMixin(system.ProgramBase(HTMLElement)) {
  constructor() {
    super();
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
});

system.define(class IposDiscovererPanel extends system.ProgramBase(HTMLElement) {
  constructor() {
    super();
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
        padding: 12px;
        box-sizing: border-box;

        box-shadow: 8px 0px 10px 1px rgba(0, 0, 0, 0.14),
                    3px 0px 14px 2px rgba(0, 0, 0, 0.12),
                    5px 0px 5px -3px rgba(0, 0, 0, 0.4);
      }
    </style>
    <system-layout>
      <slot></slot>
    </system-layout>
    `;
  }
});

// export default system.define(class PanelTree extends system.ProgramBase(HTMLElement) {
//   static get properties() {
//     return system.merge(super.properties, {
//
//     })
//   }
// });

(() => system.elementBase({
  name: 'PanelTree',
  properties: {}
}))();

system.define(class IposDiscovererDevices extends system.ProgramBase(HTMLElement) {

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.stamp();
  }

  stamp() {
    (async () => {
      const drives = await system.api.drives();
      console.log(drives);
      this.drives = JSON.parse(drives);
      this.drives.forEach(({mountpoints, description, busType}) => {
        const mountpoint = mountpoints[0].path.replace(':\\', '');
        let el = this.querySelector(`span[mountpoint=${mountpoint}]`);
        if (!el) {
          el = document.createElement('span');

          el.classList.add('device');
          el.setAttribute('mountpoint', mountpoint);
          const icon = busType === 'USB' ? 'usb' : 'storage';
          el.innerHTML = `<system-item icon="${icon}" name="${mountpoints[0].path} - ${description}"></system-item>`;
          this.appendChild(el);
        }

      });
    })();
  }

  get template() {
    return html`
    <style>
      :host {
        mixin(--css-column)
        height: 100%;
      }
    </style>
    <panel-tree>
    <ipos-discoverer-panel>
      <slot></slot>
    </ipos-discoverer-panel>
    </panel-tree>
    `;
  }
});

var index = system.define(class IposDiscoverer extends system.Program(HTMLElement) {
  static get properties() {
    return system.merge(super.properties, {
      name: {
        value: 'discoverer'
      },
      drives: {
        value: [],
        observer: 'drivesChanged'
      }
    })
  }

  get drawer() {
    return this.shadowRoot.querySelector('ipos-discoverer-drawer');
  }
  constructor() {
    super();
    this._onSelected = this._onSelected.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();

    this.drawer.addEventListener('selected', this._onSelected);
  }

  _onSelected() {
    this.shadowRoot.querySelector(`ipos-discoverer-${this.drawer.selected}`).stamp();
    // this.selected.stamp()
  }

  get template() {
    return html`
      <style>
        :host {
          mixin(--css-column)
          width: 960px;
          height: 480px;
          pointer-events: auto;
          font-size: 16px;
          background: #fff;
        }
        header {
          mixin(--css-row)
          height: 30px;
          width: 100%;
        }
        main {
          display: flex;
          flex-direction: row;
          height: calc(100% - 30px);
          position: absolute;
          top: 30px;
        }
        section {
          mixin(--css-column)
        }
        strong, .device {
          mixin(--css-row)
          align-items: flex-end;
          overflow: hidden;
          white-space: nowrap;
        }
        ipos-system-element {
          height: 100%;
        }
      </style>
      <ipos-system-element name="discoverer">
        <header>

        </header>

        <main>
          <ipos-discoverer-drawer>
            <system-item name="devices" icon="devices">devices</system-item>
            <system-item name="files" icon="folder">files</system-item>
            <system-item name="spaces" icon="folder">spaces</system-item>
            <system-item name="orbits" icon="folder">orbits</system-item>
          </ipos-discoverer-drawer>
          <ipos-discoverer-panels class="content">
            <ipos-discoverer-devices name="devices"></ipos-discoverer-devices>
            <ipos-discoverer-files name="files"></ipos-discoverer-files>
            <ipos-discoverer-spaces name="spaces"></ipos-discoverer-spaces>
            <ipos-discoverer-orbits name="orbits"></ipos-discoverer-orbits>
          </ipos-discoverer-panels>
        </main>
      </ipos-system-element>
    `;
  }
});

export default index;
