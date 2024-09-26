const express = require('express');
const { Pool } = require('pg');
const path = require('path'); // 引入 path 模块，用于处理文件路径

const app = express();
const port = 5600;



// 配置 PostgreSQL 连接
const pool = new Pool({
  user: 'postgres',       // PostgreSQL 用户名
  host: 'localhost',      // 数据库服务器地址
  database: 'YiLianTi',  // 数据库名称
  password: '123456',   // 数据库密码
  port: 5432,             // PostgreSQL 默认端口
});

// 设置静态文件夹，Express 会自动提供这个文件夹中的静态文件
app.use(express.static(path.join(__dirname, 'website')));

// 添加 CORS 头部
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});





app.get('/ZhongNanHospitals', async (req, res) => {
  const selectedHospitals = req.query.selectedHospitals;
  //console.log(selectedHospitals);
  const hospitals = selectedHospitals.split(','); // 将长字符串拆分成字符串数组
  const results = [];

  try {
    for (const hospital2 of hospitals) {
      var hospital = [];
      switch (hospital2) {
        case 'wuhan_people':
          hospital = '武汉大学人民医院';
          break;
        case 'wuhan_zn':
          hospital = '武汉大学中南医院';
          break;
        case 'wuhan_dental':
          hospital = '武汉大学口腔医院';
          break;
        case 'tongji':
          hospital = '华中科技大学同济医学院附属同济医院';
          break;
        case 'xiehe':
          hospital = '华中科技大学同济医学院附属协和医院';
          break;
        case 'hubei_tcm':
          hospital = '湖北省中医院';
          break;
        default:
          hospital = '武汉大学人民医院';
          // return Promise.reject('Unknown hospital: ' + hospital);
      }


      var query = 'SELECT 医院名称, 文章数量, 合作, 沟通, 技术 FROM ' +hospital+'交互强度表';
      if (hospital == "华中科技大学同济医学院附属协和医院") {
        query = `SELECT 医院名称, 文章数量, 合作, 沟通, 技术 FROM 华中科技大学同济医学院附属协和医院交互强`;
      }
      else if (hospital == "华中科技大学同济医学院附属同济医院") {
        query = `SELECT 医院名称, 文章数量, 合作, 沟通, 技术 FROM 华中科技大学同济医学院附属同济医院交互强`;
      }

      console.log(query);
      const result = await pool.query(query);
      result.rows.forEach(row => {
        row.hospital = hospital;
        results.push(row);
      });
    }

    res.json(results);
  } catch (err) {
    console.error('数据库查询错误:', err);
    res.status(500).send('服务器错误');
  }
});


app.get('/HospitalsLocation', async (req, res) => {
  try {
    const result = await pool.query('SELECT 医院名称, 经度, 纬度, 医院等级, 所在省, 所在市, 所在区县 FROM 医联体医院坐标表');
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
