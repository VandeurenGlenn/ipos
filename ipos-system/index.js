const charIt = (chars, string) => `${chars[0]}${string}${chars[1]}`;

// let offset = 0;

/**
 * @param {object} element HTMLElement
 * @param {function} tagResult custom-renderer-mixin {changes: [], template: ''}
 */
var render = (element, tagResult) => {
  let offset = 0;
  if (element.shadowRoot) element = element.shadowRoot;
  if (!element.innerHTML) {
    element.innerHTML = tagResult.template;
  }
  const length = element.innerHTML.length;
  tagResult.changes.forEach(change => {
    const position = change.from.position;
    const chars = [
      element.innerHTML.charAt(((position[0] - 1) + offset)),
      element.innerHTML.charAt(((position[1]) + offset))
    ];
    element.innerHTML = element.innerHTML.replace(
      charIt(chars, change.from.value), charIt(chars, change.to.value)
    );
    offset = element.innerHTML.length - length;
  });
  return;
}

/**
 *
 * @example
 ```js
  const template = html`<h1>${'name'}</h1>`;
  let templateResult = template({name: 'Olivia'});

  templateResult.values // property values 'Olivia'
  templateResult.keys // property keys 'name'
  templateResult.strings // raw template array '["<h1>", "</h1>"]'
 ```
 */
const html$1 = (strings, ...keys) => {
  return ((...values) => {
    return {strings, keys, values};
  });
};

window.html = window.html || html$1;

var RenderMixin = (base = HTMLElement) =>
class RenderMixin extends base {

  constructor() {
    super();
    this.set = [];
    this.renderer = this.renderer.bind(this);
    this.render = this.renderer;
  }

  beforeRender({values, strings, keys}) {
    const dict = values[values.length - 1] || {};
    let template = strings[0];
    const changes = [];
    if (values[0] !== undefined) {
      keys.forEach((key, i) => {
        let value = Number.isInteger(key) ? values[key] : dict[key];
        if (value === undefined && Array.isArray(key)) {
          value = key.join('');
        } else if (value === undefined && !Array.isArray(key) && this.set[i]) {
          value = this.set[i].value; // set previous value, doesn't require developer to pass all properties
        } else if (value === undefined && !Array.isArray(key) && !this.set[i]) {
          value = '';
        }
        const string = strings[i + 1];
        const stringLength = string.length;
        const start = template.length;
        const end = template.length + value.length;
        const position = [start, end];

        if (this.set[i] && this.set[i].value !== value) {
          changes.push({
            from: {
              value: this.set[i].value,
              position: this.set[i].position,
            },
            to: {
              value,
              position
            }
          });
          this.set[i].value = value;
          this.set[i].position = [start, end];
        } else if (!this.set[i]) {
          this.set.push({value, position: [start, end]});
          changes.push({
            from: {
              value: null,
              position
            },
            to: {
              value,
              position
            }
          });
        }
        template += `${value}${string}`;
      });
    } else {
      template += strings[0];
    }
    return {
      template,
      changes
    };
  }

  renderer(properties = this.properties, template = this.template) {
    if (!properties) properties = {};
    else if (!this.isFlat(properties)) {
      // check if we are dealing with an flat or indexed object
      // create flat object getting the values from super if there is one
      // default to given properties set properties[key].value
      // this implementation is meant to work with 'property-mixin'
      // checkout https://github.com/vandeurenglenn/backed/src/mixin/property-mixin
      // while I did not test, I believe it should be compatible with PolymerElements
      const object = {};
      // try getting value from this.property
      // try getting value from properties.property.value
      // try getting value from property.property
      // fallback to property
      Object.keys(properties).forEach(key => {
        object[key] = this[key] || properties[key].value;
      });
      properties = object;
    }
    render(this, this.beforeRender(template(properties)));
  }

  /**
   * wether or not properties is just an object or indexed object (like {prop: {value: 'value'}})
   */
  isFlat(object) {
    const firstObject = object[Object.keys(object)[0]];
    if (firstObject && firstObject.hasOwnProperty('value')) return false;
    else return true;
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    if (!this.rendered && this.render) {
      this.render();
      this.rendered = true;
    }  }
}

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
}

