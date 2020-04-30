import Api from './api';
import LocalStorageApi from './localStorage';

const api = new LocalStorageApi();

export { Api };

/**
 * Gets the currently used api.
 *
 * @export
 * @returns {Api}
 */
export default function getApi(): Api {
  return api;
}
