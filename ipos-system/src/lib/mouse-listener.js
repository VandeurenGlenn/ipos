import './pubsub';

export const subscribe = (func, target) => pubsub.subscribe('mouse-event', func, target);
export const unsubscribe = (func, target) => pubsub.unsubscribe('mouse-event', func, target);
window.mouseListener = window.mouseListener ||
  document.addEventListener('mouseup', ({ path, X, Y, screenX, screenY }) => {
    /**
     * @event key-event {keyCode, location}
     *
     * @return {keyCode, key, location}
     */
    pubsub.publish('mouse-event', { path, X, Y, screenX, screenY })
  });