/**
 * @module CSSMixin
 * @mixin Backed
 * @param {class} base class to extend from
 */
 const mixins = {
  'mixin(--css-row)': `display: flex;
        flex-direction: row;
  `,
  'mixin(--css-column)': `display: flex;
        flex-direction: column;
  `,
  'mixin(--css-center)': `align-items: center;`,
  'mixin(--css-header)': `height: 128px;
        width: 100%;
        background: var(--primary-color);
        color: var(--text-color);
        mixin(--css-column)`,
  'mixin(--css-flex)': `flex: 1;`,
  'mixin(--css-flex-2)': `flex: 2;`,
  'mixin(--css-flex-3)': `flex: 3;`,
  'mixin(--css-flex-4)': `flex: 4;`,
  'mixin(--material-palette)': `--dark-primary-color: #00796B;
        --light-primary-color: #B2DFDB;
        --primary-color: #009688;
        --text-color: #FFF;
        --primary-text-color: #212121;
        --secondary-text-color: #757575;
        --divider-color: #BDBDBD;
        --accent-color: #4CAF50;
        --disabled-text-color: #BDBDBD;
        --primary-background-color: #f9ffff;
        --dialog-background-color: #FFFFFF;`,
  'mixin(--css-hero)': `display: flex;
        max-width: 600px;
        max-height: 340px;
        height: 100%;
        width: 100%;
        box-shadow: 3px 2px 4px 2px rgba(0,0,0, 0.15),
                    -2px 0px 4px 2px rgba(0,0,0, 0.15);
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        border-radius: 2px;
  `,
  'mixin(--css-elevation-2dp)': `
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
                0 1px 5px 0 rgba(0, 0, 0, 0.12),
                0 3px 1px -2px rgba(0, 0, 0, 0.2);`,

  'mixin(--css-elevation-3dp)': `
    box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.14),
                0 1px 8px 0 rgba(0, 0, 0, 0.12),
                0 3px 3px -2px rgba(0, 0, 0, 0.4);`,
  'mixin(--css-elevation-4dp)': `
    box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14),
                0 1px 10px 0 rgba(0, 0, 0, 0.12),
                0 2px 4px -1px rgba(0, 0, 0, 0.4);`,
  'mixin(--css-elevation-6dp)': `
    box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14),
                0 1px 18px 0 rgba(0, 0, 0, 0.12),
                0 3px 5px -1px rgba(0, 0, 0, 0.4);`,
  'mixin(--css-elevation-8dp)': `
    box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14),
                0 3px 14px 2px rgba(0, 0, 0, 0.12),
                0 5px 5px -3px rgba(0, 0, 0, 0.4);`,
  'mixin(--css-elevation-12dp)': `
    box-shadow: 0 12px 16px 1px rgba(0, 0, 0, 0.14),
                0 4px 22px 3px rgba(0, 0, 0, 0.12),
                0 6px 7px -4px rgba(0, 0, 0, 0.4);`,
  'mixin(--css-elevation-16dp)': `
    box-shadow: 0 16px 24px 2px rgba(0, 0, 0, 0.14),
                0  6px 30px 5px rgba(0, 0, 0, 0.12),
                0  8px 10px -5px rgba(0, 0, 0, 0.4);`,
  'mixin(--css-elevation-24dp)': `
    box-shadow: 0 24px 38px 3px rgba(0, 0, 0, 0.14),
                0 9px 46px 8px rgba(0, 0, 0, 0.12),
                0 11px 15px -7px rgba(0, 0, 0, 0.4);`
 };

 const classes = {
   'apply(--css-row)': `.row {
        mixin(--css-row)
      }
   `,
   'apply(--css-column)': `.column {
        mixin(--css-column)
      }
   `,
   'apply(--css-flex)': `.flex {
        mixin(--css-flex)
      }
   `,
   'apply(--css-flex-2)': `.flex-2 {
     mixin(--css-flex-2)
   }`,
   'apply(--css-flex-3)': `.flex-3 {
     mixin(--css-flex-3)
   }`,
   'apply(--css-flex-4)': `.flex-4 {
     mixin(--css-flex-4)
   }`,
   'apply(--css-center)': `.center {
        align-items: center;
      }
   `,
   'apply(--css-center-center)': `.center-center {
        align-items: center;
        justify-content: center;
      }
   `,
   'apply(--css-header)': `header, .header {
     mixin(--css-header)
   }`,
   'apply(--css-hero)': `.hero {
      mixin(--css-hero)
   }`,
   'apply(--css-elevation-2dp)': `.elevation-2dp {
      mixin(--css-elevation-2dp)
   }`,
   'apply(--css-elevation-3dp)': `.elevation-3dp {
      mixin(--css-elevation-3dp)
   }`,
   'apply(--css-elevation-4dp)': `.elevation-4dp {
      mixin(--css-elevation-4dp)
   }`,
   'apply(--css-elevation-6dp)': `.elevation-6dp {
      mixin(--css-elevation-6dp)
   }`,
   'apply(--css-elevation-8dp)': `.elevation-8dp {
      mixin(--css-elevation-8dp)
   }`,
   'apply(--css-elevation-12dp)': `.elevation-12dp {
      mixin(--css-elevation-12dp)
   }`,
   'apply(--css-elevation-16dp)': `.elevation-16dp {
      mixin(--css-elevation-16dp)
   }`,
   'apply(--css-elevation-18dp)': `.elevation-18dp {
      mixin(--css-elevation-18dp)
   }`
 };
