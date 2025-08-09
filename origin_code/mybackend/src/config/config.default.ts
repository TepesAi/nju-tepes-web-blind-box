import { MidwayConfig } from '@midwayjs/core';

export default {
  keys: '1754408336538_819',

  koa: {
    port: 7001,
  },
  staticFile: {
    dirs: {
      default: {
        prefix: '/',
        dir: 'public',
      },
      assets: {
        prefix: '/assets',
        dir: 'public/assets',
      },
    }
  }
} as MidwayConfig;
