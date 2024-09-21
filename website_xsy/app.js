const express = require('express');
const { Client } = require('pg');    //引入express和pg框架
const connectionString = 'postgres://postgres:Xxsht123@localhost:5858/ylt'
const client = new Client({
    connectionString: connectionString
});

client.connect();

var app = express();

app.set('port', process.env.PORT || 5500);
const cors = require('cors');
const fs = require('fs');

let mySwitch = true; // 默认值为false

app.use(cors());

app.get('/get_hospital_count', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    // 获取被框选的医院
    var hospitals = req.query.hospitals;
    if (!hospitals) {
        return res.status(400).send('No hospitals selected');
    }

    // 将医院值分割成数组
    var hospitalList = hospitals.split(',');

    // 动态查询每家医院对应的交互强度表
    let queries = hospitalList.map(hospital => {
        // 生成医院对应的强度表表名
        let tableName;
        switch(hospital) {
            case 'wuhan_people':
                tableName = '武汉大学人民医院交互强度表';
                break;
            case 'wuhan_zn':
                tableName = '武汉大学中南医院交互强度表';
                break;
            case 'wuhan_dental':
                tableName = '武汉大学口腔医院交互强度表';
                break;
            case 'tongji':
                tableName = '华中科技大学同济医学院附属同济医院交互强';
                break;
            case 'xiehe':
                tableName = '华中科技大学同济医学院附属协和医院交互强';
                break;
            case 'hubei_tcm':
                tableName = '湖北省中医院交互强度表';
                break;
            default:
                return Promise.reject('Unknown hospital: ' + hospital);
        }

        // 查询该医院的交互强度表
        return client.query(`SELECT * FROM ${tableName};`);
    });

    // 执行所有查询
    Promise.all(queries)
        .then(results => {
            // 将查询结果合并并返回
            let mergedResults = results.reduce((acc, result) => acc.concat(result.rows), []);
            res.status(200).json(mergedResults);
        })
        .catch(err => {
            console.error(err);
            res.status(400).send('Error fetching data: ' + err);
        });
});




app.get('/total_hospital_number', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Get selected hospitals (医联体)
    var hospitals = req.query.hospitals;
    if (!hospitals) {
        return res.status(400).send('No hospitals selected');
    }

    // Split the selected hospitals into an array
    var selectedHospitals = hospitals.split(',');

    // Hospital identifier to actual hospital name mapping
    function getHospitalName(hospital) {
        switch (hospital) {
            case 'wuhan_people':
                {
                return '武汉大学人民医院';
                }
            case 'wuhan_zn':
                return '武汉大学中南医院';
            case 'wuhan_dental':
                return '武汉大学口腔医院';
            case 'tongji':
                return '华中科技大学同济医学院附属同济医院';
            case 'xiehe':
                return '华中科技大学同济医学院附属协和医院';
            case 'hubei_tcm':
                return '湖北省中医院';
            default:
                return null;
        }
    }

    // Create a list of hospital names corresponding to the selected hospitals
    var hospitalNames = selectedHospitals.map(getHospitalName);

    // Filter out any unknown hospital identifiers
    hospitalNames = hospitalNames.filter(name => name !== null);


    // Log the hospitalNames to check its value
    console.log('Selected Hospital Names:', hospitalNames);

    if (hospitalNames.length === 0) {
        return res.status(400).send('Invalid hospitals selected');
    }

    // Construct query to find all rows where "医院名称" is part of the selected hospital names
    // Construct query to find all rows where "医院名称" is part of the selected hospital names
    const query = `
    SELECT "所在市", COUNT(*) as count 
    FROM "医联体医院坐标表"
    WHERE "所属医联体" = ANY($1::text[])
    AND "所在市" NOT IN ('湖北省', '海南省')
    GROUP BY "所在市";
`;

    // Query the database with the selected hospital names
    client.query(query, [hospitalNames])
        .then(result => {

            // console.log('Database Query Result:', result);
            // Extract city count data from result
            const cityData = result.rows.map(row => ({
                name: row['所在市'],  // Use 'name' as key
                value: parseInt(row.count, 10)  // Use 'value' as key
            }));


            // // Log the extracted city data
            // console.log('Extracted City Data:', cityData);           
            // Return the city data
            res.status(200).json(cityData);
        })
        .catch(err => {
            console.error('Error fetching data:', err);
            res.status(500).send('Error fetching data');
        });
});