var CSSMixin = base => {
  return class CSSMixin extends base {

    get __style() {
      return this.shadowRoot.querySelector('style');
    }
    constructor() {
      super();
    }
    connectedCallback() {
      // TODO: test
      if (super.connectedCallback) super.connectedCallback();
      // TODO: Implement better way to check if a renderer is used
      if (this.render) this.hasRenderer = true;
      else if(this.template) console.log(`Render method undefined ${this.localname}`);

      this._init();
    }
    _init() {
      if (this.hasRenderer) {
        if (!this.rendered) {
          return requestAnimationFrame(() => {
              this._init();
            });
        }
      }
      const styles = this.shadowRoot ? this.shadowRoot.querySelectorAll('style') : this.querySelectorAll('style');
      // const matches = style.innerHTML.match(/apply((.*))/g);
      styles.forEach(style => {
        this._applyClasses(style.innerHTML).then(innerHTML => {
          if (innerHTML) this.__style.innerHTML = innerHTML;
          this._applyMixins(style.innerHTML).then(innerHTML => {
            if (innerHTML) this.__style.innerHTML = innerHTML;
          });
        }).catch(error => {
          console.error(error);
        });
      });
      // this._applyVariables(matches, style);
    }

    _applyMixins(string) {
      const mixinInMixin = string => {
        if (!string) return console.warn(`Nothing found for ${string}`);
        const matches = string.match(/mixin((.*))/g);
        if (matches) {
          for (const match of matches) {
            const mixin = mixins[match];
            string = string.replace(match, mixin);
          }
        }
        return string;
      };
      return new Promise((resolve, reject) => {
        const matches = string.match(/mixin((.*))/g);
        if (matches) for (const match of matches) {
          const mixin = mixinInMixin(mixins[match]);
          string = string.replace(match, mixin);
          // return [
          //   match, mixins[match]
          // ]

        }        resolve(string);
      });
    }

    _applyClasses(string) {
      return new Promise((resolve, reject) => {
        const matches = string.match(/apply((.*))/g);
        if (matches) for (const match of matches) {
          // this._applyMixins(classes[match]).then(klass => {
            string = string.replace(match, classes[match]);
          // });
        }
        // this.style.innerHTML = string;
        resolve(string);
      });
    }
  }
}

/**
 * @param {HTMLElement} base The class to extend on.
 */
