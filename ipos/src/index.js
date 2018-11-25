import load from './loader';
import boot from './boot';
import { appLocation } from './params';
import { join } from './utils';
/**
 * Load basic os dependencies
 *
 * @param {object} flags Enable/disable features/experimental-features
 * @param {boolean} flags.rescueMode Boot into os disabling everything except os packages
 * @return Promise
 */
const loadOS = flags => new Promise(async (resolve, reject) => {
  const packages = ['desktop', 'clock', 'launcher'].map(name => join([packageLocation, name]))
  // load apps that are defined in startup
  // const apps = startup.map(name => join([appLocation, name]));

  try {
    await load(packages);
    // TODO: should launcher load apps?
    await load(apps);
    resolve(); // everything loaded
  } catch (e) {
    reject(e);
  }
});


export default {loadOS, boot, load}
