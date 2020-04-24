import { RefObject, useEffect, useRef } from 'react';

/**
 * A hook that calls `onOutsideClick` everytime the user clicks outside of the
 * element attached to `rootRef` while `shouldWatch` is `true`.
 *
 * Based on https://stackoverflow.com/a/42234988
 *
 * @param {RefObject<HTMLElement>} rootRef
 * @param {boolean} shouldWatch
 * @param {() => void} onOutsideClick
 */
export default function useOutsideClick(
  rootRef: RefObject<HTMLElement>,
  shouldWatch: boolean,
  onOutsideClick: () => void
) {
  const unregisterFn = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (shouldWatch) {
      const handleClickOutside = (event: MouseEvent) => {
        if (rootRef.current && !rootRef.current.contains(event.target as any)) {
          onOutsideClick();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      const fn = () => {
        unregisterFn.current = null;
        document.removeEventListener('mousedown', handleClickOutside);
      };
      unregisterFn.current = fn;
      return fn;
    }

    if (unregisterFn.current) {
      unregisterFn.current();
      unregisterFn.current = null;
    }
  }, [rootRef, shouldWatch, onOutsideClick]);
}
