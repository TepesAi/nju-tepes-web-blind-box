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
  },
  cors: {
    origin: '*', // 如果要限制来源可以写成 http://localhost:5173
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    credentials: true, // 如果前端要发送 cookie
  },
} as MidwayConfig;
