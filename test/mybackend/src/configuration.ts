import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
//import { join } from 'path';
import * as crossDomain from '@midwayjs/cross-domain';
import { ReportMiddleware } from './middleware/report.middleware';
import * as staticFile from '@midwayjs/static-file';
import DefaultConfig from './config/config.default';


@Configuration({
  imports: [
    crossDomain,
    koa,
    validate,
    staticFile,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
  ],
  //importConfigs: [join(__dirname, './config')],
  importConfigs: [{default: DefaultConfig}],
})


export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  async onReady() {
    this.app.useMiddleware([ReportMiddleware]);
  }
}
