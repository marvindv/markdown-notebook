import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';

export const store = configureStore({
  reducer: rootReducer,
});

export default store;

/**
 * Actual type of the applications dispatch function. If extend functionality of
 * dispatch like awaiting redux-thunk actions is needed, the dispatch function
 * has to be annotated with this type.
 *
 * @example
 *   import { AppDispatch } from './store';
 *
 *   function MyComp() {
 *     const dispatch: AppDispatch = useDispatch();
 *
 *     const handleSomething = async () => {
 *       const fetched = await dispatch(fetchSomething());
 *       doSomethingAfterFetch(fetched);
 *     };
 *
 *     return (
 *       // ...
 *     );
 *   }
 */
export type AppDispatch = typeof store.dispatch;
