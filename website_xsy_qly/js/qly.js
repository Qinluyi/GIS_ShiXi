port = 5600
// 定义字典
const levelValues = {
    '一级甲等': 70,
    '一级乙等': 100,
    '二级甲等': 130,
    '二级乙等': 160,
    '三级甲等': 190,
    '三级乙等': 210
};

// 存储经纬度和医院等级的数据
var mygeoCoordMap = {};
var map_data = [];
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

let first_legend = true;

const colorDict = {
    "wuhan_people": '#e6b3ff', // 红色
    "wuhan_zn": '#99ffbb',     // 绿色
    "wuhan_dental": '#66b2ff', // 蓝色
    "tongji": '#c68c53',       // 粉色
    "xiehe": '#ffff80',        // 青色
    "hubei_tcm": '#ff4d94'     // 黄色
};

const nameDict = {
    "wuhan_people": "武汉大学人民医院医联体",
    "wuhan_zn": "武汉大学中南医院医联体",
    "wuhan_dental": "武汉大学口腔医院医联体",
    "tongji": "同济医院医联体",
    "xiehe": "协和医院医联体",
    "hubei_tcm": "湖北省中医院医联体"
}

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
            // params包含当前数据项的信息
            return params.name + "<br>结算等级" + ': ' + params.value[3]; // 显示名称和第4个值
        }
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

var convertData = function (data) {
    var res = [];
    for (var i = 0; i < data.length; i++) {
        var geoCoord = mygeoCoordMap[data[i].name][0];
        if (geoCoord) {
            res.push({
                name: data[i].name,
                value: geoCoord.concat(data[i].value,mygeoCoordMap[data[i].name][1])
            });
        }
    }
    return res;
 };

function get_sanjia(data){
    sanjia = [];
    data.forEach(item => {
        const { 医院名称,医院等级 } = item;
        const levelValue = levelValues[医院等级];
        if (医院等级 == "三级甲等"){
            sanjia.push({ name: 医院名称, value: levelValue });
        }
    });
    return sanjia;
}

function put_scatter(key,data){
    map_data = [];
    current_option = myecharts.getOption();
        
        data.forEach(item => {
            const { 医院名称, 经度, 纬度, 医院等级 } = item;

            mygeoCoordMap[医院名称] = [[经度, 纬度],医院等级]; // 存储经纬度
            // 使用医院等级作为键查找字典值
            const levelValue = levelValues[医院等级] || 50; // 如果等级不存在则默认为 0
            map_data.push({ name: 医院名称, value: levelValue }); // 存储医院名称和对应的值
        });
        // 更新option
        if (!current_option['series']) {
            current_option['series'] = []; // 如果 series 不存在，初始化为空数组
        }

        current_option['series'].push({
            id: key,
            name:nameDict[key],
            type: 'scatter',
            coordinateSystem: 'geo',
            data: convertData(map_data),
            itemStyle: {
                color: colorDict[key] // Top5 的颜色
            },
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
                color: colorDict[key]
            },
            emphasis: {
                label: {
                    show: true
                }
            }
        }
        );
    sanjia = get_sanjia(data);
    if (sanjia.length > 0){
        current_option['series'].push(
            {   
                id: key+"1",
                name: nameDict[key],
                type: 'effectScatter',
                coordinateSystem: 'geo',
                data: convertData(sanjia),
                encode: {
                    value: 2
                },
                symbolSize: function (val) {
                    return val[2] / 10;
                },
                showEffectOn: 'emphasis',
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
                    color: colorDict[key],
                    shadowBlur: 10,
                    shadowColor: '#333'
                },
                zlevel: 1
            }
        )
    }

        // 初始化图例
    if (first_legend) {
        current_option['legend'] = {
            icon: 'circle',
            orient: 'vertical',
            top: '3%',
            left: 'right',
            data: [], // 初始化图例数组
            textStyle: {
                color: '#fff'
            }
        };
    }
    
    // 更新图例 添加新的图例项
    exist = false;
    const newLegendItem = { name: nameDict[key] };
    if (first_legend){
        // 检查是否已经存在该项
        if (!current_option.legend.data.some(item => item.name === newLegendItem.name)) {
            current_option.legend.data.push(newLegendItem); // 添加新的图例项
            first_legend = false;
        }
    }else{
        for (let i = 0; i <current_option.legend.length;i++){
            if (current_option.legend[i].data.some(item => item.name === key)) {
                exist = true;
            }
        }
        if (!exist) {//默认加到第一个legend里
            current_option.legend[0].data.push(newLegendItem);
        }
    }
    

    myecharts.setOption(current_option);
}

function Load_yilianti(name) {
    $.ajax({
        url: `http://localhost:${port}/search_yilianti`,
        type: 'get',
        dataType: 'json',
        data: {
            name: name,
        },
        success: function(data) {
            put_scatter('wuhan_people',data);
        }
    }); 
}


