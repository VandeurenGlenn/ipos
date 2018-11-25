import './pubsub';

export const subscribe = (func, target) => pubsub.subscribe('key-event', func, target);
export const unsubscribe = (func, target) => pubsub.unsubscribe('key-event', func, target);
window.keyboardListener = window.keyboardListener || (() => {
  document.addEventListener('keydown', ({ keyCode, key, location }) => {
    /**
     * @event key-event {keyCode, location}
     *
     * @return {keyCode, key, location}
     */
    pubsub.publish('key-event', { code: keyCode, key, location })
  });
})()
