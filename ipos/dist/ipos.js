var ipos = (function () {
'use strict';

const loaded = {};

const load = (src, {
  module = false,
  target = document.querySelector('body')
}) => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  if (module) script.setAttribute('type', 'module');
  script.onload = () => {
    loaded[src] = true;
    resolve();
  };
  script.onerror = error => reject(error);
  script.src = src;
  target.appendChild(script);
});
var load$1 = (src => load(src));

const appLocation = 'apps';
const startupPath = 'startup';

const join = paths => paths.reduce((p, c) => {
  p += `/${c}`;
}, '');
const read = path => api.files.get(path);
const startup = new Promise(async (resolve, reject) => {
  await read(join(startupPath, 'index'));
});

const loadOS = flags => new Promise(async (resolve, reject) => {
  const packages = ['desktop', 'clock', 'launcher'].map(name => join([packageLocation, name]));
  const apps = startup.map(name => join([appLocation, name]));
  try {
    await load$1(packages);
    await load$1(apps);
    resolve();
  } catch (e) {
    reject(e);
  }
});
var index = loadOS();

return index;

}());
//# sourceMappingURL=ipos.js.map
