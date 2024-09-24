const express = require('express');
const { Client } = require('pg');
const connectionString = 'postgres://postgres:123456@localhost:5432/YiLianTi';
//const connectionString = 'postgres://postgres:Xxsht123@localhost:5858/ylt'

const client = new Client({
    connectionString: connectionString
});

client.connect();

var app = express();

port = 5600
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

app.listen(port, function () {
    console.log("Connetct successfully...")
    console.log('Server is running.. on Port ' + port);
});




