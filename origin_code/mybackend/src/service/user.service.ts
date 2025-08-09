import { Singleton, Init } from '@midwayjs/core';
import * as Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

@Singleton()
export class UserService {
  private db: Database.Database;

  constructor() {
    console.log('[UserService] 实例化', Date.now());
  }

  @Init()
  async init() {
    console.log('[UserService] 初始化数据库');
    
    // 确保数据目录存在
    const dataDir = path.resolve(__dirname, './data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    console.log('[UserService] 数据目录:', dataDir);
    const dbPath = path.join(dataDir, 'data.sqlite');
    this.db = new Database(dbPath);
    
    // 启用外键约束
    this.db.pragma('foreign_keys = ON');
    
    // 创建表结构
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        username TEXT NOT NULL,
        balance REAL DEFAULT 100.0,
        lastSignIn TEXT DEFAULT ''
      );
      
      CREATE TABLE IF NOT EXISTS boxes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS prizes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        boxId INTEGER NOT NULL,
        name TEXT NOT NULL,
        weight INTEGER NOT NULL,
        FOREIGN KEY(boxId) REFERENCES boxes(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        boxId INTEGER NOT NULL,
        prize TEXT NOT NULL,
        time TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY(boxId) REFERENCES boxes(id),
        FOREIGN KEY(email) REFERENCES users(email)
      );
    `);
    
    console.log('[UserService] 数据库已初始化');
  }

  // 用户注册
  async register({ email, password }) {
    if (!email || !password) return { success: false, msg: '缺少参数' };

    try {
      // 检查用户是否存在
      const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
      const exists = stmt.get(email);
      
      if (exists) return { success: false, msg: '用户已存在' };

      const username = email.split('@')[0];
      const insert = this.db.prepare(`
        INSERT INTO users (email, password, username) 
        VALUES (?, ?, ?)
      `);
      
      insert.run(email, password, username);
      
      return {
        success: true,
        msg: '注册成功',
        data: { username, balance: 100.0 }
      };
    } catch (err) {
      console.error('注册失败:', err);
      return { success: false, msg: '注册失败' };
    }
  }

  // 获取用户信息
  async getUser({ uid }) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(uid);
  }

  // 用户登录
  async login({ email, password }) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ? AND password = ?');
    const user = stmt.get(email, password);

    if (!user) return { success: false, msg: '邮箱或密码错误' };

    return {
      success: true,
      msg: '登录成功',
      data: {
        username: user.username,
        balance: user.balance
      }
    };
  }

  // 获取余额
  async getBalance({ email }) {
    const stmt = this.db.prepare('SELECT balance FROM users WHERE email = ?');
    const row = stmt.get(email);

    if (!row) return { success: false, msg: '用户不存在' };
    return { success: true, balance: row.balance };
  }

  // 签到功能
  async signIn({ email }) {
    const now = new Date().toDateString();
    const stmt = this.db.prepare('SELECT lastSignIn FROM users WHERE email = ?');
    const user = stmt.get(email);

    if (!user) return { success: false, msg: '用户不存在' };
    if (user.lastSignIn === now) return { success: false, msg: '今日已签到' };

    const update = this.db.prepare(`
      UPDATE users 
      SET balance = balance + 10, lastSignIn = ? 
      WHERE email = ?
    `);
    
    update.run(now, email);
    return { success: true, msg: '签到成功，奖励10元' };
  }

  // 充值功能
  async recharge({ email, amount }) {
    if (!email || typeof amount !== 'number' || amount <= 0) {
      return { success: false, msg: '充值参数无效' };
    }

    try {
      const update = this.db.prepare(`
        UPDATE users 
        SET balance = balance + ? 
        WHERE email = ?
      `);
      
      const result = update.run(amount, email);
      
      if (result.changes === 0) {
        return { success: false, msg: '用户不存在' };
      }
      
      return { success: true, msg: `充值成功，+${amount} 元` };
    } catch (err) {
      console.error('充值失败:', err);
      return { success: false, msg: '充值失败' };
    }
  }

  // 获取所有用户
  async getAllUsers() {
    const stmt = this.db.prepare('SELECT * FROM users');
    return stmt.all();
  }

  // 获取盲盒列表
  async getAllBoxes() {
    console.log('获取盲盒列表');
    const boxes = this.db.prepare('SELECT * FROM boxes').all();
    
    for (const box of boxes) {
      const prizes = this.db.prepare('SELECT * FROM prizes WHERE boxId = ?').all(box.id);
      box.prizes = prizes;
    }
    
    return boxes;
  }

  // 获取盲盒详情
  async getBoxDetail({ id }) {
    const box = this.db.prepare('SELECT * FROM boxes WHERE id = ?').get(id);
    if (!box) return null;

    const prizes = this.db.prepare('SELECT * FROM prizes WHERE boxId = ?').all(id);
    return { ...box, prizes };
  }

  // 添加盲盒
  async addBox({ name, price }) {
    const insert = this.db.prepare('INSERT INTO boxes (name, price) VALUES (?, ?)');
    insert.run(name, price);
    return { success: true };
  }

  // 添加奖品
  async addPrize({ boxId, name, weight }) {
    const insert = this.db.prepare('INSERT INTO prizes (boxId, name, weight) VALUES (?, ?, ?)');
    insert.run(boxId, name, weight);
    return { success: true };
  }

  // 抽奖功能
  async drawBox({ email, boxId }) {
    return this.db.transaction(() => {
      // 查询用户
      const user = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user) return { success: false, msg: '用户不存在' };

      // 查询盲盒
      const box = this.db.prepare('SELECT * FROM boxes WHERE id = ?').get(boxId);
      if (!box) return { success: false, msg: '盲盒不存在' };

      // 检查余额
      if (user.balance < box.price) {
        return { success: false, msg: '余额不足' };
      }

      // 查询奖品
      const prizes = this.db.prepare('SELECT * FROM prizes WHERE boxId = ?').all(boxId);
      if (prizes.length === 0) {
        return { success: false, msg: '该盲盒没有奖品' };
      }

      // 权重抽奖
      const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
      const rand = Math.random() * totalWeight;
      let acc = 0;
      let selectedPrize = prizes[0];
      
      for (const prize of prizes) {
        acc += prize.weight;
        if (rand <= acc) {
          selectedPrize = prize;
          break;
        }
      }

      // 扣除余额
      this.db.prepare('UPDATE users SET balance = balance - ? WHERE email = ?')
        .run(box.price, email);
      
      // 记录订单
      this.db.prepare(`
        INSERT INTO orders (email, boxId, prize, time) 
        VALUES (?, ?, ?, datetime('now'))
      `).run(email, boxId, selectedPrize.name);

      return {
        success: true,
        msg: '抽奖成功',
        data: {
          prize: selectedPrize.name,
          balance: user.balance - box.price
        }
      };
    })();
  }

  // 获取订单
  async getOrders({ email }) {
    const orders = this.db.prepare(`
      SELECT * FROM orders 
      WHERE email = ? 
      ORDER BY time DESC
    `).all(email);
    
    return { success: true, orders };
  }

  // 删除订单
  async deleteOrder({ id, email }) {
    const result = this.db.prepare(`
      DELETE FROM orders 
      WHERE id = ? AND email = ?
    `).run(id, email);
    
    if (result.changes === 0) {
      return { success: false, msg: '订单不存在或无权限删除' };
    }
    
    return { success: true, msg: '订单已删除' };
  }
}