var ProgramBase = (base = HTMLElement) => class ProgramBase extends CSSMixin(RenderMixin(PropertyMixin(base))) {
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

class PubSub {

  /**
   * Creates handlers
   */
  constructor() {
    this.subscribers = {};
    this.values = [];
  }

  /**
   * @param {String} event
   * @param {Method} handler
   * @param {HTMLElement} context
   */
  subscribe(event, handler, context) {
    if (typeof context === 'undefined') {
      context = handler;
    }
    this.subscribers[event] = this.subscribers[event] || { handlers: []};
    this.subscribers[event].handlers.push(handler.bind(context));
  }

  /**
   * @param {String} event
   * @param {Method} handler
   * @param {HTMLElement} context
   */
  unsubscribe(event, handler, context) {
    if (typeof context === 'undefined') {
      context = handler;
    }
    const i = this.subscribers[event].handlers.indexOf(handler.bind(context));
    this.subscribers[event].handlers.splice(i);
  }

  /**
   * @param {String} event
   * @param {String|Number|Boolean|Object|Array} change
   */
  publish(event, change) {
    this.subscribers[event].handlers.forEach(handler => {
      if (this.values[event] !== change)
        handler(change, this.values[event]);
        this.values[event] = change;
      });
  }
}

window.pubsub = new PubSub();

const subscribe = (func, target) => pubsub.subscribe('key-event', func, target);
const unsubscribe = (func, target) => pubsub.unsubscribe('key-event', func, target);
window.keyboardListener = window.keyboardListener || (() => {
  document.addEventListener('keydown', ({ keyCode, key, location }) => {
    /**
     * @event key-event {keyCode, location}
     *
     * @return {keyCode, key, location}
     */
    pubsub.publish('key-event', { code: keyCode, key, location });
  });
})();

var KeyMixin = (base = HTMLElement) => class KeyboardMixin extends base {
  static get properties() {
    return system.merge(super.properties, {});
  }
  get iposElementFocused() {
    return this.classList.contains('focused')
  }
  constructor() {
    super();
    this.keyEvent = this.keyEvent.bind(this);
  }
  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    if (this.keyEvent) subscribe(this.keyEvent, this);
  }

  disconnectedCallback() {
    if (this.keyEvent) unsubscribe(this.keyEvent, this);
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  /**
   * @param { object } { code, location }
   *
   * @example {code: 17, location: 2} // right control key
   * @example {code: 17, location: 1} // left control key
   * @example {code: 27, location: 0} // Escape key
   * location = 0 when a key is unique...
   */
  keyEvent({code, location, ctrl, alt}) {
    if (this.iposElementFocused) {
      if (code === 27) ; else if (code === 115) {
        if (alt) publish('close', this);
      }

    }
  }
}

const subscribe$1 = (func, target) => pubsub.subscribe('mouse-event', func, target);
const unsubscribe$1 = (func, target) => pubsub.unsubscribe('mouse-event', func, target);
window.mouseListener = window.mouseListener || (() => {
  document.addEventListener('mousedown', ({ path, X, Y, screenX, screenY }) => {
    /**
     * @event key-event {keyCode, location}
     *
     * @return {keyCode, key, location}
     */
    pubsub.publish('mouse-event', { path, X, Y, screenX, screenY });
  });
})();

var MouseMixin = (base = HTMLElement) => class MouseMixin extends base {
  static get properties() {
    return system.merge(super.properties, {
      singleClick: {
        value: false
      }
    });
  }
  get iposElementFocused() {
    return this.classList.contains('focused')
  }
  constructor() {
    super();
    this.beforeEvent = this.beforeEvent.bind(this);
  }
  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    if (this.clickEvent) subscribe$1(this.beforeEvent, this);
  }

  disconnectedCallback() {
    if (this.clickEvent) unsubscribe$1(this.beforeEvent, this);
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  beforeEvent(event) {
    const timeStamp = event.timeStamp;
    if (this.lastTimeStamp) this.between = this.timeStamp - this.lastTimeStamp;

    if (this.between <= 500 && this.between < 100 && !this.singleClick) this.doubleClickEvent(event);
    else this.clickEvent(event);
  }

  /**
   * @param { object } { code, location }
   *
   * @example {code: 17, location: 2} // right control key
   * @example {code: 17, location: 1} // left control key
   * @example {code: 27, location: 0} // Escape key
   * location = 0 when a key is unique...
   */
  clickEvent({path}) {
    // console.log(path);
    // if (this.iposElementFocused) {
      // select item by default
      this.selected = path[0].dataset.selection;
    // }
  }

  doubleClickEvent(event) {
    event.preventDefault();
  }
}

/**
 * @param {HTMLElement} base The class that to extend on.
 */
var Program = (base = HTMLElement) => class Program extends ProgramBase(KeyMixin(MouseMixin(base))) {
  static get properties() {
    return system.merge(super.properties, {
      focused: {
        value: false
      },
      opened: {
        value: false
      },
      __position: {
        value: [],
        observer: '__positionChange'
      },
      __size: {
        value: []
      }
    })
  }

  get focused() {
    return Number(this.style.zIndex) === 100;
  }

  set id(value) {
    this._id = value;
  }

  get id() {
    return this._id ||  Math.random().toString(36).slice(-12);
  }

  constructor() {
    super();
  }
  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
  }

  __positionChange() {
    console.log(this.__position);
    // console.log(this.style.top);
    requestAnimationFrame(() => {
      this.style.position = 'absolute';
      this.style.top = this.__position[1];
      this.style.left = this.__position[0];
    });
  }
}

var WindowManager = () => {
  const template = `
    <style>
      main {
        display: block;
        height: calc(100% - 56px);
        width: 100%;
      }
    </style>
    <main></main>
  `;
  return program('window-manager', document.body, template);
}

class PubSub$1 {

  /**
   * Creates handlers
   */
  constructor() {
    this.subscribers = {};
    this.values = [];
  }

  /**
   * @param {String} event
   * @param {Method} handler
   * @param {HTMLElement} context
   */
  subscribe(event, handler, context) {
    if (typeof context === 'undefined') {
      context = handler;
    }
    this.subscribers[event] = this.subscribers[event] || { handlers: []};
    this.subscribers[event].handlers.push(handler.bind(context));
  }

  /**
   * @param {String} event
   * @param {Method} handler
   * @param {HTMLElement} context
   */
  unsubscribe(event, handler, context) {
    if (typeof context === 'undefined') {
      context = handler;
    }
    const i = this.subscribers[event].handlers.indexOf(handler.bind(context));
    this.subscribers[event].handlers.splice(i);
  }

  /**
   * @param {String} event
   * @param {String|Number|Boolean|Object|Array} change
   */
  publish(event, change) {
    this.subscribers[event].handlers.forEach(handler => {
      if (this.values[event] !== change)
        handler(change, this.values[event]);
        this.values[event] = change;
      });
  }
}

