import { useEffect, useState } from 'react';
import getSliceFromLocalstorage from './utils/get-slice-from-localstorage.util';
import callSliceEvent from './utils/call-slice-event.util';
import defaultSliceValue from './utils/default-slice-value.util';
import { TConfig } from './types/config.type';
import setSliceToLocalstorage from './utils/set-slice-to-localstorage.util';
import errorTemplate from './utils/error-template.utli';
import { errorsMsg } from './constants/errors-msg.constant';
import generateSliceKeyName from './utils/generate-slice-key-name.util';
import isClientSide from './utils/is-client-side';
import { getSliceExpireTimestamp } from './utils/get-slice-expire-timestamp.util';
import { setSliceExpireTimestamp } from './utils/set-slice-expire-timestamp.util';

export default function useKillua<TSlice>(params: TConfig<TSlice>): {
  get: TSlice;
  set: (value: TSlice | ((value: TSlice) => TSlice)) => void;
  isReady: boolean;
  reducers: TConfig<TSlice>['reducers'];
  selectors: TConfig<TSlice>['selectors'];
} {
  // default value slice
  const defaultValueSlice: {
    server: TSlice;
    client: TSlice;
  } = {
    server: defaultSliceValue<TSlice>({
      config: params,
      type: 'server',
    }),
    client: defaultSliceValue<TSlice>({
      config: params,
      type: 'client',
    }),
  };

  // params.ssr is truthy ===> default `isReady` value is `false` and set to `true` in client-side
  // params.ssr is falsy ===> `isReady` value is `true`
  const [isReady, setIsReady] = useState(params.ssr ? false : true);

  // params.ssr is truthy ===> return `params.defaultServer`
  // params.ssr is falsy ===> return slice value from localstorage
  const [sliceState, setSliceState] = useState<TSlice>((): TSlice => {
    if (params.ssr) {
      return defaultValueSlice.server;
    } else {
      // `params.ssr` is `false` and application is server-side ===> throw error
      if (!isClientSide()) {
        errorTemplate({
          msg: errorsMsg.ssr.mustBeTrue,
          key: params.key,
        });
      }
      // `params.ssr` is `false` and application is client-side ===> return slice value from localstorage
      return getSliceFromLocalstorage<TSlice>({ config: params });
    }
  });

  // params.expire is truthy ===> check slice expire timestamp
  useEffect((): (() => void) => {
    let intervalId: any = null;
    if (params.expire) {
      const sliceExpireTimestamp = getSliceExpireTimestamp<TSlice>({
        config: params,
      });
      if (Number(sliceExpireTimestamp) < Date.now()) {
        new BroadcastChannel('killua').postMessage({
          type: 'slice-event-onExpire',
          key: params.key,
        });
      } else {
        intervalId = setInterval(
          (): void => {
            if (Number(sliceExpireTimestamp) < Date.now()) {
              new BroadcastChannel('killua').postMessage({
                type: 'slice-event-onExpire',
                key: params.key,
              });
            }
          },
          Number(sliceExpireTimestamp) - Date.now(),
        );
      }
    }
    return (): void => {
      clearInterval(intervalId);
    };
  }, [sliceState]);

  // params.ssr && !isReady ===> set `isReady` to `true` | get slice from localstorage and set to `sliceState`
  useEffect((): void => {
    if (params.ssr && !isReady) {
      setIsReady(true);
      setSliceState(getSliceFromLocalstorage<TSlice>({ config: params }));
    }
  }, [sliceState]);

  // broadcast channel with onmessage events
  useEffect((): void => {
    new BroadcastChannel('killua').onmessage = (event) => {
      // call message `localstorage-slice-value-not-valid-and-removed` ===> set `defaultValueSlice.client` to `sliceState` | remove slice value from localstorage
      if (
        event.data.type === 'localstorage-slice-value-not-valid-and-removed' &&
        event.data.key === params.key
      ) {
        setSliceState(defaultValueSlice.client);
        localStorage.removeItem(
          generateSliceKeyName({
            key: params.key,
          }),
        );
      }
      // call post message `slice-event-onChange` after set slice value to localstorage
      // call message `slice-event-onChange` ===> set `event.data.value` to `sliceState` | call event `onChange`
      if (
        event.data.type === 'slice-event-onChange' &&
        event.data.key === params.key
      ) {
        // `event.data.value` is not equal to `sliceState` ===> call event `onChange`
        if (event.data.value !== sliceState) {
          callSliceEvent<TSlice>({
            slice: event.data.value,
            event: params.events?.onChange,
          });
        }
        setSliceState(event.data.value);
      }
      // call post message `slice-event-onExpire` after set slice expire timestamp to localstorage
      // call message `slice-event-onExpire` ===> set `defaultValueSlice.client` | remove slice key from localstorage | update slice expire time | call event `onExpire`
      if (
        event.data.type === 'slice-event-onExpire' &&
        event.data.key === params.key
      ) {
        // localstorage value is not equal to `defaultValueSlice.client` ===> call event `onExpire`
        if (
          getSliceFromLocalstorage({ config: params }) !==
          defaultValueSlice.client
        ) {
          callSliceEvent<TSlice>({
            slice: defaultValueSlice.client,
            event: params.events?.onExpire,
          });
        }
        setSliceExpireTimestamp<TSlice>({
          config: params,
        });
        setSliceState(defaultValueSlice.client);
        localStorage.removeItem(
          generateSliceKeyName({
            key: params.key,
          }),
        );
      }
    };
  }, []);

  return {
    get: sliceState,
    set: (value: TSlice | ((value: TSlice) => TSlice)) => {
      setSliceToLocalstorage<TSlice>({
        config: params,
        slice: value instanceof Function ? value(sliceState) : value,
      });
    },
    isReady,
    reducers: undefined,
    selectors: undefined,
  };
}