// 查询语句  翻页查询






app.get('/search_mounts', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    var type=req.query.type;
    client.query('SELECT * FROM 全部山 where 所属山系  = $1;', [type], function (err, result) {      
        if (err) {
            console.log(err);
            return res.status(400).send(err);
        }
        // res.status(200).send(result.rows); 
        // 将查询结果存储在变量中
        const mountData = result.rows;
        //console.log("yes");
        // 以 JSON 格式返回数据给前端
        res.status(200).json(mountData);
    });
});

app.get('/search_mountinfo', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    var type=req.query.type;
    client.query('SELECT * FROM 全部山 where id  = $1;', [type], function (err, result) {      
        if (err) {
            console.log(err);
            return res.status(400).send(err);
        }
        // res.status(200).send(result.rows); 
        // 将查询结果存储在变量中
        const mountData = result.rows;
        console.log("yes");
        // 以 JSON 格式返回数据给前端
        res.status(200).json(mountData);
    });
});

app.get('/search_YS', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    var type=req.query.type;
    client.query('SELECT * FROM 全部兽 where mountid  = $1;', [type], function (err, result) {      
        if (err) {
            console.log(err);
            return res.status(400).send(err);
        }
        // res.status(200).send(result.rows); 
        // 将查询结果存储在变量中
        const mountData = result.rows;
        
        // 以 JSON 格式返回数据给前端
        res.status(200).json(mountData);
    });
});

app.get('/search_animal', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    var type=req.query.type;
    console.log(type);
    client.query('SELECT * FROM 全部兽 where id  = $1;', [type], function (err, result) {      
        if (err) {
            console.log(err);
            return res.status(400).send(err);
        }
        // res.status(200).send(result.rows); 
        // 将查询结果存储在变量中
        const mountData = result.rows;
        
        // 以 JSON 格式返回数据给前端
        res.status(200).json(mountData);
    });
});

//查询某个顺序的山
app.get('/search_mount', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var order = req.query.shunxu; 
    var mountainRange = req.query.shanxi; // 所属山系为东山一经
    client.query('SELECT * FROM "全部山" WHERE "顺序" = $1 AND "所属山系" = $2;', [order, mountainRange], function (err, result) {      
        if (err) {
            console.log(err);
            return res.status(400).send(err);
        }
        // 将查询结果存储在变量中
        const mountData = result.rows;
        console.log("yes");
        // 以 JSON 格式返回数据给前端
        res.status(200).json(mountData);
    });
});

app.get('/get_mountains', function (req, res,next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    var name=req.query.name;
    console.log(name)

    client.query('SELECT * FROM 全部山 where 名字 = $1;', [name],function (err, result) {      
        if (err) {
            console.log(err);
            return res.status(400).send(err);
        }
        // res.status(200).send(result.rows); 
        // 将查询结果存储在变量中
        const item_Data = result.rows;
        // 以 JSON 格式返回数据给前端
        res.status(200).json(item_Data);
    });
});

//查询语句 单个商品信息查询
app.get('/search_id', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    var object_id=req.query.object_id;
    
    client.query('SELECT * FROM xiupin1 where objectid  = $1;', [object_id],function (err, result) {      
        if (err) {
            console.log(err);
            return res.status(400).send(err);
        }
        // res.status(200).send(result.rows); 
        // 将查询结果存储在变量中
        const item_Data = result.rows;
        console.log("yes1");
        // 以 JSON 格式返回数据给前端
        res.status(200).json(item_Data);
    });
});

