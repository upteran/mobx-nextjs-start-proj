import { action, observable, computed, runInAction } from 'mobx';
import { useStaticRendering } from 'mobx-react';
import { useMemo } from 'react';
// eslint-disable-next-line react-hooks/rules-of-hooks
useStaticRendering(typeof window === 'undefined');

let store;

class Store {
  @observable lastUpdate = 0;

  @observable light = false;

  @action start = () => {
    this.timer = setInterval(() => {
      runInAction(() => {
        this.lastUpdate = Date.now();
        this.light = true;
      });
    }, 1000);
  };

  @computed get timeString() {
    const pad = n => (n < 10 ? `0${n}` : n);
    const format = t =>
      `${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}:${pad(
        t.getUTCSeconds()
      )}`;
    return format(new Date(this.lastUpdate));
  }

  stop = () => clearInterval(this.timer);

  hydrate = data => {
    if (!data) return;

    this.lastUpdate = data.lastUpdate !== null ? data.lastUpdate : Date.now();
    this.light = !!data.light;
  };
}

function initializeStore(initialData = null) {
  // eslint-disable-next-line no-underscore-dangle
  const _store = store ?? new Store();

  // If your page has Next.js data fetching methods that use a Mobx store, it will
  // get hydrated here, check `pages/ssg.js` and `pages/ssr.js` for more details
  if (initialData) {
    _store.hydrate(initialData);
  }
  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return _store;
  // Create the store once in the client
  if (!store) store = _store;

  return _store;
}

export function useStore(initialState) {
  // eslint-disable-next-line no-shadow
  const store = useMemo(() => initializeStore(initialState), [initialState]);
  return store;
}