const socketRequestClient = (port = 6000, protocol = 'echo-protocol', pubsub) => {
  if (!pubsub) pubsub = new PubSub$1();
  const onerror = error => {
    pubsub.publish('error', error);
  };

  const onmessage = message => {
    const {value, url, status} = JSON.parse(message.data.toString());

    if (status === 200) {
      pubsub.publish(url, value);
    } else {
      onerror(`Failed requesting ${type} @onmessage`);
    }

  };

  const send = (client, request) => {
    client.send(JSON.stringify(request));
  };

  const on = (url, cb) => {
    pubsub.subscribe(url, cb);
  };

  /**
   * @param {string} type
   * @param {string} name
   * @param {object} params
   */
  const request = (client, request) => {
    return new Promise((resolve, reject) => {
      on(request.url, result => {
        resolve(result);
      });
      send(client, request);
    });
  };

  const clientConnection = client => {
    return {
      client,
      request: req => request(client, req),
      send: req => send(client, req),
      close: exit => {
        client.onclose = message => {
          if (exit) process.exit();
        };
        client.close();
      }
    }
  };

  return new Promise(resolve => {
    const init = () => {
      let ws;
      if (typeof process === 'object') {
        ws = require('websocket').w3cwebsocket;
      } else {
        ws = WebSocket;
      }
      const client = new ws(`ws://localhost:${port}/`, protocol);

      client.onmessage = onmessage;
      client.onerror = onerror;
      client.onopen = () => resolve(clientConnection(client));
      client.onclose = message => {
        console.log(`${protocol} Client Closed`);
        // TODO: fail after 10 times
        if (message.code === 1006) {
          console.log('Retrying in 3 seconds');
          setTimeout(() => {
            return init();
          }, 3000);
        }
      };
    };
    return init();
  });
};

let client;

const request = async (url, params) => {
  client = client || await socketRequestClient(5005);
  if (typeof params !== 'object') throw 'Expected params to be typeof object';
  if (url === 'writeLocal' && !params.path) throw 'Expected path to be defined';
  if (url === 'write' && !params.cid) throw 'Expected CID to be defined';
  const response = await client.request({url, params});
  return atob(response);
};

var api = (() => {
  return {
    readLocal: async path => await request('readLocal', {path}),
    writeLocal: async file => await request('writeLocal', file),
    read: async cid => await request('read', cid),
    write: async object => await request('write', object)
  }
})()

/**
 * Add space between camelCase text.
 */
var unCamelCase = (string) => {
  string = string.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2');
  string = string.toLowerCase();
  return string;
};

/**
* Replaces all accented chars with regular ones
*/
var replaceAccents = (string) => {
  // verifies if the String has accents and replace them
  if (string.search(/[\xC0-\xFF]/g) > -1) {
      string = string
              .replace(/[\xC0-\xC5]/g, 'A')
              .replace(/[\xC6]/g, 'AE')
              .replace(/[\xC7]/g, 'C')
              .replace(/[\xC8-\xCB]/g, 'E')
              .replace(/[\xCC-\xCF]/g, 'I')
              .replace(/[\xD0]/g, 'D')
              .replace(/[\xD1]/g, 'N')
              .replace(/[\xD2-\xD6\xD8]/g, 'O')
              .replace(/[\xD9-\xDC]/g, 'U')
              .replace(/[\xDD]/g, 'Y')
              .replace(/[\xDE]/g, 'P')
              .replace(/[\xE0-\xE5]/g, 'a')
              .replace(/[\xE6]/g, 'ae')
              .replace(/[\xE7]/g, 'c')
              .replace(/[\xE8-\xEB]/g, 'e')
              .replace(/[\xEC-\xEF]/g, 'i')
              .replace(/[\xF1]/g, 'n')
              .replace(/[\xF2-\xF6\xF8]/g, 'o')
              .replace(/[\xF9-\xFC]/g, 'u')
              .replace(/[\xFE]/g, 'p')
              .replace(/[\xFD\xFF]/g, 'y');
  }

  return string;
};

var removeNonWord = (string) => string.replace(/[^0-9a-zA-Z\xC0-\xFF \-]/g, '');

const WHITE_SPACES = [
    ' ', '\n', '\r', '\t', '\f', '\v', '\u00A0', '\u1680', '\u180E',
    '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006',
    '\u2007', '\u2008', '\u2009', '\u200A', '\u2028', '\u2029', '\u202F',
    '\u205F', '\u3000'
];

/**
* Remove chars from beginning of string.
*/
var ltrim = (string, chars) => {
  chars = chars || WHITE_SPACES;

  let start = 0,
      len = string.length,
      charLen = chars.length,
      found = true,
      i, c;

  while (found && start < len) {
      found = false;
      i = -1;
      c = string.charAt(start);

      while (++i < charLen) {
          if (c === chars[i]) {
              found = true;
              start++;
              break;
          }
      }
  }

  return (start >= len) ? '' : string.substr(start, len);
};

