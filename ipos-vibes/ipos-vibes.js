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

system.define(class IposVibesListItem extends system.ProgramBase(HTMLElement) {
  static get properties() {
    return system.merge(super.properties, {
      path: {
        value: '',
        observer: 'c'
      },
      title: {
        value: '',
        observer: 'c'
      },
      artist: {
        value: '',
        observer: 'c'
      },
      cover: {
        value: '',
        observer: 'c'
      },
      year: {
        value: '',
        observer: 'c'
      }
    })
  }


  get template() {
    return html`
    <style>
      :host {
        mixin(--css-row)
        pointer-events: auto;
        z-index: 8;
        font-size: 22px;
        box-sizing: border-box;
        padding: 8px;
        user-select: none;
        /* border-bottom: 1px solid #888; */
        overflow: hidden;
        min-width: 320px;
        width: 100%;
      }
      img {
        display: flex;
        width: 48px;
        height: 48px;
        pointer-events: none;
      }
      .song-info {
        padding: 0 8px;
        box-sizing: border-box;
        width: calc(100% - 48px);
        pointer-events: none;
      }
      .info {
        display: flex;
        flex-direction: row;
        overflow: hidden;
        /* height: 64px; */
        white-space: nowrap;
      }
      strong {
        padding: 0 6px;
      }
      .title {

      }
      .artist {
        font-size: 18px;
      }
      apply(--css-flex)
      apply(--css-row)
      apply(--css-column)
    </style>
    <img src="${'cover'}"></img>
    <span class="song-info column">
      <span class="info title row">${'title'}</span>
      <span class="info artist row">${'artist'}</span>
    </span>
    `;
  }

  c() {
    console.log(this.title);
    if (this.title && this.cover && this.artist && this.album && this.year) {
      this.render(this.properties, this.template);
    }
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }
});

system.define(class IposVibesList extends system.ProgramBase(HTMLElement) {
  static get properties() {
    return system.merge(super.properties, {
      items: {
        value: [],
        observer: '_itemsChanged'
      }
    })
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
      }
      apply(--css-flex)
    </style>
    `;
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('click', ({path}) => {
      this.parentNode.parentNode.host.play(path[0].path);
    });
  }

  _itemsChanged() {
    for (const song of this.items.entries()) {
      console.log(song);
      const node = document.createElement('ipos-vibes-list-item');
      node.classList.add('vibes-list-item');
      node.path = song[0];
      node.title = song[1].title;
      node.artist = song[1].artist;
      node.cover = song[1].cover;
      node.year = song[1].year;
      this.shadowRoot.appendChild(node);
    }
    // if (this.items) this.items.entries().forEach(item => console.log(item))
  }
});

system.define(class IposVibesPlaying extends system.ProgramBase(HTMLElement) {
  set cover(value) {
    this._cover = value;
    this._cover.replace('-64', '-128');
    this.shadowRoot.querySelector('img').src = value;
  }

  set title(value) {
    this._title = value;
    this.shadowRoot.querySelector('.title').innerHTML = value;
  }

  set artist(value) {
    this._artist = value;
    this.shadowRoot.querySelector('.artist').innerHTML = value;
  }

  get cover() {
    return this._cover
  }

  get title() {
    return this._title
  }

  get artist() {
    return this._artist
  }


  get template() {
    return html`
    <style>
      :host {
        mixin(--css-column)
        pointer-events: auto;
        z-index: 8;
        box-sizing: border-box;
        user-select: none;
        height: 96px;
      }

      p {
        margin: 0;
      }

      img {
        width: 96px;
        height: 96px;
        border: none;
        outline: none;
        padding-right: 8px;
      }
      apply(--css-flex)
      apply(--css-row)
      apply(--css-column)
    </style>

    <span class="row">
      <img></img>
      <span class="column">
        <p class="title">${'title'}</p>
        <p class="artist">${'artist'}</p>
      </span>
    </span>
    `;
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.cover = `user/music/M10S - Ten Skies-64.webp`;
    // this.addEventListener('click', ({path}) => {
    //   this.parentNode.parentNode.host.play(path[0].path)
    // })
  }

  _itemsChanged() {
    if (this.cover) ;
    // for (const song of this.items.entries()) {
    //   console.log(song);
    //   const node = document.createElement('ipos-vibes-list-item');
    //   node.classList.add('vibes-list-item');
    //   node.path = song[0];
    //   node.title = song[1].title;
    //   node.artist = song[1].artist;
    //   node.cover = song[1].cover;
    //   node.year = song[1].year;
    //   this.shadowRoot.appendChild(node)
    // }
    // if (this.items) this.items.entries().forEach(item => console.log(item))
  }
});

var index$1 = system.define(class IposVibes extends system.Program(HTMLElement) {
  static get properties() {
    return system.merge(super.properties, {
      name: {
        value: 'Vibes'
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
        value: true
      },

      nowPlaying: {
        observer: 'nowPlayingChanged'
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

      ipos-vibes-list {
        height: calc(100% - 126px);
      }

      ipos-vibes-playing {
        height: 96px;
      }
    </style>
    <ipos-system-element name="${'name'}">
      <ipos-vibes-list></ipos-vibes-list>
      <ipos-vibes-playing></ipos-vibes-playing>
      <system-audio></system-audio>
    </ipos-system-element>
    `;
  }

  get list() {
    return this.shadowRoot.querySelector('ipos-vibes-list')
  }

  get audio() {
    return this.shadowRoot.querySelector('system-audio')
  }

  constructor() {
    super();

      (async () => {
        const db = await system.api.readLocal('system/db/music');
        // console.log(db);
        this.db = new Map(JSON.parse(db));
        // this.db = new Map(JSON.parse(db))
        console.log(this.db);
        this.list.items = this.db;
      })();
  }

  play(src) {
    if (!this.audio.playing && this.audio.src === src) this.audio.resume();
    else if (this.audio.playing && this.audio.src === src) this.audio.pause();
    else this.audio.play(src);
    const { title, artist, cover } = this.db.get(src);

    console.log(title, artist, cover);
    this.shadowRoot.querySelector('ipos-vibes-playing').cover = cover;
    this.shadowRoot.querySelector('ipos-vibes-playing').title = title;
    this.shadowRoot.querySelector('ipos-vibes-playing').artist = artist;
  }

  clickEvent({path}) {
    console.log(path);
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
