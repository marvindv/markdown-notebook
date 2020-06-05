/**
 * Generates a string based on the given `name` value that does not collide with
 * any string in the given `existing` array by attaching a number to the `name`
 * string. This number starts with `12 if a collision with the exact `name`
 * value was detected. If there is a collision with a string of the format
 * `${name} 2` detected, `${name} 3` is tried, and so on, until a collision free
 * string is found.
 *
 * @export
 * @param {string} name
 * @param {string[]} existing
 * @returns {string}
 */
export function getCollisionFreeName(name: string, existing: string[]): string {
  let suffixNumber: number | null = null;
  const titleWithSuffix = () => name + (suffixNumber ? ' ' + suffixNumber : '');
  let collision = true;
  while (collision) {
    const currentTitle = titleWithSuffix();
    if (existing.find(s => s === currentTitle)) {
      suffixNumber = suffixNumber ? suffixNumber + 1 : 2;
    } else {
      collision = false;
    }
  }

  return titleWithSuffix();
}
