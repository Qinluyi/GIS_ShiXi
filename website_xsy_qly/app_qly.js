const express = require('express');
const { Client } = require('pg');
const connectionString = 'postgres://postgres:123456@localhost:5432/YiLianTi';
const client = new Client({
    connectionString: connectionString
});
client.connect();
const path = require('path'); // 引入 path 模块，用于处理文件路径
var app = express();

port = 5601
app.set('port', process.env.PORT || port);



//查询语句  翻页查询
app.get('/search_yilianti', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    var name=req.query.name;
    client.query('SELECT * FROM 医联体医院坐标表 where 所属医联体 = $1;', [name], function (err, result) {      
        if (err) {
            console.log(err);
            return res.status(400).send(err);
        }
        // res.status(200).send(result.rows); 
        // 将查询结果存储在变量中
        const Data = result.rows;
        // 以 JSON 格式返回数据给前端
        res.status(200).json(Data);
    });
});

app.get('/search_hospitals', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var names = req.query.names; // 假设传入的是一个数组

    if (!Array.isArray(names) || names.length === 0) {
        return res.status(400).send('Invalid names parameter');
    }

    const promises = names.map(name => {
        return new Promise((resolve, reject) => {
            client.query('SELECT * FROM 医联体医院坐标表 WHERE 所属医联体 = \$1;', [name], function (err, result) {
                if (err) {
                    return reject(err);
                }
                resolve({ [name]: result.rows });
            });
        });
    });

    Promise.all(promises)
        .then(results => {
            const resultDict = Object.assign({}, ...results);
            res.status(200).json(resultDict);
        })
        .catch(err => {
            console.log(err);
            res.status(400).send(err);
        });
});

//查询医联体信息
app.get('/search_yiyuan_info', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    client.query('SELECT * FROM 医联体医院坐标表 ORDER BY RANDOM() LIMIT 20;', function (err, result) {      
        if (err) {
            console.log(err);
            return res.status(400).send(err);
        }
        // 将查询结果存储在变量中
        const Data = result.rows;
        // 以 JSON 格式返回数据给前端
        res.status(200).json(Data);
    });
});

//查询阻尼系数排行
app.get('/search_zuni_info', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    client.query(`SELECT * FROM 医联体阻尼系数;`, function (err, result) {      
        if (err) {
            console.log(err);
            return res.status(400).send(err);
        }
        // 将查询结果存储在变量中
        const Data = result.rows;
        // 以 JSON 格式返回数据给前端
        res.status(200).json(Data);
    });
});

//查询辐射范围排行
app.get('/search_fushe_info', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    client.query(`SELECT * FROM 医联体辐射范围排行榜v2;`, function (err, result) {      
        if (err) {
            console.log(err);
            return res.status(400).send(err);
        }
        // 将查询结果存储在变量中
        const Data = result.rows;
        // 以 JSON 格式返回数据给前端
        res.status(200).json(Data);
    });
});

//查询辐射范围排行
app.get('/search_zuni_reli', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const query1 = client.query(`SELECT * FROM 所有医联体医院阻尼系数;`);
    // const names = req.query.names; // 假设传入的是一个数组
    // 获取names，确保是数组
    const names = Array.isArray(req.query.names) ? req.query.names : []; // 如果不是数组，使用空数组

    // 打印names的值
    console.log('Names:', names);
    // 对每个name执行查询
    const nameQueries = names.map(name => {
        return client.query('SELECT * FROM 医联体医院坐标表 WHERE 所属医联体 = \$1;', [name])
            .then(result => result.rows)
            .catch(err => {
                console.error(`Error querying for name ${name}:`, err);
                return []; // 返回空数组以防止Promise.all失败
            });
    });

    // 等待query1和所有名称查询完成
    Promise.all([query1, ...nameQueries])
        .then(results => {
            const data = [results[0].rows]; // query1的结果
            // 将所有名称查询的结果合并到data中
            data.push(...results.slice(1)); // 添加名称查询的结果
            res.status(200).json(data);
        })
        .catch(err => {
            console.log(err);
            res.status(400).send(err);
        });
});

// 处理搜索时间信息的请求
app.get('/search_time_info', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const names = [
        "武汉大学人民医院交互明细",
        "武汉大学中南医院交互明细",
        "武汉大学口腔医院交互明细",
        "华中科技大学同济医学院附属同济医院交互明",
        "华中科技大学同济医学院附属协和医院交互明",
        "湖北省中医院交互明细"
    ];
    const years = Array.from({ length: 12 }, (_, i) => (2012 + i).toString()); // 生成 2012 到 2023 的年份
    const results = {};

    try {
        for (const name of names) {
            results[name] = [];
            for (const year of years) {
                const query = `
                    SELECT COUNT(*) AS count
                    FROM "${name}"
                    WHERE "时间" LIKE \$1`;
                
                const resQuery = await client.query(query, [`${year}-%`]);
                results[name].push({ year, count: parseInt(resQuery.rows[0].count, 10) });
            }
        }
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// 提供静态文件
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // 更新路径
  }); //当前执行的 JavaScript 文件所在的目录的绝对路径

app.listen(port, function () {
    console.log("Connetct successfully...")
    console.log('Server is running.. on Port ' + port +` 服务器正在运行在 http://localhost:${port}`);
});