import { TConfig, TReducers, TSelectors } from '../../types/config.type';
import * as CryptoJS from 'crypto-js';

export default function generateSliceConfigChecksum<
  GSlice,
  GSelectors extends TSelectors<GSlice>,
  GReducers extends TReducers<GSlice>,
>(params: { config: TConfig<GSlice, GSelectors, GReducers> }): string {
  // generate md5 checksum with slice config (exclude `key`, `events`, `selectors`, `reducers`, `schema`)
  const sliceConfigChecksum: string = CryptoJS.MD5(
    JSON.stringify({
      ...params.config,
      key: undefined,
      events: undefined,
      selectors: undefined,
      reducers: undefined,
      schema: undefined,
    }),
  ).toString();

  return sliceConfigChecksum;
}