//查询语句，查询任意3个同类商品
app.get('/find_the_same', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    var type=req.query.type;
    
    client.query('SELECT * FROM xiupin1 where 类别  = $1 ORDER BY RANDOM() LIMIT 3;', [type],function (err, result) {      
        if (err) {
            console.log(err);
            return res.status(400).send(err);
        }
        // res.status(200).send(result.rows); 
        // 将查询结果存储在变量中
        const item_Data = result.rows;
        // 以 JSON 格式返回数据给前端
        res.status(200).json(item_Data);
    });
});
//查询语句，查询8个课程
app.get('/classes', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    var start=req.query.start;
    var num=req.query.num;
    client.query('SELECT * FROM classes OFFSET $1 LIMIT $2;', [start,num],function (err, result) {      
        if (err) {
            console.log(err);
            return res.status(400).send(err);
        }
        // res.status(200).send(result.rows); 
        // 将查询结果存储在变量中
        const item_Data = result.rows;
        // 以 JSON 格式返回数据给前端
        res.status(200).json(item_Data);
        console.log("已请求");
        
    });
});


//查询语句，查询1个课程
app.get('/get_class', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    var class_id=req.query.class_id;
    
    client.query('SELECT * FROM classes where 课程id = $1;', [class_id],function (err, result) {      
        if (err) {
            console.log(err);
            return res.status(400).send(err);
        }
        // res.status(200).send(result.rows); 
        // 将查询结果存储在变量中
        const item_Data = result.rows;
        // 以 JSON 格式返回数据给前端
        res.status(200).json(item_Data);
    });
});

//查询语句，查询3个同类课程
app.get('/get_same_classes', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    
    
    client.query('SELECT * FROM classes ORDER BY RANDOM() LIMIT 3;', function (err, result) {      
        if (err) {
            console.log(err);
            return res.status(400).send(err);
        }
        // res.status(200).send(result.rows); 
        // 将查询结果存储在变量中
        const item_Data = result.rows;
        // 以 JSON 格式返回数据给前端
        res.status(200).json(item_Data);
    });
});





//增加语句
app.get('/list3', function(req, res) {
	const id3 = req.query.id3;
    const name3 = req.query.name3;
    const code3 = req.query.code3;
    const depart3 = req.query.depart3;
    const city3 = req.query.city3;
    const level3 = req.query.level3;
    const type3 = req.query.type3;
    const less3 = req.query.less3;
    const remark  = "111";
          const query = 'INSERT INTO edu_school_edu_school (id, school_name, school_code, admin_depart, localtion, school_level, edu_type, type, remark) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';
          const values = [id3, name3, code3, depart3, city3, level3, type3, less3, remark];
      
          client.query(query, values, function(error, results)  {
      
            if (error) {
              return console.error('Error executing query', error.stack);
            }
      
            res.send(results.rows);
            // Your callback logic here
          });
});







app.listen(5500, function () {
    console.log('Server is running.. on Port 5500');
});




	app.get('/checkConnection', (req, res) => {
    // 在这个示例中，将 mySwitch 的值作为 JSON 对象发送回前端
    res.json({ mySwitch: mySwitch });
  });

  //增加到数据库的路由
app.get('/addtodb', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin','*');
    const id=req.query.id;
    const author = req.query.author;
    const name = req.query.name;
    const picture = req.query.picture;
    const topic = req.query.topic;
    const description = req.query.description;
    const meaning=req.query.meaning;
    const longtitude=req.query.longtitude;
    const latitude=req.query.latitude;
    const adcode=req.query.adcode;
    const ename=req.query.ename;
    const price=req.query.price;
    const ups=req.query.ups;
    const soldnum=req.query.soldnum;
    const query = `
    INSERT INTO erchuangzuopin (
        id,发布者id, 作品名称, 作品图片的存储路径, 主题, 作品简单描述,寓意,经度, 纬度,地理编码,地区,价格,点赞数,销量
    ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14 )RETURNING MAINID`;
     const values = [id,author, name, picture, topic,description,meaning,longtitude,latitude, adcode,ename,price,ups,soldnum];
          client.query(query, values, function(error, results)  {
      
            if (error) {
              return console.error('Error executing query', error.stack);
            }
      
            res.send(results.rows);
            // Your callback logic here
          });
});


