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
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    console.log(count++, this.parentNode.host);
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
    this.parentNode.host.style.opacity = '0.64';
  }

  mouseup(event) {
    super.mouseup(event);
    this.parentNode.host.style.opacity = '1';
    if (this.lastPosition[0] !== this.parentNode.host.__position[0] ||
        this.lastPosition[1] !== this.parentNode.host.__position[1]) {

      const screenRects = document.body.getClientRects()[0];
      const clientRects = this.parentNode.host.getClientRects()[0];
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
        this.parentNode.host.__position = [left, top];

        requestAnimationFrame(() => {
          this.parentNode.host.style.position = 'absolute';
          this.parentNode.host.style.top = top;
          this.parentNode.host.style.left = left;
        });
      }
      this.parentNode.host.dispatchEvent(new CustomEvent('session-change', {
        detail: {
          type: 'move',
          program: this.parentNode.host.localName,
          position: this.parentNode.host.__position,
          size: this.parentNode.host.__size
        }
      }));

      this.lastPosition = this.parentNode.host.__position;
    }
  }

  resizeElement(height, width) {
    top = `${this.parentNode.host.offsetTop - top}px`;
    left = `${this.parentNode.host.offsetLeft - left}px`;
    this.parentNode.host.__position = [left, top];
  }

  moveElement(top, left) {
    top = `${this.parentNode.host.offsetTop - top}px`;
    left = `${this.parentNode.host.offsetLeft - left}px`;
    this.parentNode.host.__position = [left, top];

    requestAnimationFrame(() => {
      this.parentNode.host.style.position = 'absolute';
      this.parentNode.host.style.top = top;
      this.parentNode.host.style.left = left;
    });
  }

  get template() {
    return html`
      <style>
        :host {
          display: flex;
          flex-direction: column;

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

var index$1 = system.define(class IposVibes extends system.Program(HTMLElement) {
  static get properties() {
    return system.merge(super.properties, {
      name: {
        value: 'Audio'
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
    </style>
    <vibes-list></vibes-list>
    <system-audio src="user/music/sick.mp3"></system-audio>
    `;
  }

  constructor() {
    super();
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
