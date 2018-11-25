var DragMixin = base => class CustomDragMixin extends base {

  set movingElement(value) {
    if (value === string) {
      value = this.querySelector(value);
    }
    this._movingElement = value;
  }

  get movingElement() {
    if (this.hasAttribute('moving-element') && !this.movingElement) {
      this.movingElement = this.getAttribute('moving-element');
    }
    return this.querySelector('.moving-element') || this.shadowRoot.querySelector('.moving-element');
  }

  constructor() {
    super();

    this.mousedown = this.mousedown.bind(this);
    this.mouseup = this.mouseup.bind(this);
    this.mousemove = this.mousemove.bind(this);
  }
  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    this.position = [0, 0, 0, 0];
    if (!this.movingElement) return console.warn(`No .moving-element class found for ${this.localName}`);

    this.movingElement.addEventListener('mousedown', this.mousedown);
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) super.disconnectedCallback();
    this.movingElement.removeEventListener('mousedown', this.mousedown);
    this.removeEventListener('mouseup', this.mouseup);
    this.removeEventListener('mousemove', this.mousemove);
  }

  mousedown({clientX, clientY}) {
    this.moving = true;
    this.position[2] = clientX;
    this.position[3] = clientY;
    document.addEventListener('mouseup', this.mouseup);
    document.addEventListener('mousemove', this.mousemove);
  }

  mouseup() {
    this.moving = false;
    document.removeEventListener('mouseup', this.mouseup);
    document.removeEventListener('mousemove', this.mousemove);
  }

  mousemove({clientX, clientY}) {
    // calculate the new cursor position:
    this.position[0] = this.position[2] - clientX;
    this.position[1] = this.position[3] - clientY;
    this.position[2] = clientX;
    this.position[3] = clientY;

    this.moveElement(this.position[1], this.position[0]);
  }

  moveElement(top, left) {
    top = `${this.offsetTop - top}px`;
    left = `${this.offsetLeft - left}px`;

    requestAnimationFrame(() => {
      this.style.top = top;
      this.style.left = left;
    });
  }
};

system.define(class IposElementActions extends system.ProgramBase(HTMLElement) {

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
    this.addEventListener('dblclick', this.doubleClickEvent);
    this.icons = Array.from(this.shadowRoot.querySelectorAll('system-icon'));
    this.icons.forEach(icon => {
      icon.addEventListener('mouseup', this[icon.getAttribute('name')]);
    });
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
});