const bodyParser = require('body-parser');

// 使用 body-parser 中间件来解析请求体数据
app.use(bodyParser.json());

// POST 请求实现写入json文件的路由
app.post('/saveData', (req, res) => {
    const newData = req.body;

    // 读取已有数据文件
    fs.readFile('D:\\大三下资料\\GIS\\shanhaijing\\Fantastic-Creatures-of-the-Mountains-and-Seas\\xsy\\erchuangzuopin.json', 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ success: false, message: 'Failed to read existing data' });
        }

        let dataArray = [];
        // 解析已有数据文件中的 JSON 数据
        try {
            dataArray = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            return res.status(500).json({ success: false, message: 'Failed to parse existing data' });
        }

        // 计算新数据的ID为已有数据中最大ID值加1
        const maxId = Math.max(...dataArray.map(item => item.idmain));
        const newId = maxId + 1;

        // 构造要写入 JSON 文件的数据对象
        const jsonData = {
            idmain: newId,
            id: newData.id,
            发布者ID: newData.author, // 请根据实际情况替换为真实的发布者ID
            作品名称: newData.name,
            作品图片的存储路径: newData.picture,
            主题: newData.category,
            作品简单描述: newData.description,
            寓意: newData.meaning,
            经度: newData.longtitude,
            纬度: newData.latitude,
            地理编码: newData.adcode,
            地区: newData.ename,
            价格: newData.price,
            点赞数: newData.ups,
            销量: newData.soldnum
        };

        // 将新数据追加到数组中
        dataArray.push(jsonData);

        // 将更新后的数据写回文件
        fs.writeFile('D:\\大三下资料\\GIS\\shanhaijing\\Fantastic-Creatures-of-the-Mountains-and-Seas\\xsy\\erchuangzuopin.json', JSON.stringify(dataArray, null, 2), 'utf-8', (writeErr) => {
            if (writeErr) {
                console.error('Error writing file:', writeErr);
                return res.status(500).json({ success: false, message: 'Failed to write updated data' });
            }
            
            // 如果一切顺利，返回成功响应
            res.json({ success: true, message: 'Data saved successfully' });
        });
    });
});


// POST 请求实现写入json文件的路由
app.post('/savetiezi', (req, res) => {
    const newData = req.body;

    // 读取已有数据文件
    fs.readFile('D:\\大三下资料\\GIS\\shanhaijing\\Fantastic-Creatures-of-the-Mountains-and-Seas\\xsy\\huati.json', 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ success: false, message: 'Failed to read existing data' });
        }

        let dataArray = [];
        // 解析已有数据文件中的 JSON 数据
        try {
            dataArray = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            return res.status(500).json({ success: false, message: 'Failed to parse existing data' });
        }

        // 计算新数据的ID为已有数据中最大ID值加1
        const maxId = Math.max(...dataArray.map(item => item.id));
        const newId = maxId + 1;

        // 构造要写入 JSON 文件的数据对象
        const jsonData = {
            id: newId,
            author: newData.author,
            image: newData.image, // 请根据实际情况替换为真实的发布者ID
            summary: newData.summary,
            topic_overview: newData.topic_overview,
            description: newData.description,
            likes: newData.likes,
            publish_time: newData.publish_time,
            answers: newData.answers,
            views: newData.views
        };

        // 将新数据追加到数组中
        dataArray.push(jsonData);

        // 将更新后的数据写回文件
        fs.writeFile('D:\\大三下资料\\GIS\\shanhaijing\\Fantastic-Creatures-of-the-Mountains-and-Seas\\xsy\\huati.json', JSON.stringify(dataArray, null, 2), 'utf-8', (writeErr) => {
            if (writeErr) {
                console.error('Error writing file:', writeErr);
                return res.status(500).json({ success: false, message: 'Failed to write updated data' });
            }
            
            // 如果一切顺利，返回成功响应
            res.json({ success: true, message: 'Data saved successfully' });
        });
    });
});
