# NJU-Web开发大作业__nju-tepes-web-blind-box

## 选题：盲盒抽奖机	艾睿-221900317

## 项目概述
盲盒抽奖机是一个集用户管理、盲盒购买、抽奖体验和社交分享于一体的电子商务系统。该项目采用前后端分离架构，结合了现代Web开发的最佳实践，为用户提供流畅的盲盒购物体验和社区互动功能。

## 软件功能实现

**1.多用户注册、登录**

**2.盲盒管理** 

**3.盲盒抽取** 

**4.盲盒订单管理** 

**5.盲盒列表查看** 

**6.盲盒详情查看** 

**7.玩家秀** 

**8.盲盒搜索**

**9.签到以及账户充值**

**10.聊天分享室与盲盒空间**

## 技术栈
### 前端
- react+tailwind+css

### 后端
- Node.js + TypeScript
- Midway.js框架
- Better-SQLite3数据库

## 代码库地址
github：[TepesAi/nju-tepes-web-blind-box: 一次web开发的大作业](https://github.com/TepesAi/nju-tepes-web-blind-box)

## 打包平台说明
1.windows 11

2.node v22.17.0

3.依赖库详见原始代码package.json

## 额外实现的功能
1. **签到奖励系统**
   - 每日签到获得10元奖励
   - 防止重复签到机制
2. **社区互动功能**
   - 晒单分享与点赞
   - 评论互动系统
   - 用户内容管理

## 部署指南

### 环境要求
- Node.js 16.x 或更高版本
- npm 20.x 或更高版本

### 部署步骤
```bash
# 克隆仓库
git clone https://github.com/TepesAi/nju-tepes-web-blind-box.git

# 进入目录
cd  ./build

# 安装依赖
npm install

# 启动服务
node index.js
```

## 学习中印象最深刻的内容
在开发本项目的过程中，以下技术点给我留下了深刻印象：
1. **Midway.js的依赖注入机制** - 极大地简化了服务的组织和管理
2. **Better-SQLite3的性能优势** - 相比纯JS实现的SQL.js，性能提升显著，而且bug更少！！！
3. **StaticFile以及ncc后端部署的巧妙**-可以与前端共同作用形成一个单独部署的文件单例很便捷

## 课程改进建议
1. **增加实际部署环节的交流** 
2. **增加一些教学时长**
3. **引入更多数据库对比** 

## 项目结构（省略node modules）
```
├─build
│  ├─build
│  │  └─Release
│  ├─data
│  └─public
│      └─assets
└─origin_code
    ├─blind-box-machine
    │  ├─dist
    │  │  └─assets
    │  ├─public
    │  └─src
    │      ├─assets
    │      ├─components
    │      ├─contexts
    │      └─pages
    └─mybackend
        ├─dist
        │  ├─config
        │  ├─controller
        │  ├─filter
        │  ├─middleware
        │  └─service
        ├─logs
        │  └─my-midway-project
        │      └─.audit
        ├─public
        │  └─assets
        ├─src
        │  ├─config
        │  ├─controller
        │  ├─filter
        │  ├─middleware
        │  └─service
        └─test
```

## 特别鸣谢
感谢以下同僚的帮助：

1.指导老师：章许帆

2.同学建议：马铭浩，于洋

---
**南京大学 · 智能化软件工程与开发学院** 
