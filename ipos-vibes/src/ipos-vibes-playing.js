export default system.define(class IposVibesPlaying extends system.ProgramBase(HTMLElement) {
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
    if (this.cover) {
      // this.render()
    }
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
})