/**
* Remove chars from end of string.
*/
var rtrim = (string, chars) => {
  chars = chars || WHITE_SPACES;

  var end = string.length - 1,
      charLen = chars.length,
      found = true,
      i, c;

  while (found && end >= 0) {
      found = false;
      i = -1;
      c = string.charAt(end);

      while (++i < charLen) {
          if (c === chars[i]) {
              found = true;
              end--;
              break;
          }
      }
  }

  return (end >= 0) ? string.substring(0, end + 1) : '';
}

/**
 * Remove white-spaces from beginning and end of string.
 */
var trim = (string, chars) => {
  chars = chars || WHITE_SPACES;
  return ltrim(rtrim(string, chars), chars);
}

/**
 * Convert to lower case, remove accents, remove non-word chars and
 * replace spaces with the specified delimeter.
 * Does not split camelCase text.
 */
var slugify = (string, delimeter) => {
  if (delimeter == null) {
      delimeter = "-";
  }

  string = replaceAccents(string);
  string = removeNonWord(string);
  string = trim(string) //should come after removeNonWord
          .replace(/ +/g, delimeter) //replace spaces with delimeter
          .toLowerCase();
  return string;
};

/**
* Replaces spaces with hyphens, split camelCase text, remove non-word chars, remove accents and convert to lower case.
*/
var hyphenate = string => {
  string = unCamelCase(string);
  return slugify(string, "-");
}

const shouldRegister = name => {
  return customElements.get(name) ? false : true;
};

var define = klass => {
  const name = hyphenate(klass.name);
  return shouldRegister(name) ? customElements.define(name, klass) : '';
}

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
}

const require$1 = (module) => {console.log(module);};
window.require = window.require || require$1;

const join = paths => {
  paths = paths.replace('/', ', ').split(', ');
  console.log(paths);
  return paths.reduce((p, c) => {
    if (c.length > 0) {
      return p += `/${c}`;
    } else {
      return p;
    }

  }, '');
};

const path = {
  join
};

if (window !== undefined) {
  window.path = window.path || path;
}

const systemDrive = () => {
  try {
    return process.systemDrive;
  } catch (e) {
    return '/'
  }
};
const root = systemDrive();
const os = join(`${root}, IPOS`);
const system$1 = join(`${os}, system`);
const user = join(`${os}, user`);
const programs = join(`${user}, programs`);
const packages = join(`${user}, packages`);

const paths = {
  root,
  os,
  system: system$1,
  user,
  programs,
  packages
};

console.log(paths);
if (window !== undefined) {
  window.paths = window.paths || paths;
}

window.system = { ProgramBase, Program, WindowManager, define, merge, api };
Promise.resolve().then(function () { return index; });

Promise.resolve().then(function () { return systemIcon; });
Promise.resolve().then(function () { return systemIcons; });

var index = (() => {
  if (!window.windowManager) {
    const desktop = document.querySelector('ipos-desktop');

    const close = el => {
      if (el.beforeClose) el.beforeClose();
      desktop.removeChild(el);
    };

    window.windowManager = {
      close
    };
  }
})()

var index$1 = /*#__PURE__*/Object.freeze({
  default: index
});

