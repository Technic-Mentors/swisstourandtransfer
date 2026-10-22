/** Keep the glow local to its surface and preserve caller event handlers. */
export function hoverGlowProps(props = {}) {
  return {
    ...props,
    onPointerMove(event) {
      props.onPointerMove?.(event);
      if (event.pointerType !== 'mouse') return;
      const element = event.currentTarget;
      const bounds = element.getBoundingClientRect();
      element.style.setProperty('--glow-x', `${event.clientX - bounds.left}px`);
      element.style.setProperty('--glow-y', `${event.clientY - bounds.top}px`);
      element.dataset.glowActive = 'true';
    },
    onPointerLeave(event) {
      props.onPointerLeave?.(event);
      delete event.currentTarget.dataset.glowActive;
    },
  };
}
