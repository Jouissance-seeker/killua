import { useEffect, useState } from 'react';
import getSliceFromStorage from './utils/slice-set-and-get/get-slice-from-storage.util';
import defaultSliceValue from './utils/other/default-slice-value.util';
import { TConfig, TReducers, TSelectors } from './types/config.type';
import setSliceToStorage from './utils/slice-set-and-get/set-slice-to-storage.util';
import errorTemplate from './utils/other/error-template.utli';
import isAvailableCsr from './utils/other/is-available-csr.util';
import { getSliceExpireTimestampFromStorage } from './utils/slice-expire-timer/get-slice-expire-timestamp-from-storage.util';
import broadcastEvents from './utils/other/broadcast-events.util';
import { broadcastChannelMessages } from './constants/broadcast-channel-messages.constant';
import { errorMessages } from './constants/error-messages.constant';
import generateSliceConfigChecksum from './utils/detect-slice-config-change/generate-slice-config-checksum.util';
import { getSliceConfigChecksumFromStorage } from './utils/detect-slice-config-change/get-slice-config-checksum-from-storage.util';
import { isConfigSsr } from './utils/other/is-config-ssr.util';

type URemoveStateParam<T> = T extends (
  first: any,
  ...args: infer Rest
) => infer R
  ? (...args: Rest) => R
  : never;

type URemoveNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

type TReturn<GSlice, GSelectors, GReducers> = URemoveNever<{
  get: GSlice;
  set: (value: GSlice | ((value: GSlice) => GSlice)) => void;
  isReady: boolean;
  selectors: GSelectors extends undefined
    ? never
    : {
        [K in keyof GSelectors]: URemoveStateParam<GSelectors[K]>;
      };
  reducers: GReducers extends undefined
    ? never
    : {
        [K in keyof GReducers]: URemoveStateParam<GReducers[K]>;
      };
}>;

export default function useKillua<
  GSlice,
  GSelectors extends TSelectors<GSlice> = undefined,
  GReducers extends TReducers<GSlice> = undefined,
>(
  params: TConfig<GSlice, GSelectors, GReducers>,
): TReturn<GSlice, GSelectors, GReducers> {
  // default value slice
  const defaultValueSlice: Record<'server' | 'client', GSlice> = {
    server: defaultSliceValue({
      config: params,
      type: 'server',
    }),
    client: defaultSliceValue({
      config: params,
      type: 'client',
    }),
  };

  // `is-config-ssr` truthy ===> default `isReady` value is `false` and set to `true` in client-side in return (only for `is-config-ssr`)
  const [isReady, setIsReady] = useState(
    isConfigSsr({ config: params }) ? false : true,
  );

  // `is-config-ssr` is truthy ===> return `params.defaultServer`
  // `is-config-ssr` is falsy ===> return slice value from storage
  const [sliceState, setSliceState] = useState((): GSlice => {
    if (isConfigSsr({ config: params })) {
      return defaultValueSlice.server;
    } else {
      // `is-config-ssr` is `false` and application is server-side ===> throw error
      if (!isAvailableCsr()) {
        errorTemplate({
          msg: errorMessages.defaultServer.required,
          key: params.key,
        });
      }
      // `is-config-ssr` is `false` and application is client-side ===> return slice value from storage
      return getSliceFromStorage({ config: params });
    }
  });

  // is-changed slice config by developer ===> call broadcast channel event `broadcastChannelMessages.storageValueNotValid`
  useEffect((): void => {
    const sliceConfigChecksumFromStorage = getSliceConfigChecksumFromStorage({
      config: params,
    });
    const currentSliceConfigChecksum = generateSliceConfigChecksum({
      config: params,
    });
    if (sliceConfigChecksumFromStorage !== currentSliceConfigChecksum) {
      new BroadcastChannel('killua').postMessage({
        type: broadcastChannelMessages.storageValueNotValid,
        key: params.key,
      });
    }
  }, []);

  // params.expire is truthy ===> check slice expire timestamp
  useEffect((): (() => void) => {
    const broadcastChannel = new BroadcastChannel('killua');
    let intervalId: any = null;
    if (params.expire) {
      const sliceExpireTimestamp = getSliceExpireTimestampFromStorage({
        config: params,
      });
      if (Number(sliceExpireTimestamp) < Date.now()) {
        broadcastChannel.postMessage({
          type: broadcastChannelMessages.sliceEventOnExpire,
          key: params.key,
          value: sliceState,
        });
      } else {
        intervalId = setInterval(
          (): void => {
            if (Number(sliceExpireTimestamp) < Date.now()) {
              broadcastChannel.postMessage({
                type: broadcastChannelMessages.sliceEventOnExpire,
                key: params.key,
                value: sliceState,
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

  // is-config-ssr && !isReady ===> set `isReady` to `true` | get slice from storage and set to `sliceState`
  useEffect((): void => {
    if (isConfigSsr({ config: params }) && !isReady) {
      setIsReady(true);
      setSliceState(getSliceFromStorage({ config: params }));
    }
  }, [sliceState]);

  // broadcast channel events
  useEffect((): void => {
    broadcastEvents({
      config: params,
      sliceState,
      setSliceState,
    });
  }, []);

  // params.selectors is truthy ===> assign slice config selectors to selectors object
  const selectors: Record<string, (payload?: any) => any> = {};
  if (params.selectors!) {
    for (const selectorName in params.selectors!) {
      if (
        Object.prototype.hasOwnProperty.call(params.selectors!, selectorName)
      ) {
        const selectorFunc = params.selectors[selectorName];
        selectors[selectorName] = (payload?: any) => {
          return selectorFunc(sliceState, payload);
        };
      }
    }
  }

  // params.reducers is truthy ===> assign slice config reducers to reducers object
  const reducers: Record<string, (payload?: any) => GSlice> = {};
  if (params.reducers!) {
    for (const reducerName in params.reducers!) {
      if (Object.prototype.hasOwnProperty.call(params.reducers!, reducerName)) {
        const reducerFunc = params.reducers[reducerName];
        reducers[reducerName] = (payload?: any) => {
          setSliceToStorage({
            config: params,
            slice: reducerFunc(sliceState, payload),
          });
          return reducerFunc(sliceState, payload);
        };
      }
    }
  }

  return {
    get: sliceState,
    set: (value: GSlice | ((value: GSlice) => GSlice)) => {
      setSliceToStorage({
        config: params,
        slice: value instanceof Function ? value(sliceState) : value,
      });
    },
    reducers,
    selectors,
    isReady,
  } as TReturn<GSlice, GSelectors, GReducers>;
}