((base = HTMLElement) => {
  customElements.define('custom-svg-icon', class CustomSvgIcon extends base {

    /**
     * Attributes observer
     * @return {Array} ['icon']
     */
    static get observedAttributes() {
      return ['icon'];
    }

    /**
     * Iconset
     * @return {object} window.svgIconset
     * [checkout](svg-iconset.html) for more info.
     */
    get iconset() {
      return window.svgIconset
    }

    set iconset(value) {
      window.iconset = value;
    }

    /**
     * icon
     * @param {string} value icon to display.
     * optional: you can create multiple iconsets
     * by setting a different name on svg-iconset.
     *
     * **example:** ```html
     * <svg-iconset name="my-icons">
     *   <g id="menu">....</g>
     * </svg-iconset>
     * ```
     * This means we can ask for the icon using a prefix
     * **example:** ```html
     * <reef-icon-button icon="my-icons::menu"></reef-icon-button>
     * ```
     */
    set icon(value) {
      if (this.icon !== value) {
        this._icon = value;
        this.__iconChanged__({value: value});
      }
    }

    get icon() {
      return this._icon;
    }

    get template() {
      return `
        <style>
          :host {
            width: var(--svg-icon-size, 24px);
            height: var(--svg-icon-size, 24px);
            display: inline-flex;
            display: -ms-inline-flexbox;
            display: -webkit-inline-flex;
            display: inline-flex;
            -ms-flex-align: center;
            -webkit-align-items: center;
            align-items: center;
            -ms-flex-pack: center;
            -webkit-justify-content: center;
            justify-content: center;
            position: relative;
            vertical-align: middle;
            fill: var(--svg-icon-color, #111);
            stroke: var(--svg-icon-stroke, none);
          }
        </style>
      `;
    }

    constructor() {
      super();
      this.attachShadow({mode: 'open'});
      this._onIconsetReady = this._onIconsetReady.bind(this);
    }

    /**
     * Basic render template, can be called from host using super.render() or extended
     *
     * @example ```js
     * const iconTempl = super.template();
     * ```
     */
    render() {
      this.shadowRoot.innerHTML = this.template;
    }

    connectedCallback() {
      this.icon = this.getAttribute('icon') || null;
      if (!super.render) this.render();
    }

    _onIconsetReady() {
      window.removeEventListener('svg-iconset-added', this._onIconsetReady);
      this.__iconChanged__({value: this.icon});
    }

    __iconChanged__(change) {
      if (!this.iconset) {
        window.addEventListener('svg-iconset-added', this._onIconsetReady);
        return;
      }
      if (change.value && this.iconset) {
        let parts = change.value.split('::');
        if (parts.length === 1) {
          this.iconset['icons'].host.applyIcon(this, change.value);
        } else if (this.iconset[parts[0]]) {
          this.iconset[parts[0]].host.applyIcon(this, parts[1]);
        }
      } else if(!change.value && this.iconset && this._icon) {
        let parts = this._icon.split('::');
        if (parts.length === 1) {
          this.iconset['icons'].host.removeIcon(this);
        } else {
          this.iconset[parts[0]].host.removeIcon(this);
        }
      }
      this.iconset = this.iconset;
    }

    /**
     * Runs when attribute changes.
     * @param {string} name The name of the attribute that changed.
     * @param {string|object|array} oldValue
     * @param {string|object|array} newValue
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue) this[name] = newValue;
    }
  });
})();

var systemIcon = system.define(class SystemIcon extends system.ProgramBase(HTMLElement) {
  static get properties() {
    return system.merge(super.properties, {
      icon: {
        reflect: true,
        render: true
      }
    })
  }
  constructor() {
    super();
  }
  get template() {
    return html`
      <style>
        :host {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      </style>
      <custom-svg-icon icon="${'icon'}"></custom-svg-icon>
    `;
  }
})

var systemIcon$1 = /*#__PURE__*/Object.freeze({
  default: systemIcon
});

/**
 * @extends HTMLElement
 */
((base = HTMLElement) => {
  window.svgIconset = window.svgIconset || {};

  customElements.define('custom-svg-iconset', class CustomSvgIconset extends base {
    /**
     * Attributes to observe
     *
     * Updates the js prop value with related attribute value
     * @return {array} ['name', 'theme', size]
     */
    static get observedAttributes() {
      return ['name', 'theme', 'size'];
    }
    /**
     * Runs whenever inserted into document
     */
    constructor() {
      super();
    }
    connectedCallback() {
      if (!this.hasAttribute('name')) {
        this.name = this.name;
      }
      this.style.display = 'none';
    }
    // Getters
    /**
     * The name of the iconset
     * @default {string} icons
     */
    get name() {
      return this._name || 'icons';
    }
    /**
     * The theme for the iconset
     * @default {string} light
     * @return {string}
     */
    get theme() {
      return this._theme || 'light';
    }
    /**
     * The size for the icons
     * @default {number} 24
     * @return {number}
     */
    get size() {
      return this._size || 24;
    }
    // Setters
    /**
     * Creates the iconset[name] in window
     */
    set name(value) {
      if (this._name !== value) {
        this._name = value;
        window.svgIconset[value] = {host: this, theme: this.theme};
        window.dispatchEvent(new CustomEvent('svg-iconset-update'));
        window.dispatchEvent(new CustomEvent('svg-iconset-added', {detail: value}));
      }
    }
    /**
     * Reruns applyIcon whenever a change has been detected
     */
    set theme(value) {
      if (this._theme !== value && this.name) {
        window.svgIconset[this.name] = {host: this, theme: value};
        window.dispatchEvent(new CustomEvent('svg-iconset-update'));
      }
      this._theme = value;
    }
    /**
     * @private
     */
    set size(value) {
      this._size = value;
    }
    /**
     * Runs whenever given attribute in observedAttributes has changed
     * @private
     */
    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal !== newVal) {
        this[name] = newVal;
      }
    }
    /* from https://github.com/PolymerElements/iron-iconset-svg */
    /**
     * Applies an icon to given element
     * @param {HTMLElement} element the element appending the icon to
     * @param {string} icon The name of the icon to show
     */
    applyIcon(element, icon) {
      element = element.shadowRoot || element;
      this.removeIcon(element);
      this._cloneIcon(icon).then(icon => {
        element.insertBefore(icon, element.childNodes[0]);
        element._iconSetIcon = icon;
      });
    }
    /**
     * Remove an icon from the given element by undoing the changes effected
     * by `applyIcon`.
     *
     * @param {Element} element The element from which the icon is removed.
     */
    removeIcon(element) {
      // Remove old svg element
      element = element.shadowRoot || element;
      if (element._iconSetIcon) {
        element.removeChild(element._iconSetIcon);
        element._iconSetIcon = null;
      }
    }
    /**
     * Produce installable clone of the SVG element matching `id` in this
     * iconset, or `undefined` if there is no matching element.
     *
     * @return {Element} Returns an installable clone of the SVG element
     * matching `id`.
     * @private
     */
    _cloneIcon(id) {
      return new Promise((resolve, reject) => {
        // create the icon map on-demand, since the iconset itself has no discrete
        // signal to know when it's children are fully parsed
        try {
          this._icons = this._icons || this._createIconMap();
          let svgClone = this._prepareSvgClone(this._icons[id], this.size);
          resolve(svgClone);
        } catch (error) {
          reject(error);
        }
      });
    }
    // TODO: Update icon-map on child changes
    /**
     * Create a map of child SVG elements by id.
     *
     * @return {!Object} Map of id's to SVG elements.
     * @private
     */
    _createIconMap() {
      var icons = Object.create(null);
      this.querySelectorAll('[id]')
        .forEach(icon => {
          icons[icon.id] = icon;
        });
      return icons;
    }
    /**
     * @private
     */
    _prepareSvgClone(sourceSvg, size) {
      if (sourceSvg) {
        var content = sourceSvg.cloneNode(true),
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
            viewBox = content.getAttribute('viewBox') || '0 0 ' + size + ' ' + size,
            cssText = 'pointer-events: none; display: block; width: 100%; height: 100%;';
        svg.setAttribute('viewBox', viewBox);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.cssText = cssText;
        svg.appendChild(content).removeAttribute('id');
        return svg;
      }
      return null;
    }
  });
})();

var systemIcons = system.define(class SystemIcons extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
    <custom-svg-iconset>
      <svg><defs>
        <g id="close"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></g>
        <g id="fullscreen"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></g>
        <g id="fullscreen-exit"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></g>
        <g id="launcher"><path d="M2.514,11.825c0.565,0.565,0.565,1.481,0,2.046c-0.565,0.565-1.481,0.565-2.046,0
	c-0.565-0.565-0.565-1.481,0-2.046C1.033,11.26,1.949,11.26,2.514,11.825z M4.762,20.438c-0.67,0.67-0.67,1.755,0,2.425
	c0.67,0.67,1.755,0.67,2.425,0c0.67-0.67,0.67-1.755,0-2.425C6.517,19.769,5.432,19.769,4.762,20.438z M11.384,6.603
	c-0.677-0.677-1.776-0.677-2.453,0c-0.677,0.677-0.677,1.776,0,2.453c0.677,0.677,1.776,0.677,2.453,0
	C12.061,8.379,12.061,7.281,11.384,6.603z M13.567,4.213c0.603,0,1.091-0.489,1.091-1.091s-0.489-1.091-1.091-1.091
	c-0.603,0-1.091,0.489-1.091,1.091S12.964,4.213,13.567,4.213z M19.372,14.932c-0.603,0-1.091,0.489-1.091,1.091
	c0,0.603,0.489,1.091,1.091,1.091c0.603,0,1.091-0.489,1.091-1.091C20.464,15.421,19.975,14.932,19.372,14.932z M22.598,4.901
	c-0.799,0-1.447,0.648-1.447,1.447s0.648,1.447,1.447,1.447c0.799,0,1.447-0.648,1.447-1.447S23.397,4.901,22.598,4.901z
	 M12.123,12.533c-0.677,0.677-0.677,1.776,0,2.453c0.677,0.677,1.776,0.677,2.453,0c0.677-0.677,0.677-1.776,0-2.453
	C13.899,11.856,12.801,11.856,12.123,12.533z M15.565,18.519c-0.284,0.284-0.284,0.746,0,1.03c0.284,0.284,0.746,0.284,1.03,0
	c0.284-0.284,0.284-0.745,0-1.03C16.311,18.235,15.85,18.235,15.565,18.519z"/></g>
        <g id="link"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></g>
        <g id="remove"><path d="M19 13H5v-2h14v2z"/></g>
      </defs></svg>
    </custom-svg-iconset>
    `;
  }
})

var systemIcons$1 = /*#__PURE__*/Object.freeze({
  default: systemIcons
});
