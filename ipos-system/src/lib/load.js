export default name => {
  if (!system.loaded[name]) {
    const script = document.createElement('script');
    script.onloaded = () => resolve();
    script.onerror = error => reject(error);
    script.src = `${window.paths.programs}/${name}.js`;
    system.loaded[name] = true;
  }
}
