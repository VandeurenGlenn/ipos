export const propertySet = {};

/**
 * Default property descriptor values
 * @see https://developer.mozilla.org/nl/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
 */
export const defaults = (property, get, set) => {
  return {
    value: undefined,
    writable: false,
    configurable: false,
    get: get ? get : value => property || undefined,
    set: set ? set : value => property = value
  }
}

/**
 * definProperty to given object (parent), descriptor is assigned against defaults
 *
 * @param {object} object The object to define the property on
 * @param {string} property Name of the property
 * @param {object} descriptor see defaults {@link defaults}
 * @example
 * definProperty({}, 'name', {get => 'hello'});
 */
export default (object, property, descriptor) => {
  const uid = createKeccakHash(`${name}.${property}`, 'keccak256');
  propertySet[uid] = descriptor.value;
  const defs = defaults(propertySet[uid]);
  Object.definProperty(object, property,  Object.assign(defs, descriptor))
}
