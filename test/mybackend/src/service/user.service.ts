import { Provide, Scope, ScopeEnum, Init } from '@midwayjs/core';
import initSqlJs from 'sql.js';
import * as fs from 'fs';

@Provide()
@Scope(ScopeEnum.Singleton) // 显式指定为单例
export class UserService {
  db;
  SQL;

  constructor() {
    console.log('[UserController] 实例化');
  }

  @Init()
  async init() {
    this.SQL = await initSqlJs();

    // 如果有数据库文件则读取，否则新建
    let dbData;
    if (fs.existsSync('./data.sqlite')) {
      dbData = fs.readFileSync('./data.sqlite');
      this.db = new this.SQL.Database(dbData);
    } else {
      this.db = new this.SQL.Database();
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE,
          password TEXT,
          username TEXT,
          balance REAL DEFAULT 100.0,
          lastSignIn TEXT DEFAULT ''
        );
        CREATE TABLE IF NOT EXISTS boxes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          price REAL
        );
        CREATE TABLE IF NOT EXISTS prizes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          boxId INTEGER,
          name TEXT,
          weight INTEGER
        );
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT,
          boxId INTEGER,
          prize TEXT,
          time TEXT
        );
      `);
      this.saveDB(); // 首次创建立即保存
    }
    console.log('[UserService] 数据库已初始化');
  }

  // 保存数据库到文件
  saveDB() {
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync('./data.sqlite', buffer);
  }

  // 在每次写操作后调用 saveDB()
  async register({ email, password }) {
    if (!email || !password) return { success: false, msg: '缺少参数' };

    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    stmt.bind([email]);
    const exists = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();

    if (exists) return { success: false, msg: '用户已存在' };

    const username = email.split('@')[0];
    this.db.run(
      'INSERT INTO users (email, password, username) VALUES (?, ?, ?)',
      [email, password, username]
    );
    this.saveDB();

    return {
      success: true,
      msg: '注册成功',
      data: {
        username,
        balance: 100.0
      }
    };
  }

  async getUser({ uid }) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    stmt.bind([uid]);
    const user = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    return user;
  }

  async login({ email, password }) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ? AND password = ?');
    stmt.bind([email, password]);
    const user = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();

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

  async getBalance({ email }) {
    const stmt = this.db.prepare('SELECT balance FROM users WHERE email = ?');
    stmt.bind([email]);
    const row = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();

    if (!row) return { success: false, msg: '用户不存在' };
    return { success: true, balance: row.balance };
  }

  async signIn({ email }) {
    const now = new Date().toDateString();
    const stmt = this.db.prepare('SELECT lastSignIn FROM users WHERE email = ?');
    stmt.bind([email]);
    const user = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();

    if (!user) return { success: false, msg: '用户不存在' };
    if (user.lastSignIn === now) return { success: false, msg: '今日已签到' };

    this.db.run(
      'UPDATE users SET balance = balance + 10, lastSignIn = ? WHERE email = ?',
      [now, email]
    );
    this.saveDB();
    return { success: true, msg: '签到成功，奖励10元' };
  }

  async recharge({ email, amount }) {
    if (!email || typeof amount !== 'number' || amount <= 0) {
      return { success: false, msg: '充值参数无效' };
    }

    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    stmt.bind([email]);
    const user = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();

    if (!user) return { success: false, msg: '用户不存在' };

    this.db.run(
      'UPDATE users SET balance = balance + ? WHERE email = ?',
      [amount, email]
    );
    this.saveDB();
    return { success: true, msg: `充值成功，+${amount} 元` };
  }

  async getAllUsers() {
    const stmt = this.db.prepare('SELECT * FROM users');
    const users = [];
    while (stmt.step()) {
      users.push(stmt.getAsObject());
    }
    stmt.free();
    return users;
  }

   
  // 获取盲盒列表（包含奖品）
  async getAllBoxes() {
    const stmt = this.db.prepare('SELECT * FROM boxes');
    const boxes = [];
    while (stmt.step()) {
      boxes.push(stmt.getAsObject());
    }
    stmt.free();
    // 为每个盲盒获取奖品
    for (const box of boxes) {
      const prizeStmt = this.db.prepare('SELECT * FROM prizes WHERE boxId = ?');
      prizeStmt.bind([box.id]);
      const prizes = [];
      while (prizeStmt.step()) {
        prizes.push(prizeStmt.getAsObject());
      }
      prizeStmt.free();
      box.prizes = prizes;
    }    
    return boxes;
  }

  // 获取盲盒详情（含奖品）
  async getBoxDetail({ id }) {
    const boxStmt = this.db.prepare('SELECT * FROM boxes WHERE id = ?');
    boxStmt.bind([id]);
    const box = boxStmt.step() ? boxStmt.getAsObject() : null;
    boxStmt.free();
    if (!box) return null;

    const prizeStmt = this.db.prepare('SELECT * FROM prizes WHERE boxId = ?');
    prizeStmt.bind([id]);
    const prizes = [];
    while (prizeStmt.step()) {
      prizes.push(prizeStmt.getAsObject());
    }
    prizeStmt.free();
    return { ...box, prizes };
  }

  // 添加盲盒（用于初始化）
  async addBox({ name, price }) {
    this.db.run('INSERT INTO boxes (name, price) VALUES (?, ?)', [name, price]);
    this.saveDB();
    return { success: true };
  }

  // 添加奖品（用于初始化）
  async addPrize({ boxId, name, weight }) {
    this.db.run('INSERT INTO prizes (boxId, name, weight) VALUES (?, ?, ?)', [boxId, name, weight]);
    this.saveDB();
    return { success: true };
  }

    // 抽奖功能
  async drawBox({ email, boxId }) {
    // 查询用户余额
    const userStmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    userStmt.bind([email]);
    const user = userStmt.step() ? userStmt.getAsObject() : null;
    userStmt.free();
    if (!user) return { success: false, msg: '用户不存在' };

    // 查询盲盒
    const boxStmt = this.db.prepare('SELECT * FROM boxes WHERE id = ?');
    boxStmt.bind([boxId]);
    const box = boxStmt.step() ? boxStmt.getAsObject() : null;
    boxStmt.free();
    if (!box) return { success: false, msg: '盲盒不存在' };

    if (user.balance < box.price) {
      return { success: false, msg: '余额不足' };
    }

    // 查询奖品
    const prizeStmt = this.db.prepare('SELECT * FROM prizes WHERE boxId = ?');
    prizeStmt.bind([boxId]);
    const prizes = [];
    while (prizeStmt.step()) {
      prizes.push(prizeStmt.getAsObject());
    }
    prizeStmt.free();

    if (prizes.length === 0) {
      return { success: false, msg: '该盲盒没有奖品' };
    }

    // 权重抽奖逻辑
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

    // 扣除余额 + 保存订单
    this.db.run('UPDATE users SET balance = balance - ? WHERE email = ?', [box.price, email]);
    this.db.run(
      'INSERT INTO orders (email, boxId, prize, time) VALUES (?, ?, ?, ?)',
      [email, boxId, selectedPrize.name, new Date().toISOString()]
    );
    this.saveDB();

    return {
      success: true,
      msg: '抽奖成功',
      data: {
        prize: selectedPrize.name,
        balance: user.balance - box.price
      }
    };
  }

  // 获取用户订单
  async getOrders({ email }) {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE email = ? ORDER BY time DESC');
    stmt.bind([email]);
    const orders = [];
    while (stmt.step()) {
      orders.push(stmt.getAsObject());
    }
    stmt.free();
    return { success: true, orders };
  }

  // 删除订单
  async deleteOrder({ id, email }) {
    this.db.run('DELETE FROM orders WHERE id = ? AND email = ?', [id, email]);
    this.saveDB();
    return { success: true, msg: '订单已删除' };
  }
}
