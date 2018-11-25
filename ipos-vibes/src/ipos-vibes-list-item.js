export default system.define(class IposVibesListItem extends system.ProgramBase(HTMLElement) {
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
      this.render(this.properties, this.template)
    }
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }
})
