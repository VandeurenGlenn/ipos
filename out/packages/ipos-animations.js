// import system from '../../ipos-system/index.js';

var busy = system.define(class BusyAnimation extends system.ProgramBase(HTMLElement) {
  constructor() {
    super();
  }

  get template() {
    return html`
    <style>
      :host {
        display: block;
        width: 40px;
        height: 40px;
        margin: 0 auto;
        background-color: #333;

        border-radius: 100%;
        -webkit-animation: scale 1.0s infinite ease-in-out;
        animation: scale 1.0s infinite ease-in-out;
      }

      @-webkit-keyframes scale {
        0% { -webkit-transform: scale(0) }
        100% {
          -webkit-transform: scale(1.0);
          opacity: 0;
        }
      }

      @keyframes scale {
        0% {
          -webkit-transform: scale(0);
          transform: scale(0);
        } 100% {
          -webkit-transform: scale(1.0);
          transform: scale(1.0);
          opacity: 0;
        }
      }
    </style>
    `
  }
});

// import system from '../../ipos-system/index.js';

var boot = system.define(class BootAnimation extends system.ProgramBase(HTMLElement) {

  constructor() {
    super();
  }

  set text(value) {
    this.shadowRoot.querySelector('h1').innerHTML = value;
  }

  get planets() {
    return [
      'earth', 'mars', 'venus', 'mercury',
      'jupiter', 'saturn', 'uranus', 'neptune'
    ]
  }

  connectedCallback() {
    super.connectedCallback();
    // setTimeout(() => {
    this.text = `entering ${this.random(this.planets)}'s orbit`;
    // if (returningUser) this.text = 'hi there, welcome back!';
    // else
    // if (firstTime) this.text = 'welcome to IPOS!';
    // else
    setTimeout(() => {
      this.classList.add('hidden');
    }, 500);
    // }, 3000);
  }

  get template() {
    return html`
    <style>
      :host {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: 100;
        user-select: none;
        justify-content: center;
        align-items: center;
      }
      :host(.hidden) {
        opacity: 0;
        z-index: 0;
        pointer-events: none;
      }
      h1 {
        text-transform: uppercase;
        font-size: 36px;
        font-family: 'ROBOTO', sans-serif;
        -webkit-font-smoothing: antialiased;
        color: #555;
        font-weight: 800;
        text-transform: uppercase;
      }
    </style>
    <busy-animation></busy-animation>
    <h1></h1>
    `;
  }

  random(arr) {
    // Get a number between within array length
    let num = Math.floor((Math.random() * arr.length));
    return arr[num];
  }
});

export { busy as BusyAnimation, boot as BootAnimation };
