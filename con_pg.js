const express = require('express');
const { Pool } = require('pg');
const path = require('path'); // 引入 path 模块，用于处理文件路径

const app = express();
const port = 3000;

// 配置 PostgreSQL 连接
const pool = new Pool({
  user: 'postgres',       // PostgreSQL 用户名
  host: 'localhost',      // 数据库服务器地址
  database: 'hospitals_c',  // 数据库名称
  password: '20030509',   // 数据库密码
  port: 5432,             // PostgreSQL 默认端口
});

// 设置静态文件夹，Express 会自动提供这个文件夹中的静态文件
app.use(express.static(path.join(__dirname, 'Website')));

// 创建 API 路由来获取医院信息
app.get('/hospitals_c', async (req, res) => {
  try {
    const result = await pool.query('SELECT 医院名称, 医院地址, 联系电话, 医院等级, 重点科室, 经营方式, 传真号码, 电子邮箱, 医院网站,经度, 纬度 FROM hospitals_c');
    res.json(result.rows);
  } catch (err) {
    console.error('数据库查询错误:', err);
    res.status(500).send('服务器错误');
  }
});

// 配置根路由，返回 index.html 页面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器正在运行在 http://localhost:${port}`);
});