function show_fanwei(){
    // 获取所有被选中的复选框
    search_names = [];
    checkboxStates_ = updateCheckboxStates();
    change_key = findDifferentKey(checkboxStates,checkboxStates_);
    checkboxStates = checkboxStates_;//更新checkbox的勾选状态
    // 获取有改动的医院的值
    search_name = ""

        if (change_key == "wuhan_people"){
            search_name = "武汉大学人民医院";
        }else if(change_key == "wuhan_zn"){
            search_name = "武汉大学中南医院";
        }else if (change_key == "wuhan_dental"){
            search_name = "武汉大学口腔医院";
        }else if(change_key == "tongji"){
            search_name = "华中科技大学同济医学院附属同济医院";
        }else if(change_key == "xiehe"){
            search_name = "华中科技大学同济医学院附属协和医院";
        }else if(change_key == "hubei_tcm"){
            search_name = "湖北省中医院";
        }
    if (checkboxStates[change_key] == false){
        // 找到目标 id 对应的元素索引
        current_option = myecharts.getOption();
        series = current_option['series'];
        index = []
        //const index = series.findIndex(item => item.name === nameDict[change_key]);
        for (let i = 0; i <series.length; i++) {
            if (series[i].name === nameDict[change_key]){
                index.push(i);
            }
        };

        // 按降序删除元素
        for (let i = index.length - 1; i >= 0; i--) {
            series.splice(index[i], 1);
        }
        
        current_option['series'] = series;
        myecharts.setOption(current_option,true);
    }else{
        $.ajax({
            url: `http://localhost:${port}/search_yilianti`,
            type: 'get',
            dataType: 'json',
            data: {
                name: search_name
            },
            success: function(data) {
                //put_scatter(data);
                //console.log("get data!!!");
                put_scatter(change_key,data);
            }
        }); 
    }
    
}
// 监听复选框的状态变化
var map_type = "fanwei";

// document.querySelectorAll('input[name="hospital"]').forEach(function(checkbox) {
//     checkbox.addEventListener('change', updateSelectedHospitals);
// });

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

function show_yiyuan_info() {
    $.ajax({
        url: `http://localhost:${port}/search_yiyuan_info`,
        type: 'get',
        dataType: 'json',
        success: function(data) {
            // 获取第一个 class 为 monitor 的元素中的 marquee-view
            const marqueeView = $('.monitor').first().find('.marquee');
            
            // 清空之前的内容
            marqueeView.empty();

            // 遍历返回的数据
            data.forEach(item => {
                // 创建新的 row 元素
                address = item.所在省 + item.所在市 + item.所在区县;
                const row = `
                    <div class="row">
                        <span class="col">${item.医院名称}</span>
                        <span class="col">${address}</span>
                        <span class="col">${item.所属医联体}</span>
                        <span class="icon-dot"></span>
                    </div>
                `;
                // 将新创建的 row 插入到 marquee-view 中
                marqueeView.append(row);
            });
        },
        error: function(err) {
            console.error('Error fetching data:', err);
        }
    });
}



function show_fanwei_order(){
    $.ajax({
        url: `http://localhost:${port}/search_fushe_info`,
        type: 'get',
        dataType: 'json',
        success: function(data) {
            const marqueeView = $('.monitor').eq(1).find('.marquee').first();
            // 清空之前的内容
            marqueeView.empty();

            const sortedData = data.sort((a, b) => b.辐射范围 - a.辐射范围);
            // 遍历返回的数据
            i = 1
            sortedData.forEach(item => {
                // 创建新的 row 元素
                const row = `
                    <div class="row">
                        <span class="mycol">${i}</span>
                        <span class="mycol">${item.医联体}</span>
                        <span class="mycol">${item.三甲医院数}</span>
                        <span class="icon-dot"></span>
                    </div>
                `;
                i++;
                // 将新创建的 row 插入到 marquee-view 中
                marqueeView.append(row);
            });
        }
    }); 
}


function show_fanwei_order(){
    $.ajax({
        url: `http://localhost:${port}/search_fushe_info`,
        type: 'get',
        dataType: 'json',
        success: function(data) {
            const marqueeView = $('.monitor').eq(1).find('.marquee').first();
            // 清空之前的内容
            marqueeView.empty();

            const sortedData = data.sort((a, b) => b.辐射范围 - a.辐射范围);
            // 遍历返回的数据
            i = 1
            sortedData.forEach(item => {
                // 创建新的 row 元素
                const row = `
                    <div class="row">
                        <span class="mycol">${i}</span>
                        <span class="mycol">${item.医联体}</span>
                        <span class="mycol">${item.三甲医院数}</span>
                        <span class="icon-dot"></span>
                    </div>
                `;
                i++;
                // 将新创建的 row 插入到 marquee-view 中
                marqueeView.append(row);
            });
        }
    }); 
}

function show_jiaohu_order(){
    $.ajax({
        url: `http://localhost:${port}/search_zuni_info`,
        type: 'get',
        dataType: 'json',
        success: function(data) {
            const marqueeView = $('.monitor').eq(1).find('.marquee').eq(1);
            // 清空之前的内容
            marqueeView.empty();

            const sortedData = data.sort((a, b) => b.平均阻尼系数 - a.平均阻尼系数);
            // 遍历返回的数据
            i = 1
            sortedData.forEach(item => {
                // 创建新的 row 元素
                const row = `
                    <div class="row">
                        <span class="mycol">${i}</span>
                        <span class="mycol">${item.医联体名称}</span>
                        <span class="mycol"></span>
                        <span class="icon-dot"></span>
                    </div>
                `;
                i++;
                // 将新创建的 row 插入到 marquee-view 中
                marqueeView.append(row);
            });
        }
    }); 
}


$(document).ready(function() {
    show_yiyuan_info();
    show_fanwei_order();
    show_jiaohu_order();
});