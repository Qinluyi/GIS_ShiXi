
// 定义字典
const levelValues = {
    '一级甲等': 45,
    '一级乙等': 60,
    '二级甲等': 90,
    '二级乙等': 120,
    '三级甲等': 150,
    '三级乙等': 180
};

// 存储经纬度和医院等级的数据
var mygeoCoordMap = {};
var map_data = [];

option = {
    backgroundColor: '#080a20',
    title: {
        left: 'left',
        textStyle: {
            color: '#fff'
        }
    },
    tooltip: {
        trigger: 'item'
    },
    legend: {
        orient: 'vertical',
        top: 'bottom',
        left: 'right',
        data: ['北京 Top10', '上海 Top10', '广州 Top10'],
        textStyle: {
            color: '#fff'
        },
        selectedMode: 'single'
    },
    geo: {
        map: 'china',
        zoom: 1.2,
        label: {
            emphasis: {
                show: false
            }
        },
        roam: true,
        itemStyle: {
            normal: {
                areaColor: '#142957',
                borderColor: '#0692a4'
            },
            emphasis: {
                areaColor: '#0b1c2d'
            }
        }
    }
};

var myecharts = echarts.init($('.map .geo')[0])

myecharts.setOption(option)



var convertData = function (data) {
    var res = [];
    for (var i = 0; i < data.length; i++) {
        var geoCoord = mygeoCoordMap[data[i].name];
        if (geoCoord) {
            res.push({
                name: data[i].name,
                value: geoCoord.concat(data[i].value)
            });
        }
    }
    return res;
 };

function put_scatter(data){
    // console.log(data[0].经度);
    // 遍历 data
    data.forEach(item => {
        const { 医院名称, 经度, 纬度, 医院等级 } = item;

        mygeoCoordMap[医院名称] = [经度, 纬度]; // 存储经纬度
        // 使用医院等级作为键查找字典值
        const levelValue = levelValues[医院等级] || 30; // 如果等级不存在则默认为 0
        map_data.push({ name: 医院名称, value: levelValue }); // 存储医院名称和对应的值
    });
    // 更新option
    option['series'] = 
    [
        {
            name: 'pm2.5',
            type: 'scatter',
            coordinateSystem: 'geo',
            data: convertData(map_data),
            symbolSize: function (val) {
                return val[2] / 10;
            },
            encode: {
                value: 2
            },
            label: {
                formatter: '{b}',
                position: 'right',
                show: false
            },
            itemStyle: {
                color: 'purple'
            },
            emphasis: {
                label: {
                    show: true
                }
            }
        },
        {
            name: 'Top 5',
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: convertData(data.sort(function (a, b) {
                return b.value - a.value;
            }).slice(0, 6)),
            symbolSize: function (val) {
                return val[2] / 10;
            },
            encode: {
                value: 2
            },
            showEffectOn: 'render',
            rippleEffect: {
                brushType: 'stroke'
            },
            hoverAnimation: true,
            label: {
                formatter: '{b}',
                position: 'right',
                show: true
            },
            itemStyle: {
                color: 'purple',
                shadowBlur: 10,
                shadowColor: '#333'
            },
            zlevel: 1
        }
    ];

    myecharts.setOption(option)
}

function Load_yilianti(name){
    $.ajax({
        url: 'http://localhost:5500/search_yilianti',
        type: 'get',
        dataType: 'json',
        data: {//传进去的值
            name:name,
        }, // Pass the parameter here
        success: function (data) {//返回结果在data里 数据返回成功之后要干什么
            put_scatter(data)
        }
    }); 
}