let count = 0;
system.define(class IposSystemElement extends DragMixin(system.ProgramBase(HTMLElement)) {

  static get properties() {
    return system.merge(super.properties, {
      mobile: {
        value: false
      },
      name: {
        reflect: true
      },
      lastPosition: {
        value: []
      },
      fullscreensupport: {
        value: true,
        reflect: true
      }
    })
  }

  get target() {
    return this.parentNode.host || this.parentNode;
  }
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    console.log(count++, this.target);
    // Output some text when finished dragging the p element and reset the opacity
    // document.addEventListener("dragend", function(event) {
    //     event.target.style.opacity = "1";
    //     console.log(event);
    // });

  }

  disconnectedCallback() {
    super.connectedCallback();
    // console.log(count++, this.parentNode.host);
    console.log('disc');
    // Output some text when finished dragging the p element and reset the opacity
    // document.addEventListener("dragend", function(event) {
    //     event.target.style.opacity = "1";
    //     console.log(event);
    // });

  }

  mousedown(event) {
    super.mousedown(event);
    this.target.style.opacity = '0.64';
    this.classList.add('dragging');
  }

  mouseup(event) {
    super.mouseup(event);
    this.target.style.opacity = '1';
    if (this.lastPosition[0] !== this.target.__position[0] ||
        this.lastPosition[1] !== this.target.__position[1]) {

      const screenRects = document.body.getClientRects()[0];
      const clientRects = this.target.getClientRects()[0];
      let top = clientRects.top;
      let left = clientRects.left;
      let outOfBounds = false;

      if ((screenRects.bottom - 44) < clientRects.bottom) {
        top = (screenRects.bottom - 44) - clientRects.height;
        outOfBounds = true;
      }
      if (screenRects.top > clientRects.top) {
        top = screenRects.top;
        outOfBounds = true;
      }

      if (screenRects.right < clientRects.right) {
        left = screenRects.width - clientRects.width;
        outOfBounds = true;
      }
      if (screenRects.left > clientRects.left) {
        left = screenRects.left;
        outOfBounds = true;
      }

      if (outOfBounds) {
        left = `${left}px`;
        top = `${top}px`;
        this.target.__position = [left, top];

        requestAnimationFrame(() => {
          this.target.style.position = 'absolute';
          this.target.style.top = top;
          this.target.style.left = left;
        });
      }
      this.target.dispatchEvent(new CustomEvent('session-change', {
        detail: {
          type: 'move',
          program: this.target.localName,
          position: this.target.__position,
          size: this.target.__size
        }
      }));

      this.lastPosition = this.target.__position;
      this.classList.remove('dragging');
    }
  }

  resizeElement(height, width) {
    top = `${this.target.offsetTop - top}px`;
    left = `${this.target.offsetLeft - left}px`;
    this.target.__position = [left, top];
  }

  moveElement(top, left) {
    top = `${this.target.offsetTop - top}px`;
    left = `${this.target.offsetLeft - left}px`;
    this.target.__position = [left, top];

    requestAnimationFrame(() => {
      this.target.style.position = 'absolute';
      this.target.style.top = top;
      this.target.style.left = left;
    });
  }

  get template() {
    return html`
      <style>
        :host {
          display: flex;
          flex-direction: column;
          height: 100%;

          mixin(--css-elevation-8dp)
        }
        h1 {
          font-size: 16px;
          text-transform: uppercase;
          margin: 0;
          pointer-events: none;
        }
        apply(--css-flex)

        .bar, .moving-element {
          display: flex;
          align-items: center;
          width: 100%;
        }

        :host(.dragging) ::slotted(*) {
          pointer-events: none;
        }
      </style>
      <ipos-element-actions fullscreensupport="${'fullscreensupport'}" name="${'name'}">

        <span class="moving-element">
          <h1>${'name'}</h1>
          <span class="flex"></span>
        </span>
      </ipos-element-actions>
      <slot></slot>
    `;
  }
});

system.define(class IposCalculatorInput extends system.ProgramBase(HTMLElement) {
  static get properties() {
    return {
      inputs: {
        value: []
      }
    }
  }
  get template() {
    return html`
      <style>
        :host  {
          display: flex;
          flex-direction: row;
          overflow: hidden;
          user-select: none;
          cursor: default;
        }
        apply(--css-flex)
      </style>
      <span class="flex"></span>
      <slot></slot>
    `;
  }

  constructor() {
    super();
    this.inputs = [];
  }

  add(item) {
    this.inputs.push(item);
    const inputs = this.inputs.map(o => o.number || o.function);
    this.innerHTML = inputs.join('') || '';
  }

  clean() {
    this.inputs = [];
    this.innerHTML = '';
  }

  remove() {
    this.inputs.splice(this.inputs.length - 1);
    const inputs = this.inputs.map(o => o.number || o.function);
    this.innerHTML = inputs.join('') || '';
  }
});

system.define(class IposCalculatorOutput extends system.ProgramBase(HTMLElement) {
  static get properties() {
    return {
      outputs: {
        value: []
      },
      result: {
        value: null
      }
    }
  }

  get template() {
    return html`
      <style>
        :host  {
          display: flex;
          flex-direction: row;
          overflow: hidden;
          justify-content: flex-end;
          user-select: none;
        }
      </style>
      <slot></slot>
    `;
  }

  constructor() {
    super();
    this.outputs = [];
    this.result = '';
  }
  calculate() {
    let out = this.outputs.map(o => o.number || o.function);
    if (isNaN(out[out.length - 1])) return this.result || 0;
    out = out.join('');
    out = out.replace(/\u00D7/g, '*').replace(/\u00F7/g, '/');
    try {
      this.result = eval(out).toString();
    } catch (e) {
      this.result = 'NAN';
    }

    this.innerHTML = `<span>${this.result}</span>`;
  }

  add(item) {
    this.outputs.push(item);
    this.calculate();
  }

  clean() {
    this.outputs = [];
    this.result = '';
    this.innerHTML = '';
  }

  remove() {
    this.outputs.splice(this.outputs.length - 1);
    this.calculate();
  }
});

