import { useEffect, useRef } from 'react';
import { CarIcon } from './sections';
import s from './home.module.css';

/* How far below the pointer the car drives. Keeping it off the pointer
   itself means it never sits on top of whatever is being hovered. */
const TRAIL_BELOW = 24;

/** How much of the remaining distance is closed each frame. */
const EASE = 0.08;

/** How quickly the car swings round to its new heading. */
const TURN_EASE = 0.14;

/* Below this much travel per frame the heading is left alone: as the car
   settles onto the pointer the direction becomes noise, and without this
   it twitches on the spot. */
const SPEED_FLOOR = 0.9;

/* The car only turns around once there is real sideways travel, so that
   moving straight up or down does not make it flip back and forth. */
const FLIP_FLOOR = 1.5;

/**
 * A small car that trails the pointer across the home page.
 *
 * The position is written straight onto the node inside a rAF loop: held in
 * React state it would re-render the page sixty times a second. Renders
 * nothing for touch pointers, or for anyone who has asked for less motion.
 */
export default function CursorCar() {
  const frame = useRef(null);
  const flip = useRef(null);

  useEffect(() => {
    const node = frame.current;
    const inner = flip.current;
    if (!node || !inner) return undefined;

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || calm.matches) return undefined;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;
    let angle = 0;
    let facing = 1;
    let awake = false;
    let raf = 0;

    const onMove = (event) => {
      targetX = event.clientX;
      targetY = event.clientY + TRAIL_BELOW;

      if (!awake) {
        // Appear where the pointer already is, rather than driving in from
        // the middle of the screen on the first movement.
        awake = true;
        x = targetX;
        y = targetY;
        node.classList.add(s.cursorCarOn);
      }
    };

    const onLeave = () => {
      awake = false;
      node.classList.remove(s.cursorCarOn);
    };

    /** Shortest signed way round from one angle to another, in degrees. */
    const turnTo = (from, to) => {
      let delta = (to - from) % 360;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      return delta;
    };

    const tick = () => {
      const dx = targetX - x;
      const dy = targetY - y;
      const speed = Math.hypot(dx, dy);

      x += dx * EASE;
      y += dy * EASE;

      if (speed > SPEED_FLOOR) {
        // Where the car is actually heading, in screen degrees.
        const heading = (Math.atan2(dy, dx) * 180) / Math.PI;

        if (Math.abs(dx) > FLIP_FLOOR) facing = dx > 0 ? 1 : -1;

        // The artwork points right. Mirrored, it points left, so its own
        // zero is half a turn round - take that off before steering.
        const want = facing === 1 ? heading : heading - 180;
        angle += turnTo(angle, want) * TURN_EASE;
      }

      node.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg)`;
      inner.style.transform = `scaleX(${facing})`;

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div ref={frame} className={s.cursorCar} aria-hidden="true">
      <span ref={flip} className={s.cursorCarFlip}>
        <CarIcon className={s.cursorCarIcon} />
      </span>
    </div>
  );
}
