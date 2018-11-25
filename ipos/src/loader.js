export const loaded = {};

export const needsLoad = src => !loaded[src];

export const load = (src, {
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

export default src => {if (needsLoad(src)) load(src)};
