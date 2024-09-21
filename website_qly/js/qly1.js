
port = 5500
// 定义字典
const levelValues = {
    '一级甲等': 45,
    '一级乙等': 60,
    '二级甲等': 90,
    '二级乙等': 120,
    '三级甲等': 150,
    '三级乙等': 180
};
// 定义一个对象来存储勾选状态
// 初始的 checkboxStates
let checkboxStates = {
    "wuhan_people": false,
    "wuhan_zn": false,
    "wuhan_dental": false,
    "tongji": false,
    "xiehe": false,
    "hubei_tcm": false
};

// 存储经纬度和医院等级的数据
var mygeoCoordMap = {};
var map_data = [];

init_option = {
    backgroundColor: '#080a20',
    title: {
        left: 'left',
        textStyle: {
            color: '#fff'
        }
    },
    tooltip: {
        trigger: 'item',
        formatter: function (params) {
            return params.name + ': <br>' + params.value[2]+'\n'+'nini'; // 显示名称和第4个值
        }
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

myecharts.setOption(init_option)



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
                formatter: function (params) {
                    return params.name + ': ' + params.value[2]; // 显示名称和第4个值
                },
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


function findDifferentKey(initialStates, updatedStates) {
    for (const key in updatedStates) {
        if (updatedStates.hasOwnProperty(key) && initialStates[key] !== updatedStates[key]) {
            return key; // 返回不同的键
        }
    }
    return null; // 如果没有不同的键，返回 null
}

function updateCheckboxStates() {
    const checkboxes = document.querySelectorAll('input[name="hospital"]');
    checkboxStates_ = {};
    checkboxes.forEach(checkbox => {
        checkboxStates_[checkbox.value] = checkbox.checked; // 更新对象中的状态
    });
    // console.log(checkboxStates); // 打印当前状态对象
    return checkboxStates_
}

function show_fanwei(){
    // 获取所有被选中的复选框
    
    search_names = [];
    checkboxStates_ = updateCheckboxStates();
    change_key = findDifferentKey(checkboxStates,checkboxStates_);
    checkboxStates = checkboxStates_;//更新checkbox的勾选状态
    // 获取有改动的医院的值


        if (change_key == "wuhan_people"){
            change_key = "武汉大学人民医院";
        }else if(change_key == "wuhan_zn"){
            change_key = "武汉大学中南医院";
        }else if (change_key == "wuhan_dental"){
            change_key = "武汉大学口腔医院";
        }else if(change_key == "tongji"){
            change_key = "华中科技大学同济医学院附属同济医院";
        }else if(change_key == "xiehe"){
            change_key = "华中科技大学同济医学院附属协和医院";
        }else if(change_key == "hubei_tcm"){
            change_key = "湖北省中医院";
        };
    
        $.ajax({
            url: `http://localhost:${port}/search_yilianti`,
            type: 'get',
            dataType: 'json',
            data: {
                name: change_key
            },
            success: function(data) {
                //put_scatter(data);
                //console.log("get data!!!");
                for (const key in data) {
                    // if (data.hasOwnProperty(key)) {
                    //     console.log(`医院: ${key}, 结果:`, data[key]);
                    // }
                    put_scatter(change_key,data);
                }
            }
        }); 
    
}
// 监听复选框的状态变化
var map_type = "fanwei";

document.querySelectorAll('input[name="hospital"]').forEach(function(checkbox) {
    checkbox.addEventListener('change', function() {
        if (map_type === 'type1') {
            console.log("updateSelectedHospitals();")// 根据map_type触发不同的函数
        } else if (map_type === 'fanwei') {
            //console.log('map_type');
            // updateCheckboxStates();
            show_fanwei();
        }
    });
});