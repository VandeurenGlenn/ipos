
export default system.define(class LauncherMenu extends system.ProgramBase(HTMLElement) {
  constructor() {
    super();
  }
  get template() {
    return html`
    <style>
      :host {
        mixin(--css-column)
        background: #eee;
        min-width: 320px;
        max-height: 480px;
        box-sizing: border-box;
      }
      slot {
        display: flex;
        flex-direction: row;
        padding: 10px 12px 0 12px;
        box-sizing: border-box;
      }
      h4 {
        padding: 10px 10px;
        margin: 0;
      }
      .pins, .recents {
        min-height: calc(4 * 48px);
        min-width: 60px;
        box-sizing: border-box;
        padding: 10px 12px 0 12px;
      }
      .recents {
        min-height: 48px;
        height: 48px;
        width: 100%;
      }
      apply(--css-column)
      apply(--css-row)
    </style>
    <span class="row">
      <h4>Pins</h4>
      <span class="column pins">
        <slot name="pins"></slot>
      </span>
      <span class="column">
        <h4>Programs</h4>
        <slot name="programs"></slot>
      </span>
    </span>

    <h4>Recents</h4>
    <span class="row recents">
      <slot name="recents"></slot>
    </span>
    <slot name="actions"></slot>
    `;
  }
})
