import { Controller, Post, Body, Inject, Get } from '@midwayjs/core';
import { UserService } from '../service/user.service';

@Controller('/api/user')
export class UserController {
  @Inject()
  userService: UserService;

  @Post('/register')
  async register(@Body() body: any) {
    return this.userService.register(body);
  }

  @Post('/login')
  async login(@Body() body: any) {
    return this.userService.login(body);
  }

  @Get('/all')
  async getAll() {
    return await this.userService.getAllUsers();
  }

  @Post('/signIn')
  async signIn(@Body() body: any) {
    return this.userService.signIn(body);
  }

  @Post('/getBalance')
  async getBalance(@Body() body: any) {
    return this.userService.getBalance(body);
  }

  @Post('/recharge')
  async recharge(@Body() body: any) {
    return this.userService.recharge(body);
  }

  // 获取盲盒列表
  @Get('/boxes')
  async getAllBoxes() {
    console.log('进入方法boxes');
    return this.userService.getAllBoxes();
  }

  // 获取盲盒详情（含奖品）
  @Post('/boxDetail')
  async getBoxDetail(@Body() body: any) {
    return this.userService.getBoxDetail(body);
  }

  // 添加盲盒（初始化/管理用）
  @Post('/addBox')
  async addBox(@Body() body: any) {
    return this.userService.addBox(body);
  }

  // 添加奖品（初始化/管理用）
  @Post('/addPrize')
  async addPrize(@Body() body: any) {
    return this.userService.addPrize(body);
  }

  @Post('/drawBox')
  async drawBox(@Body() body: any) {
    return this.userService.drawBox(body);
  }

  @Post('/getOrders')
  async getOrders(@Body() body: any) {
    return this.userService.getOrders(body);
  }

  @Post('/deleteOrder')
  async deleteOrder(@Body() body: any) {
    return this.userService.deleteOrder(body);
  }
}