system.define(class IposCalculatorDisplay extends system.ProgramBase(HTMLElement) {

  get input() {
    return this.shadowRoot.querySelector('ipos-calculator-input')
  }

  get output() {
    return this.shadowRoot.querySelector('ipos-calculator-output')
  }

  get template() {
    return html`
    <style>
      :host {
        mixin(--css-column)
        pointer-events: auto;
        z-index: 8;
        font-size: 32px;
        box-sizing: border-box;
        padding: 8px;
        user-select: none;
        border-bottom: 1px solid #888;
      }
      apply(--css-flex)
    </style>
    <span class="flex"></span>
    <ipos-calculator-input></ipos-calculator-input>
    <ipos-calculator-output></ipos-calculator-output>
    `;
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }
  add(item) {
    this.input.add(item);
    this.output.add(item);
  }

  clean() {
    this.input.clean();
    this.output.clean();
  }
  // TODO: remove by index, so formules are editable
  remove() {
    this.input.remove();
    this.output.remove();
  }

  calculate() {
    this.output.calculate();
  }
});

var index$1 = system.define(class IposCalculator extends system.Program(HTMLElement) {
  static get properties() {
    return system.merge(super.properties, {
      keys: {
        value: []
      },
      name: {
        value: 'calculator'
      },
      /**
       * set singleClick mode for app
       */
      singleClick: {
        value: true
      },
      /**
       * disable fullScreenSupport
       */
      fullscreensupport: {
        value: false
      }
    })
  }

  get template() {
    return html`
    <style>
      :host {
        mixin(--css-column)
        width: 320px;
        height: 480px;
        pointer-events: auto;
        font-size: 20px;
      }
      ipos-calculator-display {
        flex: 1;
        border-bottom: 1px solid rgba(0, 0, 0, 0.21);
        background: #e3f2fd;
      }
      .keys {
        display: flex;
        flex-flow: row wrap;
        background: #607D8B;
        color: #fff;
      }
      .key {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        box-sizing: border-box;
        height: calc(480px / 7);
        width: calc(320px / 5);
        cursor: pointer;
      }
      .key-3, .key-4, .key-8, .key-9, .key-13, .key-14, .key-18, .key-19 {
        background: #455a64ad;
      }
      ipos-system-element {
        height: 100%;
      }
    </style>
    <ipos-system-element name="calculator" fullscreensupport="${'fullscreensupport'}">
      <ipos-calculator-display></ipos-calculator-display>
      <span class="keys">
        ${this.keys ? this.keys.map((key, i) => `<span class="key key-${i}" data-selection="${key}">${key}</span>`) : ''}
      </span>
    </ipos-system-element>
    `;
  }

  get display() {
    return this.shadowRoot.querySelector('ipos-calculator-display');
  }

  constructor() {
    super();
    this.keys = [7, 8, 9, 'CLR', 'DEL', 4, 5, 6, '*', '/', 1, 2, 3, '-', '', '.', 0, '', '+', '='];
  }

  clickEvent({path}) {
    const key = path[0].dataset.selection;
    if (key)
      if (this.iposElementFocused) {
        if (!isNaN(key)) {
          this.display.add({number: key});
        } else if (key === '+' || key === '-' || key === '/' || key === '*') {
          this.display.add({function: key});
        }
        else if (key === '=') this.display.calculate();
        else if (key === 'CLR') this.display.clean();
        else if (key === 'DEL') this.display.remove();
      }
  }

  keyEvent({ code, location, key }) {
    if (this.iposElementFocused) {
      super.keyEvent({ code, location, key });
      if (!isNaN(key)) {
        this.display.add({number: key});
      } else if (key === '+' || key === '-' || key === '/' || key === '*') {
        this.display.add({function: key});
      }
      else if (key === '=' || code === 13) this.display.calculate();
      else if (code === 27) this.display.clean();
      else if (key === 18) this.display.remove();
    }
  }
});

export default index$1;
