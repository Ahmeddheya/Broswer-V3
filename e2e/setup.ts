import { beforeAll, beforeEach, afterAll } from '@jest/globals';
import { cleanup, init } from 'detox';

const config = require('../.detoxrc.js');

beforeAll(async () => {
  await init(config, { initGlobals: false });
});

beforeEach(async () => {
  await device.reloadReactNative();
});

afterAll(async () => {
  await cleanup();
});