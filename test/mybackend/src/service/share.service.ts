// src/service/share.service.ts
import { Provide, Init, Scope, ScopeEnum } from '@midwayjs/core';
import initSqlJs from 'sql.js';
import * as fs from 'fs';

@Provide()
@Scope(ScopeEnum.Singleton)
export class ShareService {
  db;
  SQL;

  @Init()
  async init() {
    this.SQL = await initSqlJs();
    const dbPath = './share.sqlite';

    if (fs.existsSync(dbPath)) {
      const fileData = fs.readFileSync(dbPath);
      this.db = new this.SQL.Database(fileData);
    } else {
      this.db = new this.SQL.Database();
      this.db.run(`
        CREATE TABLE IF NOT EXISTS shares (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user TEXT,
          prize TEXT,
          content TEXT,
          time TEXT,
          likes INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          shareId INTEGER,
          user TEXT,
          text TEXT,
          time TEXT
        );
      `);
      this.saveDB();
    }
  }

  saveDB() {
    const data = this.db.export();
    fs.writeFileSync('./share.sqlite', Buffer.from(data));
  }

  async addShare({ user, prize, content }) {
    const time = new Date().toLocaleString();
    this.db.run(
      'INSERT INTO shares (user, prize, content, time) VALUES (?, ?, ?, ?)',
      [user, prize, content, time]
    );
    this.saveDB();
    return { success: true, msg: '晒单成功' };
  }

  async getShares() {
    const stmt = this.db.prepare('SELECT * FROM shares ORDER BY time DESC');
    const shares = [];
    while (stmt.step()) {
      shares.push(stmt.getAsObject());
    }
    stmt.free();

    for (const share of shares) {
      const commentStmt = this.db.prepare('SELECT * FROM comments WHERE shareId = ?');
      commentStmt.bind([share.id]);
      const comments = [];
      while (commentStmt.step()) {
        comments.push(commentStmt.getAsObject());
      }
      commentStmt.free();
      share.comments = comments;
    }

    return shares;
  }

  async deleteShare({ id, user }) {
    const stmt = this.db.prepare('SELECT * FROM shares WHERE id = ?');
    stmt.bind([id]);
    const record = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    if (!record || record.user !== user) return { success: false, msg: '无权限删除' };

    this.db.run('DELETE FROM shares WHERE id = ?', [id]);
    this.db.run('DELETE FROM comments WHERE shareId = ?', [id]);
    this.saveDB();
    return { success: true, msg: '删除成功' };
  }

  async addComment({ shareId, user, text }) {
    const time = new Date().toLocaleString();
    this.db.run(
      'INSERT INTO comments (shareId, user, text, time) VALUES (?, ?, ?, ?)',
      [shareId, user, text, time]
    );
    this.saveDB();
    return { success: true, msg: '评论成功' };
  }

  async likeShare({ id }) {
    this.db.run('UPDATE shares SET likes = likes + 1 WHERE id = ?', [id]);
    this.saveDB();
    return { success: true, msg: '点赞成功' };
  }
}
