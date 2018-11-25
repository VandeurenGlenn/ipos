export default system.define(class IposVibesProgress extends system.ProgramBase(HTMLElement) {
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

    <img src="${'cover'}"></img>
    <p>${'title'}</p>
    <p>${'artist'}</p>
    `;
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('click', ({path}) => {
      this.parentNode.parentNode.host.play(path[0].path)
    })
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
      this.shadowRoot.appendChild(node)
    }
    // if (this.items) this.items.entries().forEach(item => console.log(item))
  }
})
