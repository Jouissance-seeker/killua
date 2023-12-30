import { errorMessages } from './constants/error-messages.constant';
import { TConfig, TReducers, TSelectors } from './types/config.type';
import errorTemplate from './utils/other/error-template.utli';
import {
  isBoolean,
  isEmptyObject,
  isEmptyString,
  isFunction,
  isObject,
  isString,
  isUndefined,
} from './utils/other/type-guards.util';

export default function createSlice<
  GSlice,
  GSelectors extends TSelectors<GSlice> = undefined,
  GReducers extends TReducers<GSlice> = undefined,
>(
  params: TConfig<GSlice, GSelectors, GReducers>,
): TConfig<GSlice, GSelectors, GReducers> {
  // validate `defaultClient`
  if (isUndefined(params.defaultClient)) {
    errorTemplate({
      msg: errorMessages.defaultClient.required,
      key: params.key,
    });
  }

  // validate `defaultServer`
  if (!isUndefined(params.defaultServer)) {
    if (typeof params.defaultClient !== typeof params.defaultServer) {
      errorTemplate({
        msg: errorMessages.defaultServer.invalidType,
        key: params.key,
      });
    }
  }

  // validate `key`
  if (isUndefined(params.key)) {
    errorTemplate({
      msg: errorMessages.key.required,
      key: params.key,
    });
  } else if (!isString(params.key)) {
    errorTemplate({
      msg: errorMessages.key.invalidType,
      key: params.key,
    });
  } else if (isEmptyString(params.key)) {
    errorTemplate({
      msg: errorMessages.key.empty,
      key: params.key,
    });
  } else if ((params.key as string).startsWith('slice-')) {
    errorTemplate({
      msg: errorMessages.key.startWithSlice,
      key: params.key,
    });
  } else if ((params.key as string).startsWith('slices-')) {
    errorTemplate({
      msg: errorMessages.key.startWithSlices,
      key: params.key,
    });
  }

  // validate `encrypt`
  if (!isUndefined(params.encrypt) && !isBoolean(params.encrypt)) {
    errorTemplate({
      msg: errorMessages.encrypt.invalidType,
      key: params.key,
    });
  }

  // validate `expire`
  if (
    !isUndefined(params.expire) &&
    !/^\d+d-(?:[0-1]?\d|2[0-3])[hH]-[0-5]?\d[mM]-[0-5]?\d[sS]$/.test(
      params.expire,
    )
  ) {
    errorTemplate({
      msg: errorMessages.expire.invalidFormat,
      key: params.key,
    });
  }

  // validate `reducers`
  if (!isUndefined(params.reducers)) {
    if (!isObject(params.reducers)) {
      errorTemplate({
        msg: errorMessages.reducers.invalidType,
        key: params.key,
      });
    } else if (isEmptyObject(params.reducers)) {
      errorTemplate({
        msg: errorMessages.reducers.empty,
        key: params.key,
      });
    } else if (
      Object.keys(params.reducers).some(
        (key): boolean => !isFunction(params.reducers![key]),
      )
    ) {
      errorTemplate({
        msg: errorMessages.reducers.keysValueIsNotFunction,
        key: params.key,
      });
    }
  }

  // validate `selectors`
  if (!isUndefined(params.selectors)) {
    if (!isObject(params.selectors)) {
      errorTemplate({
        msg: errorMessages.selectors.invalidType,
        key: params.key,
      });
    } else if (isEmptyObject(params.selectors)) {
      errorTemplate({
        msg: errorMessages.selectors.empty,
        key: params.key,
      });
    } else if (
      Object.keys(params.selectors).some(
        (key): boolean => !isFunction(params.selectors![key]),
      )
    ) {
      errorTemplate({
        msg: errorMessages.selectors.keysValueIsNotFunction,
        key: params.key,
      });
    }
  }

  // validate `events`
  if (!isUndefined(params.events)) {
    if (!isObject(params.events)) {
      errorTemplate({
        msg: errorMessages.events.invalidType,
        key: params.key,
      });
    } else if (isEmptyObject(params.events)) {
      errorTemplate({
        msg: errorMessages.events.empty,
        key: params.key,
      });
    } else if (
      Object.keys(params.events).some(
        (key): boolean => !['onExpire', 'onChange'].includes(key),
      )
    ) {
      errorTemplate({
        msg: errorMessages.events.keysIsNotValid,
        key: params.key,
      });
    } else if (
      Object.keys(params.events).some(
        (key): boolean =>
          !isFunction(params.events![key as typeof params.events]),
      )
    ) {
      errorTemplate({
        msg: errorMessages.events.keysValueIsNotFunction,
        key: params.key,
      });
    }
  }

  // validate `schema`
  if (!isUndefined(params.schema)) {
    if (
      !('parse' in Object(params.schema)) &&
      !('validateSync' in Object(params.schema))
    ) {
      errorTemplate({
        msg: errorMessages.schema.invalidType,
        key: params.key,
      });
    }
  }

  // validate other keys
  const validKeys = new Set([
    'defaultClient',
    'defaultServer',
    'key',
    'encrypt',
    'expire',
    'schema',
    'reducers',
    'selectors',
    'events',
  ]);

  const notDefinedSliceKey = Object.keys(params).filter(
    (key) => !validKeys.has(key),
  );
  if (notDefinedSliceKey.length > 0) {
    errorTemplate({
      msg: errorMessages.other.notDefined(notDefinedSliceKey),
      key: params.key,
    });
  }

  return params as TConfig<GSlice, GSelectors, GReducers>;
}
