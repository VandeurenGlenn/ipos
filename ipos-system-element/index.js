import DragMixin from './node_modules/custom-drag-drop/custom-drag-mixin.js';
import './ipos-element-actions.js';
let count = 0;
export default system.define(class IposSystemElement extends DragMixin(system.ProgramBase(HTMLElement)) {

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
    super.connectedCallback()
    console.log(count++, this.target);
    // Output some text when finished dragging the p element and reset the opacity
    // document.addEventListener("dragend", function(event) {
    //     event.target.style.opacity = "1";
    //     console.log(event);
    // });

  }

  disconnectedCallback() {
    super.connectedCallback()
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
    this.classList.add('dragging')
  }

  mouseup(event) {
    super.mouseup(event)
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
        })
      }
      this.target.dispatchEvent(new CustomEvent('session-change', {
        detail: {
          type: 'move',
          program: this.target.localName,
          position: this.target.__position,
          size: this.target.__size
        }
      }))

      this.lastPosition = this.target.__position;
      this.classList.remove('dragging')
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
    })
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
})
