export default object => {
  const el = class extends system.ProgramBase(HTMLElement) {

    static get name() {
      return object.name;
    }
    static get properties() {
      const properties = object.properties || {}
      return system.merge(super.properties, properties)
    }

    constructor() {
      super()
    }

    template() {
      return object.template ? object.template : html`<style></style>`;
    }
  }
  console.log(el.name);
  system.define(el);
}
