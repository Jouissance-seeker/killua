import { describe, expect, it } from 'vitest';
import { errorsMsg } from '../src/constants/errors-msg.constant';
import createSlice from '../src/create-slice.function';

describe('create-slice.function.ts', (): void => {
  describe('validate `default`', (): void => {
    const sliceConfig: any = {
      key: 'test',
    };
    it('should throw an error if `default` is not provided when `ssr` is false', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          default: undefined,
        }),
      ).toThrow(errorsMsg.default.required);
    });
  });
  describe('validate `defaultClient`', (): void => {
    const sliceConfig: any = {
      key: 'test',
      ssr: true,
      defaultServer: 1,
    };
    it('should throw an error if `defaultClient` is not provided when `ssr` is true', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          defaultClient: undefined,
        }),
      ).toThrow(errorsMsg.defaultClient.required);
    });
  });
  describe('validate `defaultServer`', (): void => {
    const sliceConfig: any = {
      key: 'test',
      ssr: true,
      defaultClient: 1,
    };
    it('should throw an error if `defaultServer` is not provided when `ssr` is true', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          defaultServer: undefined,
        }),
      ).toThrow(errorsMsg.defaultServer.required);
    });
  });
  describe('validate `ssr`', (): void => {
    const sliceConfig: any = {
      key: 'test',
      default: 1,
    };
    it('should throw an error if `ssr` is not a boolean', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          ssr: 'test',
        }),
      ).toThrow(errorsMsg.ssr.invalidType);
    });
  });
  describe('validate `key`', (): void => {
    const sliceConfig: any = {
      default: 1,
    };
    it('should throw an error if `key` is not provided', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          key: undefined as any,
        }),
      ).toThrow(errorsMsg.key.required);
    });
    it('should throw an error if `key` is not a string', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          key: 1 as any,
        }),
      ).toThrow(errorsMsg.key.invalidType);
    });
    it('should throw an error if `key` is an empty string', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          key: '',
        }),
      ).toThrow(errorsMsg.key.empty);
    });
    it('should throw an error if `key` starts with `slice-`', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          key: 'slice-counter',
        }),
      ).toThrow(errorsMsg.key.startWithSlice);
    });
    it('should throw an error if `key` starts with `slices-`', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          key: 'slices-counter',
        }),
      ).toThrow(errorsMsg.key.startWithSlices);
    });
  });
  describe('validate `encrypt`', (): void => {
    const sliceConfig: any = {
      key: 'test',
      default: 1,
    };
    it('should throw an error if `encrypt` is not a boolean', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          encrypt: 'test',
        }),
      ).toThrow(errorsMsg.encrypt.invalidType);
    });
  });
  describe('validate `expire`', (): void => {
    const sliceConfig: any = {
      key: 'test',
      default: 1,
    };
    it('should not throw an error if `expire` is undefined', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          expire: undefined,
        }),
      ).not.toThrow();
    });
    it('should not throw an error if `expire` is a valid', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          expire: '1h-30m-0s',
        }),
      ).not.toThrow();
    });
    it('should throw an error if `expire` is not a valid', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          expire: 'test',
        }),
      ).toThrow(errorsMsg.expire.invalidType);
    });
  });
  describe('validate `reducers`', (): void => {
    const sliceConfig: any = {
      key: 'test',
      default: 1,
    };
    it('should throw an error if `reducers` is not an object', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          reducers: 'test',
        }),
      ).toThrow(errorsMsg.reducers.invalidType);
    });
    it('should throw an error if `reducers` keys are empty', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          reducers: {},
        }),
      ).toThrow(errorsMsg.reducers.empty);
    });
    it('should throw an error if `reducers` keys value is not a function', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          reducers: { test: 'test' },
        }),
      ).toThrow(errorsMsg.reducers.keysValueIsNotFunction);
    });
  });
  describe('validate `selectors`', (): void => {
    const sliceConfig: any = {
      key: 'test',
      default: 1,
    };
    it('should throw an error if `selectors` is not an object', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          selectors: 'test',
        }),
      ).toThrow(errorsMsg.selectors.invalidType);
    });
    it('should throw an error if `selectors` keys are empty', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          selectors: {},
        }),
      ).toThrow(errorsMsg.selectors.empty);
    });
    it('should throw an error if `selectors` keys value is not a function', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          selectors: { test: 'test' },
        }),
      ).toThrow(errorsMsg.selectors.keysValueIsNotFunction);
    });
  });
  describe('validate `events`', (): void => {
    const sliceConfig: any = {
      key: 'test',
      default: 1,
    };
    it('should throw an error if `events` is not an object', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          events: 'test',
        }),
      ).toThrow(errorsMsg.events.invalidType);
    });
    it('should throw an error if `events` keys are empty', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          events: {},
        }),
      ).toThrow(errorsMsg.events.empty);
    });
    it('should throw an error if `events` keys are not `onChange` or `onExpire`', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          events: { test: (): void => {} },
        }),
      ).toThrow(errorsMsg.events.keysIsNotValid);
    });
    it('should throw an error if `events` key `onChange` value is not a function', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          events: { onChange: 'test' },
        }),
      ).toThrow(errorsMsg.events.keysValueIsNotFunction);
    });
    it('should throw an error if `events` key `onExpire` value is not a function', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          events: { onExpire: 'test' },
        }),
      ).toThrow(errorsMsg.events.keysValueIsNotFunction);
    });
  });
  describe('validate `schema`', (): void => {
    const sliceConfig: any = {
      key: 'test',
      default: 1,
    };
    it('should throw an error if `schema` is not an valid', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          schema: 'test',
        }),
      ).toThrow(errorsMsg.schema.invalidType);
    });
  });

  describe('validate other keys', (): void => {
    const sliceConfig: any = {
      key: 'test',
    };
    it('should not throw an error when events have valid keys', (): void => {
      expect(() =>
        createSlice<number>({
          ...sliceConfig,
          default: 1,
          events: {
            onChange: (): void => {},
            onExpire: (): void => {},
          },
        }),
      ).not.toThrow();
    });
  });
});
