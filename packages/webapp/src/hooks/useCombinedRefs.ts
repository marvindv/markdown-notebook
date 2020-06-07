import {
  MutableRefObject,
  RefCallback,
  RefObject,
  useEffect,
  useRef,
} from 'react';

/**
 * Easily combine multiple refs into one.
 *
 * From https://github.com/facebook/react/issues/13029#issuecomment-522632038
 *
 * @export
 * @template T
 * @param {(...(RefObject<T> | RefCallback<T>)[])} refs
 * @returns {React.Ref<T>}
 */
export default function useCombinedRefs<T>(
  ...refs: (RefObject<T> | RefCallback<T>)[]
): MutableRefObject<T | null> {
  const targetRef = useRef<T | null>(null);

  useEffect(() => {
    refs.forEach(ref => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        (ref as MutableRefObject<T | null>).current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
}
