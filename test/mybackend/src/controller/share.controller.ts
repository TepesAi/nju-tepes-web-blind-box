// src/controller/share.controller.ts
import { Controller, Post, Body, Get, Inject } from '@midwayjs/core';
import { ShareService } from '../service/share.service';

@Controller('/api/share')
export class ShareController {
  @Inject()
  shareService: ShareService;

  // 添加分享
  @Post('/add')
  async addShare(@Body() body: any) {
    const { user, prize, content } = body;
    if (!user || !prize || !content) {
      return { success: false, msg: '缺少必要参数' };
    }
    return await this.shareService.addShare({ user, prize, content });
  }

  // 获取所有分享（带评论）
  @Get('/list')
  async getShares() {
    return await this.shareService.getShares();
  }

  // 删除分享
  @Post('/delete')
  async deleteShare(@Body() body: any) {
    const { id, user } = body;
    if (!id || !user) {
      return { success: false, msg: '缺少必要参数' };
    }
    return await this.shareService.deleteShare({ id, user });
  }

  // 添加评论
  @Post('/comment')
  async addComment(@Body() body: any) {
    const { shareId, user, text } = body;
    if (!shareId || !user || !text) {
      return { success: false, msg: '缺少必要参数' };
    }
    return await this.shareService.addComment({ shareId, user, text });
  }

  // 点赞分享
  @Post('/like')
  async likeShare(@Body() body: any) {
    const { id } = body;
    if (!id) {
      return { success: false, msg: '缺少分享ID' };
    }
    return await this.shareService.likeShare({ id });
  }
}