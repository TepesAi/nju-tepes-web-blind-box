import { Provide, Init, Scope, ScopeEnum } from '@midwayjs/core';
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

@Provide()
@Scope(ScopeEnum.Singleton)
export class ShareService {
  private db: Database.Database;

  @Init()
  async init() {
    // 确保数据目录存在
    const dataDir = path.resolve(__dirname, './data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const dbPath = path.join(dataDir, 'share.sqlite');
    console.log('[ShareService] 数据目录:', dataDir);
    this.db = new Database(dbPath);
    console.log('[ShareService] 数据库路径:', dbPath);
    // 启用外键约束
    this.db.pragma('foreign_keys = ON');
    
    // 创建表结构
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS shares (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user TEXT NOT NULL,
        prize TEXT NOT NULL,
        content TEXT NOT NULL,
        time TEXT DEFAULT (datetime('now', 'localtime')),
        likes INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shareId INTEGER NOT NULL,
        user TEXT NOT NULL,
        text TEXT NOT NULL,
        time TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY(shareId) REFERENCES shares(id) ON DELETE CASCADE
      );
    `);
  }

  // 添加晒单
  async addShare({ user, prize, content }) {
    const insert = this.db.prepare(`
      INSERT INTO shares (user, prize, content) 
      VALUES (?, ?, ?)
    `);
    
    insert.run(user, prize, content);
    return { success: true, msg: '晒单成功' };
  }

  // 获取所有晒单
  async getShares() {
    const shares = this.db.prepare(`
      SELECT * FROM shares 
      ORDER BY time DESC
    `).all();
    
    for (const share of shares) {
      const comments = this.db.prepare(`
        SELECT * FROM comments 
        WHERE shareId = ? 
        ORDER BY time ASC
      `).all(share.id);
      
      share.comments = comments;
    }
    
    return shares;
  }

  // 删除晒单
  async deleteShare({ id, user }) {
    return this.db.transaction(() => {
      // 检查权限
      const share = this.db.prepare('SELECT * FROM shares WHERE id = ?').get(id);
      if (!share || share.user !== user) {
        return { success: false, msg: '无权限删除' };
      }
      
      // 删除晒单及相关评论
      this.db.prepare('DELETE FROM shares WHERE id = ?').run(id);
      this.db.prepare('DELETE FROM comments WHERE shareId = ?').run(id);
      
      return { success: true, msg: '删除成功' };
    })();
  }

  // 添加评论
  async addComment({ shareId, user, text }) {
    const insert = this.db.prepare(`
      INSERT INTO comments (shareId, user, text) 
      VALUES (?, ?, ?)
    `);
    
    insert.run(shareId, user, text);
    return { success: true, msg: '评论成功' };
  }

  // 点赞晒单
  async likeShare({ id }) {
    this.db.prepare(`
      UPDATE shares 
      SET likes = likes + 1 
      WHERE id = ?
    `).run(id);
    
    return { success: true, msg: '点赞成功' };
  }
}