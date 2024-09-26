const express = require('express');
const { Pool } = require('pg');
const path = require('path'); // 引入 path 模块，用于处理文件路径

const app = express();
const port = 3000;

// 配置 PostgreSQL 连接
const pool = new Pool({
  user: 'postgres',       // PostgreSQL 用户名
  host: 'localhost',      // 数据库服务器地址
  database: 'hospitals_with_district',  // 数据库名称
  password: '123456',   // 数据库密码
  port: 5432,             // PostgreSQL 默认端口
});
const pool1 = new Pool({
  user: 'postgres',       // PostgreSQL 用户名
  host: 'localhost',      // 数据库服务器地址
  database: 'YiLianTi',  // 数据库名称
  password: '123456',   // 数据库密码
  port: 5432,             // PostgreSQL 默认端口
});
const { exec } = require('child_process');
const { spawn } = require('child_process');
// 设置静态文件夹，Express 会自动提供这个文件夹中的静态文件
app.use(express.static(path.join(__dirname, 'Website')));

// 创建 API 路由来获取医院信息
app.get('/hospitals_with_district', async (req, res) => {
  try {
    const result = await pool.query('SELECT 医院名称, 医院地址, 联系电话, 医院等级, 重点科室, 经营方式, 传真号码, 电子邮箱, 医院网站,经度, 纬度,区县 FROM hospitals_with_district');
    res.json(result.rows);
  } catch (err) {
    console.error('数据库查询错误:', err);
    res.status(500).send('服务器错误');
  }
});

app.get('/ylt', async (req, res) => {
  try {
    const result = await pool1.query('SELECT 医院名称, 医院地址, 联系电话, 医院等级, 重点科室, 经营方式, 传真号码, 电子邮箱, 医院网站,经度, 纬度 FROM 医院信息');
    res.json(result.rows);
  } catch (err) {
    console.error('数据库查询错误:', err);
    res.status(500).send('服务器错误');
  }
});


app.get('/api/data_detail/:hospitalName', async (req, res) => {
  const hospitalName = req.params.hospitalName; // 解码 URL 参数
  const tableMap = {
    'xieheyiyuan': '华中科技大学同济医学院附属协和医院交互明',
    'zhongnanyiyuan': '武汉大学中南医院交互明细',
    'tongjiyiyuan': '华中科技大学同济医学院附属同济医院交互明',
    'kouqiangyiyuan': '武汉大学口腔医院交互明细',
    'renminyiyuan': '武汉大学人民医院交互明细',
    'zhongyiyuan': '湖北省中医院交互明细',
  };

  const tableName = tableMap[hospitalName];
  if (!tableName) {
    return res.status(400).json({ error: '未知的医联体名称' });
  }
  try {
    const result = await pool1.query(`SELECT 医院名称, 交互类型, 时间, 链接 FROM ${tableName}`);
    res.json(result.rows);
  } catch (err) {
    console.error('数据库查询错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

app.get('/api/data_general/:hospitalName', async (req, res) => {
  const hospitalName = req.params.hospitalName;
  const tableMap = {
    'xieheyiyuan': '华中科技大学同济医学院附属协和医院交互强',
    'zhongnanyiyuan': '武汉大学中南医院交互强度表',
    'tongjiyiyuan': '华中科技大学同济医学院附属同济医院交互强',
    'kouqiangyiyuan': '武汉大学口腔医院交互强度表',
    'renminyiyuan': '武汉大学人民医院交互强度表',
    'zhongyiyuan': '湖北省中医院交互强度表',
  };
  const tableName = tableMap[hospitalName];
  if (!tableName) {
    return res.status(400).json({ error: '未知的医联体名称' });
  }
  try {
    const result = await pool1.query(`SELECT 医院名称, 文章数量, 合作, 沟通, 技术 FROM ${tableName}`);
    res.json(result.rows);
  } catch (err) {
    console.error('数据库查询错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 当接收到 /run-python 请求时，运行Python脚本
app.get('/run-python', (req, res) => {
  // 指定Python解释器的路径和Python脚本的路径
  const pythonExecutable = 'D:\\python\\python3.10.4\\python.exe'; // Python解释器路径
  const pythonScriptPath = 'run.py'; // Python脚本文件名

  //使用 child_process 来执行 Python 脚本，并指定工作目录为 D:\Spider
  exec(`${pythonExecutable} ${pythonScriptPath}`, { cwd: 'D:\\大四上\\综合实习\\teamwork1\\Data\\hct\\auto_renew_data', encoding: 'utf8' }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error.message}`);
      res.status(500).json({ error: error.message });
      return;
    }
    if (stderr) {
      console.error(`Python script stderr: ${stderr}`);
      res.status(500).json({ error: stderr });
      return;
    }
    console.log(`Python script output: ${stdout}`);
    res.json({ output: stdout }); // 返回Python脚本的输出
  });
});

app.get('/run-python1', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let progress = 0; // 初始进度为0%

  const progressInterval = setInterval(() => {
    if (progress < 90) {
      progress += 10; // 每次增长10%
      res.write(`data: ${JSON.stringify({ progress: progress + '%' })}\n\n`);
    } else {
      // 达到90%后停止增长
      clearInterval(progressInterval);
    }
  }, 1000);

  const pythonExecutable = 'D:\\python\\python3.10.4\\python.exe';
  const pythonScriptPath = 'run.py';

  const pythonProcess = spawn(pythonExecutable, [pythonScriptPath], { cwd: 'D:\\大四上\\综合实习\\teamwork1\\Data\\hct\\auto_renew_data' });

  pythonProcess.stdout.on('data', (data) => {
    // 发送标准输出到客户端
    res.write(`data: ${JSON.stringify({ message: data.toString() })}\n\n`);
  });

  pythonProcess.stderr.on('data', (data) => {
    // 发送错误输出到客户端
    res.write(`data: ${JSON.stringify({ message: data.toString() })}\n\n`);
  });

  pythonProcess.on('close', (code) => {
    // 当脚本执行完成时发送完成消息
    res.write(`data: ${JSON.stringify({ progress: '100%', message: 'Script finished with code ' + code })}\n\n`);
    res.end();
  });

  pythonProcess.on('error', (error) => {
    console.error(`Error launching Python script: ${error.message}`);
    res.status(500).send(`Error launching Python script: ${error.message}`);
  });
});

app.use(express.static(path.join(__dirname, 'Website')));
// 配置根路由，返回 index.html 页面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
//提供show_and_download.html
app.get('/download', (req, res) => {
  res.sendFile(path.join(__dirname, 'Website', 'show_and_download.html'))
})

// 启动服务器
app.listen(port, () => {
  console.log(`服务器正在运行在 http://localhost:${port}`);
});

