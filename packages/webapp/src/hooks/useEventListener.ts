import { useEffect, useRef } from 'react';

/**
 * Registers a event handler on the given element.
 *
 * Based on https://usehooks.com/useEventListener/
 *
 * @export
 * @param {keyof HTMLElementEventMap} eventName
 * @param {EventListener} handler
 * @param {EventTarget} [element=window]
 */
export default function useEventListener<
  T extends EventTarget,
  E extends T extends Window ? WindowEventMap : HTMLElementEventMap,
  K extends keyof E
>(element: T, eventName: K, handler: EventListener) {
  // Create a ref that stores handler
  const savedHandler = useRef<EventListener | null>(null);

  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(
    () => {
      // Create event listener that calls handler function stored in ref
      const eventListener: EventListener = event =>
        savedHandler.current?.(event);

      // Add event listener
      element.addEventListener(eventName as string, eventListener);

      // Remove event listener on cleanup
      return () => {
        element.removeEventListener(eventName as string, eventListener);
      };
    },
    [eventName, element] // Re-run if eventName or element changes
  );
}
