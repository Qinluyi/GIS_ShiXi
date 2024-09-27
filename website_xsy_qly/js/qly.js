port = 5601

port_yy = 5600
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

const yilianti_dict = {
    "wuhan_people": "武汉大学人民医院",
    "wuhan_zn": "武汉大学中南医院",
    "wuhan_dental": "武汉大学口腔医院",
    "tongji": "华中科技大学同济医学院附属同济医院",
    "xiehe": "华中科技大学同济医学院附属协和医院",
    "hubei_tcm": "湖北省中医院"
}

const table_name_dict = {
    "武汉大学人民医院交互明细": "武汉大学人民医院",
    "武汉大学中南医院交互明细": "武汉大学中南医院",
    "武汉大学口腔医院交互明细": "武汉大学口腔医院",
    "华中科技大学同济医学院附属同济医院交互明": "华中科技大学同济医学院附属同济医院",
    "华中科技大学同济医学院附属协和医院交互明": "华中科技大学同济医学院附属协和医院",
    "湖北省中医院交互明细": "湖北省中医院"
};

const time_color_dict = {
    "武汉大学人民医院交互明细": '#e6b3ff',
    "武汉大学中南医院交互明细": '#99ffbb',
    "武汉大学口腔医院交互明细": '#66b2ff',
    "华中科技大学同济医学院附属同济医院交互明": '#c68c53',
    "华中科技大学同济医学院附属协和医院交互明": '#ffff80',
    "湖北省中医院交互明细": '#ff4d94'
};


let function_type = ''; // Ensure this is defined globally

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

option_bar = {
    // 工具提示
    tooltip: {
        // 触发类型  经过轴触发axis  经过轴触发item
        trigger: 'item',
        formatter: function (params) {
            // params.name 是 xAxis.data 中对应的值，可以通过索引获取 hospitalNames 对应值
            var index = params.dataIndex;
            return cityNames[index] + ': ' + params.value;  // 显示医院名称和对应的值
        },
        // 轴触发提示才有效
        axisPointer: {
            // 默认为直线，可选为：'line' 线效果 | 'shadow' 阴影效果       
            type: 'shadow'
        }
    },
    // 图表边界控制
    grid: {
        // 距离 上右下左 的距离
        left: '0',
        right: '3%',
        bottom: '3%',
        top: '5%',
        // 大小是否包含文本【类似于boxsizing】
        containLabel: true,
        //显示边框
        show: true,
        //边框颜色
        borderColor: 'rgba(0, 240, 255, 0.3)'
    },
    // 控制x轴
    xAxis: [
        {
            // 使用类目，必须有data属性
            type: 'category',
            // 使用 data 中的数据设为刻度文字
            data: [],
            // 刻度设置
            axisTick: {
                // true意思：图形在刻度中间
                // false意思：图形在刻度之间
                alignWithLabel: true,  // 确保柱子和标签对齐
                show: true  // 显示刻度
            },
            //文字
            axisLabel: {
                color: '#4c9bfd',
                // 标签旋转 45 度
                rotate: 45,
                // 标签位置微调
                margin: 10,
                align: 'right',
                verticalAlign: 'middle'
            }
        }
    ],
    // 控制y轴
    yAxis: [
        {
            // 使用数据的值设为刻度文字
            type: 'value',
            axisTick: {
                // true意思：图形在刻度中间
                // false意思：图形在刻度之间
                alignWithLabel: false,
                show: false
            },
            //文字
            axisLabel: {
                color: '#4c9bfd'
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(0, 240, 255, 0.3)'
                }
            },
        }
    ],
    // 控制x轴
    series: [
        {
            // series配置
            // 颜色
            itemStyle: {
                // 提供的工具函数生成渐变颜色
                color: new echarts.graphic.LinearGradient(
                    // (x1,y2) 点到点 (x2,y2) 之间进行渐变
                    0, 0, 0, 1,
                    [
                        { offset: 0, color: '#00fffb' }, // 0 起始颜色
                        { offset: 1, color: '#0061ce' }  // 1 结束颜色
                    ]
                )
            },
            // 图表数据名称
            name: '用户统计',
            // 图表类型
            type: 'bar',
            // 柱子宽度
            barWidth: '60%',
            // 数据
            data: []
        }
    ]
};

option_bar1 = {
    // 工具提示
    tooltip: {
        // 触发类型  经过轴触发axis  经过轴触发item
        trigger: 'item',
        // 自定义提示框内容
        formatter: function (params) {
            // params.name 是 xAxis.data 中对应的值，可以通过索引获取 hospitalNames 对应值
            var index = params.dataIndex;
            return hospitalNames[index] + ': ' + params.value;  // 显示医院名称和对应的值
        },
        axisPointer: {
            // 默认为直线，可选为：'line' 线效果 | 'shadow' 阴影效果
            type: 'shadow'
        }
    },
    // 图表边界控制
    grid: {
        left: '0',
        right: '3%',
        bottom: '3%',
        top: '5%',
        containLabel: true,
        show: true,
        borderColor: 'rgba(0, 240, 255, 0.3)'
    },
    // 控制x轴
    xAxis: [
        {
            type: 'category',
            data: [],  // 将你希望在x轴上显示的数据填入此处
            axisTick: {
                alignWithLabel: true,
                show: true
            },
            axisLabel: {
                color: '#4c9bfd',
                rotate: 45,
                margin: 10,
                align: 'right',
                verticalAlign: 'middle'
            }
        }
    ],
    // 控制y轴
    yAxis: [
        {
            type: 'value',
            axisTick: {
                alignWithLabel: false,
                show: false
            },
            axisLabel: {
                color: '#4c9bfd'
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(0, 240, 255, 0.3)'
                }
            }
        }
    ],
    // 控制series
    series: [
        {
            itemStyle: {
                color: new echarts.graphic.LinearGradient(
                    0, 0, 0, 1,
                    [
                        { offset: 0, color: '#00fffb' },
                        { offset: 1, color: '#0061ce' }
                    ]
                )
            },
            name: '用户统计',
            type: 'bar',
            barWidth: '60%',
            data: []  // 将你希望在柱状图中显示的数据填入此处
        }
    ]
};


let fanwei_option = ""

var myecharts = echarts.init($('.map .geo')[0])

// myecharts.setOption(init_option)

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

var convertData_1 = function (data) {
    var res = [];
    for (var i = 0; i < data.length; i++) {
        var geoCoord = mygeoCoordMap[data[i].name][0];
        if (geoCoord) {
            res.push({
                name: data[i].name,
                value: geoCoord.concat(data[i].value, mygeoCoordMap[data[i].name][1])
            });
        }
    }
    return res;
};

function get_sanjia(data) {
    sanjia = [];
    data.forEach(item => {
        const { 医院名称, 医院等级 } = item;
        const levelValue = levelValues[医院等级];
        if (医院等级 == "三级甲等") {
            sanjia.push({ name: 医院名称, value: levelValue });
        }
    });
    return sanjia;
}

function put_scatter(key, data) {
    map_data = [];
    current_option = myecharts.getOption();

    data.forEach(item => {
        const { 医院名称, 经度, 纬度, 医院等级 } = item;

        mygeoCoordMap[医院名称] = [[经度, 纬度], 医院等级]; // 存储经纬度
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
        name: nameDict[key],
        type: 'scatter',
        coordinateSystem: 'geo',
        data: convertData_1(map_data),
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
    // if (sanjia.length > 0){
    //     current_option['series'].push(
    //         {   
    //             id: key+"1",
    //             name: nameDict[key],
    //             type: 'effectScatter',
    //             coordinateSystem: 'geo',
    //             data: convertData_1(sanjia),
    //             encode: {
    //                 value: 2
    //             },
    //             symbolSize: function (val) {
    //                 return val[2] / 10;
    //             },
    //             showEffectOn: 'emphasis',
    //             rippleEffect: {
    //                 brushType: 'stroke'
    //             },
    //             hoverAnimation: true,
    //             label: {
    //                 formatter: '{b}',
    //                 position: 'right',
    //                 show: true
    //             },
    //             itemStyle: {
    //                 color: colorDict[key],
    //                 shadowBlur: 10,
    //                 shadowColor: '#333'
    //             },
    //             zlevel: 1
    //         }
    //     )
    // }

    // 初始化图例
    if (first_legend) {
        current_option['legend'] = {
            icon: 'circle',
            orient: 'vertical',
            top: '3%',
            left: 'right',
            data: [], // 初始化图例数组
            textStyle: {
                color: '#fff',
                fontSize: 8 // 设置文字大小
            }
        };
    }

    // 更新图例 添加新的图例项
    exist = false;
    const newLegendItem = { name: nameDict[key] };
    if (first_legend) {
        // 检查是否已经存在该项
        if (!current_option.legend.data.some(item => item.name === newLegendItem.name)) {
            current_option.legend.data.push(newLegendItem); // 添加新的图例项
            first_legend = false;
        }
    } else {
        for (let i = 0; i < current_option.legend.length; i++) {
            if (current_option.legend[i].data.some(item => item.name === key)) {
                exist = true;
            }
        }
        if (!exist) {//默认加到第一个legend里
            current_option.legend[0].data.push(newLegendItem);
        }
    }


    myecharts.setOption(current_option);
    fanwei_option = current_option;
}

function Load_yilianti(name) {
    $.ajax({
        url: `http://localhost:${port}/search_yilianti`,
        type: 'get',
        dataType: 'json',
        data: {
            name: name,
        },
        success: function (data) {
            put_scatter('wuhan_people', data);
        }
    });
}


function show_fanwei() {
    //恢复之前的选择
    if (fanwei_option != "") {
        myecharts.setOption(fanwei_option, true);
    }
    // 获取所有被选中的复选框
    search_names = [];
    checkboxStates_ = updateCheckboxStates();
    change_key = findDifferentKey(checkboxStates, checkboxStates_);
    // 如果 change_key 为 null，结束函数
    if (change_key == null) {
        return;
    }
    checkboxStates = checkboxStates_;//更新checkbox的勾选状态
    // 获取有改动的医院的值
    search_name = ""

    if (change_key == "wuhan_people") {
        search_name = "武汉大学人民医院";
    } else if (change_key == "wuhan_zn") {
        search_name = "武汉大学中南医院";
    } else if (change_key == "wuhan_dental") {
        search_name = "武汉大学口腔医院";
    } else if (change_key == "tongji") {
        search_name = "华中科技大学同济医学院附属同济医院";
    } else if (change_key == "xiehe") {
        search_name = "华中科技大学同济医学院附属协和医院";
    } else if (change_key == "hubei_tcm") {
        search_name = "湖北省中医院";
    }
    if (checkboxStates[change_key] == false) {
        // 找到目标 id 对应的元素索引
        current_option = myecharts.getOption();
        series = current_option['series'];
        index = []
        //const index = series.findIndex(item => item.name === nameDict[change_key]);
        for (let i = 0; i < series.length; i++) {
            if (series[i].name === nameDict[change_key]) {
                index.push(i);
            }
        };

        // 按降序删除元素
        for (let i = index.length - 1; i >= 0; i--) {
            series.splice(index[i], 1);
        }

        current_option['series'] = series;
        myecharts.setOption(current_option, true);

        fanwei_option = current_option
    } else {
        $.ajax({
            url: `http://localhost:${port}/search_yilianti`,
            type: 'get',
            dataType: 'json',
            data: {
                name: search_name
            },
            success: function (data) {
                //put_scatter(data);
                //console.log("get data!!!");
                put_scatter(change_key, data);
            }
        });
    }

}


// document.querySelectorAll('input[name="hospital"]').forEach(function(checkbox) {
//     checkbox.addEventListener('change', updateSelectedHospitals);
// });

// document.querySelectorAll('input[name="hospital"]').forEach(function(checkbox) {
//     checkbox.addEventListener('change', function() {
//         if (map_type === 'type1') {
//             console.log("updateSelectedHospitals();")// 根据map_type触发不同的函数
//         } else if (map_type === 'fanwei') {
//             //console.log('map_type');
//             // updateCheckboxStates();
//             show_fanwei();
//         }
//     });
// });

function show_yiyuan_info() {
    $.ajax({
        url: `http://localhost:${port}/search_yiyuan_info`,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            // 获取第一个 class 为 monitor 的元素中的 marquee-view
            const marqueeView = $('.monitor').eq(1).find('.marquee');

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
        error: function (err) {
            console.error('Error fetching data:', err);
        }
    });
}





function show_fanwei_order() {
    $.ajax({
        url: `http://localhost:${port}/search_fushe_info`,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            const marqueeView = $('.monitor').eq(0).find('.marquee').first();
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

function show_jiaohu_order() {
    $.ajax({
        url: `http://localhost:${port}/search_zuni_info`,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            const marqueeView = $('.monitor').eq(0).find('.marquee').eq(1);
            // 清空之前的内容
            marqueeView.empty();

            const sortedData = data.sort((a, b) => a.平均阻尼系数 - b.平均阻尼系数);
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
function my_processValues(hospitalValues) {
    const max = Math.max(...hospitalValues);
    const min = Math.min(...hospitalValues) - 0.1;
    for (let i = 0; i < hospitalValues.length; i++) {
        hospitalValues[i] = (hospitalValues[i] - min) / (max - min) * 100;
    }
    return hospitalValues;
}
// 函数：更新选中的医院
function update_zuni_reli() {
    // 获取所有被选中的复选框
    var checkboxes = document.querySelectorAll('input[name="hospital"]:checked');
    var selectedHospitals = [];

    // 获取所有选中的医院的值
    checkboxes.forEach(function (checkbox) {
        selectedHospitals.push(yilianti_dict[checkbox.value]);
    });

    if (selectedHospitals.length == 0) {
        myecharts = echarts.init($('.map .geo')[0])
        myecharts.setOption(option1, true);
        option_bar1.xAxis[0].data = []; // Update the x-axis with top 10 city names
        option_bar1.series[0].data = []; // Update the series with corresponding city values

        var myechart3 = echarts.init($('.users .bar')[0]);
        myechart3.setOption(option_bar1);
    } else {
        $.ajax({
            url: `http://localhost:${port}/search_zuni_reli`,
            type: 'get',
            data: { names: selectedHospitals }, // 将 names 放在 data 中
            dataType: 'json',
            success: function (return_data) {
                // 清空之前的数据
                data = [];
                geoCoordMap = {};
                hospitals = [];
                name_zuni_dict = {};

                return_data[0].forEach(item => {
                    name_zuni_dict[item.医院名称] = item.阻尼系数
                });

                for (let i = 1; i < return_data.length; i++) {
                    return_data[i].forEach(item => {
                        const hospitalName = item['医院名称'];
                        if (hospitalName) {
                            //更新 geoCoordMap
                            geoCoordMap[hospitalName] = [parseFloat(item['经度']), parseFloat(item['纬度'])];
                        }
                    });
                }

                for (const key in geoCoordMap) {
                    if (geoCoordMap.hasOwnProperty(key)) {
                        hospitalName = key;
                        if (hospitalName) {
                            // 根据当前的交互类型更新 data 的 value
                            value = 10 - name_zuni_dict[hospitalName];
                            data.push({
                                name: hospitalName,
                                value: value//Math.log(value) // 对数缩放
                            });

                        }
                    }
                }

                var newConvertedData = convertData(data);

                // 更新地图数据
                option.baseOption.series[0].data = newConvertedData;
                myecharts.setOption(option, true); // 更新地图
                // 更新bar
                var top10Hospital = data.sort(function (a, b) {
                    return b.value - a.value;
                }).slice(0, 10);
                // Extract city names and values for the bar chart
                hospitalNames = top10Hospital.map(item => item.name);
                var hospitalValues = top10Hospital.map(item => item.value);
                var processedNames = processHospital(hospitalNames);
                var processedValues = my_processValues(hospitalValues);
                // Update the bar chart data
                option_bar1.xAxis[0].data = processedNames; // Update the x-axis with top 10 city names
                option_bar1.series[0].data = processedValues; // Update the series with corresponding city values

                var myechart3 = echarts.init($('.users .bar')[0]);
                myechart3.setOption(option_bar1);

            }
        });
    }
}

//销售
function show_time_figure() {
    var option_time = {
        //鼠标提示工具
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            // 类目类型                                  
            type: 'category',
            // x轴刻度文字                                  
            data: ['2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'],
            axisTick: {
                show: false//去除刻度线
            },
            axisLabel: {
                color: '#4c9bfd'//文本颜色
            },
            axisLine: {
                show: false//去除轴线  
            },
            boundaryGap: false//去除轴内间距
        },
        yAxis: {
            // 数据作为刻度文字                                  
            type: 'value',
            axisTick: {
                show: false//去除刻度线
            },
            axisLabel: {
                color: '#4c9bfd'//文本颜色
            },
            axisLine: {
                show: false//去除轴线  
            },
            boundaryGap: false//去除轴内间距
        },
        //图例组件

        // 设置网格样式
        grid: {
            show: true,// 显示边框
            top: '20%',
            left: '3%',
            right: '4%',
            bottom: '3%',
            borderColor: '#012f4a',// 边框颜色
            containLabel: true // 包含刻度文字在内
        },
        series: [

        ]
    };

    $.ajax({
        url: `http://localhost:${port}/search_time_info`,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            //console.log(data);
            var myechart_1 = echarts.init($('.line')[0]);

            var data1 = {};
            data1['year'] = [];
            for (var key in table_name_dict) {
                yilianti_data = [];
                yilianti_series = {};
                yilianti_series['name'] = table_name_dict[key];
                yilianti_series['type'] = 'line';
                yilianti_series['smooth'] = true;
                yilianti_series['itemStyle'] = { color: time_color_dict[key] };
                for (var j = 0; j < 12; j++) {
                    yilianti_data.push(data[key][j].count);
                }
                yilianti_series['data'] = yilianti_data;
                option_time.series.push(yilianti_series);
            }
            myechart_1.setOption(option_time);
        }
    });

}


$(document).ready(function () {
    show_yiyuan_info();
    show_fanwei_order();
    show_jiaohu_order();
    show_time_figure();
    myecharts.setOption(init_option, true);
});





/***************xsy**************** */
// 全局变量
var data = [];
var geoCoordMap = {};
var currentInteractionType = '文章数量'; // 初始交互类型为文章数量
// var function_type = '数量热力图';
geoCoordMap = {};
fetch('http://localhost:5500/get_coordinate_map')
    .then(response => response.json())
    .then(hospitalData => {
        hospitalData.forEach(item => {
            const hospitalName = item['医院名称'];
            if (hospitalName) {
                // 更新 geoCoordMap
                geoCoordMap[hospitalName] = [parseFloat(item['经度']), parseFloat(item['纬度'])];
            }
        });
    })
    .catch(error => console.error('Error fetching coordinate map:', error));




function processHospital(hospitalNames) {
    return hospitalNames.map(name => name.substring(0, 2) + '...');
}

function processValues(hospitalValues) {
    return hospitalValues.map(value => Math.floor(Math.exp(value)));
}


function transformValues(top5Hospital) {
    return top5Hospital.map(item => {
        // 将value替换为e的该值次方并取整
        return {
            ...item,  // 保留原对象的其他属性
            value: Math.round(Math.exp(item.value))  // e的次方并取整
        };
    });
}

// 函数：更新选中的医院
function updateSelectedHospitals_jiaohu() {
    // 获取所有被选中的复选框
    var checkboxes = document.querySelectorAll('input[name="hospital"]:checked');
    var selectedHospitals = [];

    // 获取所有选中的医院的值
    checkboxes.forEach(function (checkbox) {
        selectedHospitals.push(checkbox.value);
    });

    if (selectedHospitals.length === 0) {
        data = [];
        // geoCoordMap = {};
        myecharts.setOption(option1, true); // 更新地图
        option_bar1.xAxis[0].data = []; // Update the x-axis with top 10 city names
        option_bar1.series[0].data = []; // Update the series with corresponding city values
        //option_pie.series[0].data = []; // Update the series with corresponding city values

        var myechart3 = echarts.init($('.users .bar')[0]);
        myechart3.setOption(option_bar1);
        //var myechart2 = echarts.init($('.point .pie')[0]);
        //myechart2.setOption(option_pie);

        console.log('Updated data:', data);
        console.log('Updated geoCoordMap:', geoCoordMap);
    }
    else {
        const startYearValue = document.getElementById('start-year').innerText;
        console.log(startYearValue); // 输出: 2017
        const endYearValue = document.getElementById('end-year').innerText;
        console.log(endYearValue); // 输出: 2017
        if (startYearValue == '2010' && endYearValue == '2024') {
            // 将选中的医院传递到后端
            fetch('http://localhost:5500/get_hospital_count?hospitals=' + encodeURIComponent(selectedHospitals.join(',')))
                .then(response => response.json())
                .then(hospitalData => {
                    console.log('Selected hospital data:', data);

                    // 清空之前的数据
                    data = [];
                    // geoCoordMap = {};

                    hospitalData.forEach(item => {
                        const hospitalName = item['医院'] || item['医院名称'];
                        if (hospitalName) {
                            // 根据当前的交互类型更新 data 的 value
                            var value = item[currentInteractionType] || 0;
                            data.push({
                                name: hospitalName,
                                value: Math.log(value) // 对数缩放
                            });

                            // // 更新 geoCoordMap
                            // geoCoordMap[hospitalName] = [parseFloat(item['经度']), parseFloat(item['纬度'])];
                        }
                    });

                    var top10Hospital = data.sort(function (a, b) {
                        return b.value - a.value;
                    }).slice(0, 10);

                    var top5Hospital = data.sort(function (a, b) {
                        return b.value - a.value;
                    }).slice(0, 5);

                    // Extract city names and values for the bar chart
                    hospitalNames = top10Hospital.map(item => item.name);
                    var hopitalValues = top10Hospital.map(item => item.value);
                    var processedNames = processHospital(hospitalNames);
                    var processedValues = processValues(hopitalValues);

                    // Update the bar chart data
                    option_bar1.xAxis[0].data = processedNames; // Update the x-axis with top 10 city names
                    option_bar1.series[0].data = processedValues; // Update the series with corresponding city values
                    transformedTop5Hospital = transformValues(top5Hospital);
                    //option_pie.series[0].data = transformedTop5Hospital; // Update the series with corresponding city values

                    var myechart3 = echarts.init($('.users .bar')[0]);
                    myechart3.setOption(option_bar1);
                    //var myechart2 = echarts.init($('.point .pie')[0]);
                    //myechart2.setOption(option_pie);

                    var newConvertedData = convertData(data);

                    // 更新地图数据
                    option.baseOption.series[0].data = newConvertedData;
                    myecharts.setOption(option, true); // 更新地图

                    console.log('Updated data:', data);
                    console.log('Updated geoCoordMap:', geoCoordMap);
                })
                .catch(error => console.error('Error:', error));
        }

        else {
            // 将选中的医院传递到后端
            fetch(`http://localhost:5500/get_hospital_detail_count?hospitals=${encodeURIComponent(selectedHospitals.join(','))}&startYear=${startYearValue}&endYear=${endYearValue}`)
                .then(response => response.json())
                .then(hospitalData => {
                    const { mergedResults, summary } = hospitalData; // 解构获取结果和汇总

                    console.log('Merged results:', mergedResults);
                    console.log('Summary:', summary);


                    // 清空之前的数据
                    data = [];

                    // 使用 Object.values() 遍历 summary 对象
                    Object.values(summary).forEach(item => {
                        const hospitalName = item['医院名称'];
                        if (hospitalName) {
                            // 根据当前的交互类型更新 data 的 value
                            var value = item[currentInteractionType] || 0;
                            data.push({
                                name: hospitalName,
                                value: Math.log(value) // 对数缩放
                            });
                        }
                    });


                    var top10Hospital = data.sort(function (a, b) {
                        return b.value - a.value;
                    }).slice(0, 10);

                    var top5Hospital = data.sort(function (a, b) {
                        return b.value - a.value;
                    }).slice(0, 5);

                    // Extract city names and values for the bar chart
                    hospitalNames = top10Hospital.map(item => item.name);
                    var hopitalValues = top10Hospital.map(item => item.value);
                    var processedNames = processHospital(hospitalNames);
                    var processedValues = processValues(hopitalValues);

                    // Update the bar chart data
                    option_bar1.xAxis[0].data = processedNames; // Update the x-axis with top 10 city names
                    option_bar1.series[0].data = processedValues; // Update the series with corresponding city values
                    transformedTop5Hospital = transformValues(top5Hospital);
                    //option_pie.series[0].data = transformedTop5Hospital; // Update the series with corresponding city values

                    var myechart3 = echarts.init($('.users .bar')[0]);
                    myechart3.setOption(option_bar1);
                    //var myechart2 = echarts.init($('.point .pie')[0]);
                    //myechart2.setOption(option_pie);

                    var newConvertedData = convertData(data);

                    // 更新地图数据
                    option.baseOption.series[0].data = newConvertedData;
                    myecharts.setOption(option, true); // 更新地图

                    console.log('Updated data:', data);
                    console.log('Updated geoCoordMap:', geoCoordMap);
                })
                .catch(error => console.error('Error:', error));
        }

    }

}

// 预处理城市数据函数
function processCityNames(data) {
    return data.map(city => {
        if (city === "恩施土家族苗族自治州") {
            return "恩施"; // 特殊处理恩施土家族苗族自治州
        } else if (city.endsWith("市")) {
            return city.slice(0, -1); // 去掉以“市”结尾的城市名称
        } else {
            return city; // 其他城市名称保持不变
        }
    });
}

function updateSelectedHospitals_shuliang() {
    // Get all selected checkboxes
    var checkboxes = document.querySelectorAll('input[name="hospital"]:checked');
    var selectedHospitals = [];

    // Get the values of all selected hospitals
    checkboxes.forEach(function (checkbox) {
        selectedHospitals.push(checkbox.value);
    });

    if (selectedHospitals.length === 0) {
        data = [];
        //geoCoordMap = {};
        myecharts.setOption(option1, true); // 更新地图
        option_bar.xAxis[0].data = []; // Update the x-axis with top 10 city names
        option_bar.series[0].data = []; // Update the series with corresponding city values
        //option_pie.series[0].data = []; // Update the series with corresponding city values

        var myechart1 = echarts.init($('.users .bar')[0]);
        myechart1.setOption(option_bar);
        //var myechart2 = echarts.init($('.point .pie')[0]);
        //myechart2.setOption(option_pie);

        console.log('Updated data:', data);
        console.log('Updated geoCoordMap:', geoCoordMap);
    }

    else {
        // Send selected hospitals to the backend
        fetch('http://localhost:5500/total_hospital_number?hospitals=' + encodeURIComponent(selectedHospitals.join(',')))
            .then(response => response.json())
            .then(cityData => {
                console.log('City data:', cityData);
                // Sort the city data by value (user count) in descending order and get the top 10
                var top10Cities = cityData.sort(function (a, b) {
                    return b.value - a.value;
                }).slice(0, 10);
                var top5Cities = cityData.sort(function (a, b) {
                    return b.value - a.value;
                }).slice(0, 5);

                // Extract city names and values for the bar chart
                cityNames = top10Cities.map(item => item.name);
                var cityValues = top10Cities.map(item => item.value);


                var cityNames_new = processCityNames(cityNames)
                // Update the bar chart data
                option_bar.xAxis[0].data = cityNames_new; // Update the x-axis with top 10 city names
                option_bar.series[0].data = cityValues; // Update the series with corresponding city values

                //option_pie.series[0].data = top5Cities; // Update the series with corresponding city values

                var myechart1 = echarts.init($('.users .bar')[0]);
                myechart1.setOption(option_bar);
                //var myechart2 = echarts.init($('.point .pie')[0]);
                //myechart2.setOption(option_pie);


                // Clear previous data
                data = [];

                cityData.forEach(item => {
                    console.log(item)
                    var cityName = item['name'];
                    var count = item['value'];
                    // Check if city exists in geoCoordMap
                    //geoCoordMap =geoCoordMap_china
                    if (geoCoordMap_china[cityName]) {
                        data.push({
                            name: cityName,
                            value: count
                        });
                    } else {
                        console.warn('City not found in geoCoordMap_china:', cityName);
                    }
                });

                var newConvertedData = convertData_china(data);


                console.log('Updated data:', data);
                // Update the map data
                option2.baseOption.series[0].data = newConvertedData;
                option2.baseOption.series[1].data = newConvertedData;
                myecharts.setOption(option2, true); // Update the map


            })
            .catch(error => console.error('Error:', error));
    }

}




//let function_type = ''; // Ensure this is defined globally

// 添加按钮点击事件
function setupButtonListeners() {
    document.getElementById('btn-fushefanwei').addEventListener('click', function () {
        if (function_type === "交互详情") {
            remove_jiaohu_info();
        }
        function_type = '辐射范围';
        // current_option = myecharts.getOption();
        // current_option['series'] = [];

        myecharts.setOption(init_option, true);
        // first_legend = true;
        show_fanwei();

        document.querySelector('.button-container').style.visibility = 'hidden';
        document.querySelector('.button-container-yy').style.visibility = 'hidden';
        document.querySelector('.timeline').style.visibility = 'hidden';
        console.log('Function Type:', function_type); // Debugging line
    });

    document.getElementById('btn-fushenengli').addEventListener('click', function () {
        if (function_type === "交互详情") {
            remove_jiaohu_info();
        }
        function_type = '辐射能力';
        myecharts.setOption(option1, true); // 更新地图

        update_zuni_reli();
        // 修改标题内容
        document.querySelector('.users.panel h3').innerText = '各医院交互能力柱状图（前10）';
        document.querySelector('.button-container').style.visibility = 'hidden';
        document.querySelector('.button-container-yy').style.visibility = 'hidden';
        document.querySelector('.timeline').style.visibility = 'hidden';

        console.log('Function Type:', function_type); // Debugging line
    });

    document.getElementById('jiaohufanwei').addEventListener('click', function () {
        if (function_type === "交互详情") {
            remove_jiaohu_info();
        }
        function_type = '交互范围';
        document.querySelector('.button-container').style.visibility = 'hidden';
        document.querySelector('.button-container-yy').style.visibility = 'visible';
        document.querySelector('.timeline').style.visibility = 'hidden';

        document.querySelector('.map h3').innerHTML = `
        <span class="icon-cube"></span>
        医联体交互范围图
        `;
        update_yy();
        console.log('Function Type:', function_type); // Debugging line
    });

    document.getElementById('jiaohuxiangqing').addEventListener('click', function () {
        if (function_type === "交互详情") {
            remove_jiaohu_info();
        }
        function_type = '交互详情';

        document.querySelector('.button-container-yy').style.visibility = 'hidden';
        document.querySelector('.button-container').style.visibility = 'hidden';
        document.querySelector('.timeline').style.visibility = 'hidden';

        document.querySelector('.map h3').innerHTML = `
        <span class="icon-cube"></span>
        医联体交互详情图
        `;

        update_yy2();
        console.log('Function Type:', function_type); // Debugging line
    });



    document.getElementById('btn-jiaohurelitu').addEventListener('click', function () {
        if (function_type === "交互详情") {
            remove_jiaohu_info();
        }
        function_type = '交互热力图';
        myecharts = echarts.init($('.map .geo')[0])
        myecharts.setOption(option1)
        // 显示按钮容器
        option_bar1.xAxis[0].data = []; // Update the x-axis with top 10 city names
        option_bar1.series[0].data = []; // Update the series with corresponding city values


        // 显示按钮
        document.querySelector('.button-container').style.visibility = 'visible';
        document.querySelector('.button-container-yy').style.visibility = 'hidden';
        document.querySelector('.timeline').style.visibility = 'visible';
        document.querySelector('.map h3').innerHTML = `
        <span class="icon-cube"></span>
        交互数量分布热力图
        `;
        // 修改标题内容
        document.querySelector('.users.panel h3').innerText = '各医院交互数量柱状图（前10）';
        // 修改标题内容
        //document.querySelector('.point.panel h3').innerText = '各医院交互数量饼图（前5）';
        console.log('Function Type:', function_type); // Debugging line
        updateSelectedHospitals_jiaohu(); // Ensure the update function is called here
    });

    document.getElementById('btn-shuliangrelitu').addEventListener('click', function () {
        if (function_type === "交互详情") {
            remove_jiaohu_info();
        }
        function_type = '数量热力图';
        myecharts = echarts.init($('.map .geo')[0])
        myecharts.setOption(option1)

        option_bar.xAxis[0].data = []; // Update the x-axis with top 10 city names
        option_bar.series[0].data = []; // Update the series with corresponding city values

        document.querySelector('.button-container').style.visibility = 'hidden';
        document.querySelector('.button-container-yy').style.visibility = 'hidden';
        document.querySelector('.timeline').style.visibility = 'hidden';
        // 修改地图标题
        document.querySelector('.map h3').innerHTML = `
        <span class="icon-cube"></span>
        医联体数量分布图
        `;
        // 修改标题内容
        document.querySelector('.users.panel h3').innerText = '各市医院数量柱状图（前10）';
        // 修改标题内容
        //document.querySelector('.point.panel h3').innerText = '各市医院数量饼图（前5）';
        console.log('Function Type:', function_type); // Debugging line
        updateSelectedHospitals_shuliang(); // Ensure the update function is called here
    });



    // 下面是点击“沟通”“总数量“等改变
    document.getElementById('btn-total-intensity').addEventListener('click', function () {
        currentInteractionType = '文章数量'; // 设置为总强度
        if (function_type == '交互热力图') {
            updateSelectedHospitals_jiaohu(); // 更新图表   
        }
    });
    document.getElementById('btn-cooperation').addEventListener('click', function () {
        currentInteractionType = '合作'; // 设置为合作
        if (function_type == '交互热力图') {
            updateSelectedHospitals_jiaohu(); // 更新图表   
        }
    });

    document.getElementById('btn-communication').addEventListener('click', function () {
        currentInteractionType = '沟通'; // 设置为沟通
        if (function_type == '交互热力图') {
            updateSelectedHospitals_jiaohu(); // 更新图表   
        }
    });

    document.getElementById('btn-technology').addEventListener('click', function () {
        currentInteractionType = '技术'; // 设置为技术
        if (function_type == '交互热力图') {
            updateSelectedHospitals_jiaohu(); // 更新图表   
        }
    });

    document.getElementById('btn-last-level').addEventListener('click', function () {
        //currentInteractionType = '技术'; // 设置为技术
        if (function_type == '交互范围') {
            handleClick(); // 更新图表   
        }
    });


}

// 监听复选框的状态变化
document.querySelectorAll('input[name="hospital"]').forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
        if (function_type === '辐射范围') {

            show_fanwei();
        } else if (function_type === '辐射能力') {
            update_zuni_reli();
        }
        if (function_type === '交互热力图') {
            updateSelectedHospitals_jiaohu();
        } else if (function_type === '数量热力图') {
            updateSelectedHospitals_shuliang();
        }

        if (function_type == "交互范围") {
            update_yy();
        }
        if (function_type == "交互详情") {
            update_yy2();
        }
    });
});

// 设置按钮的监听事件
setupButtonListeners();


/********************yy.js******************** */
//map2

var current_area = "china";
var area_last = "china"
var current_level = "country"
//中国地图 map2
// var myChart = echarts.init($('.map .geo')[1])

var colors = ['#142957', '#6699FF', '#aaeeff'];
var addressArray = [];//地址名称
var coords = [];//存储有需要展示的医院的经纬度

var antiGeocode = {};
var selectedHospitals2 = "文章数量";
var selectedHospitals = "武汉大学人民医院";


function drawMap(area, myecharts) {

    var address = '../website_xsy_qly/data/' + area + '.json';

    // 加载 GeoJSON 数据
    $.getJSON(address, function (geoJson) {

        // 注册地图
        echarts.registerMap('China', geoJson);

        // 设置地图的中心坐标

        // 调用 getAddressInfo 函数获取地址信息
        getAddressInfo().then(function (addressArray) {
            // 配置地图选项
            var option_yy = {
                geo: {
                    map: 'China',
                    zoom: 1.2,
                    label: {
                        show: true, // 显示标签
                        emphasis: {
                            show: true // 高亮状态下也显示标签
                        },
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
                    },
                    regions: geoJson.features.map(function (feature) {
                        var name = String(feature.properties.name);
                        var country_id = feature.properties.id;
                        var value = addressArray.includes(name) ? 1 : 0;

                        return {
                            name: name,
                            country_id: country_id,
                            value: value,
                            itemStyle: {
                                normal: {
                                    areaColor: colors[value],
                                    borderWidth: value * 4, //设置外层边框
                                    borderColor: '#3366FF',
                                }
                            }
                        };
                    })
                },

                tooltip: {
                    trigger: 'item',
                    formatter: function (params) {
                       return params.seriesName + '\n' + params.name;
                      // return '123';
                    }
                },
                series: []
            };

            var pointseries = []; // 将pointseries定义为一个空数组

            var add = [];
            geoJson.features.forEach(function (feature) {
                add.push(feature.properties.name);
            });



            coords.forEach(function (item) {
                // 确保从坐标和到坐标都存在
                if (item) {
                    var co = item[0] + '_' + item[1];
                    var tempinfo = antiGeocode[co];
                    if (current_level == 'country') {
                        pointseries.push({
                            name: tempinfo[3] + '<br/>'+ '结算等级: ' + tempinfo[4],
                            type: 'effectScatter',
                            coordinateSystem: 'geo',
                            zlevel: 1001,
                            rippleEffect: {
                                brushType: 'stroke'
                            },
                            label: {
                                normal: {
                                    show: true,
                                    position: 'right',
                                    formatter: '{b}'

                                }
                            },
                            symbolSize: (levelValues[tempinfo[4]] || 50) / 10, // 根据值设置符号大小
                            itemStyle: {
                                normal: {
                                    color: '#ffff80', // 确保颜色循环使用
                                }
                            },
                            data: [item]
                        });
                    }
                    else if (current_level == 'province') {
                        if (add.includes(tempinfo[1])) {
                            pointseries.push({
                                name: tempinfo[3] + '<br/>'+ '结算等级: ' + tempinfo[4],
                                type: 'effectScatter',
                                coordinateSystem: 'geo',
                                zlevel: 1001,
                                rippleEffect: {
                                    brushType: 'stroke'
                                },
                                label: {
                                    normal: {
                                        show: true,
                                        position: 'right',
                                        formatter: '{b}'
                                    }
                                },
                                symbolSize: (levelValues[tempinfo[4]] || 50) / 10, // 根据值设置符号大小
                                itemStyle: {
                                    normal: {
                                        color: '#ffff80', // 确保颜色循环使用
                                    }
                                },
                                data: [item]
                            });
                        }
                    } else if (current_level == 'city') {
                        if (add.includes(tempinfo[2])) {
                            pointseries.push({
                                name: tempinfo[3] + '<br/>'+ '结算等级: ' + tempinfo[4],
                                type: 'effectScatter',
                                coordinateSystem: 'geo',
                                zlevel: 1001,
                                rippleEffect: {
                                    brushType: 'stroke'
                                },
                                label: {
                                    normal: {
                                        show: true,
                                        position: 'right',
                                        formatter: '{b}'
                                    }
                                },
                                symbolSize: (levelValues[tempinfo[4]] || 50) / 10, // 根据值设置符号大小
                                itemStyle: {
                                    normal: {
                                        color: '#ffff80', // 确保颜色循环使用
                                    }
                                },
                                data: [item]
                            });
                        }
                    }


                }
            });

            option_yy.series = option_yy.series.concat(pointseries); // 将pointseries数组添加到option.series中

            // 设置地图选项
            myecharts.clear(); // 清除上一次绘制的图表
            myecharts.setOption(option_yy, { notMerge: true });
            console.log('sss');
        }).catch(function (error) {
            console.error(error);
        });
    });
}
// 地理逆编码
function getAddressInfo() {
    return new Promise(function (resolve, reject) {
        var tempAddressArray = [];
        var promises = [];
        var resolveOuter, rejectOuter; // 外部的 resolve 和 reject

        coords.forEach(function (element) {
            if (element) {
                var co = element[0] + '_' + element[1];
                var promise = new Promise(function (resolve, reject) {
                    var temp = antiGeocode[co];
                    if (current_level == 'country') {
                        if (temp[0].substring(0, 2) == "黑龙") {
                            tempAddressArray.push("黑龙江");
                        } else if (temp[0].substring(0, 2) == "内蒙") {
                            tempAddressArray.push("内蒙古");
                        } else {
                            tempAddressArray.push(temp[0].substring(0, 2));
                        }
                    } else if (current_level == 'province') {
                        tempAddressArray.push(temp[1]);
                    } else if (current_level == 'city') {
                        tempAddressArray.push(temp[2]);
                    }
                    resolve(); // 使用内部的 resolve
                });
                promises.push(promise);
            }

            Promise.all(promises).then(function () {
                resolveOuter(tempAddressArray); // 调用外部的 resolve
            }).catch(function (error) {
                rejectOuter(error); // 调用外部的 reject
            });

            resolveOuter = resolve; // 存储外部的 resolve
            rejectOuter = reject; // 存储外部的 reject

        });

    });
}

//map1
var planePath = 'path://M.6,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705';
function getHospitalLocationData1() {
    return new Promise(function (resolve, reject) {
        $.getJSON('http://localhost:' + port_yy + '/HospitalsLocation', function (hospitalData) {
            var geoCoordMap = {};
            antiGeocode = {};
            hospitalData.forEach(function (hospital) {
                var name = hospital.医院名称;
                var longitude = hospital.经度;
                var latitude = hospital.纬度;
                var province = hospital.所在省;
                var city = hospital.所在市;
                var qu = hospital.所在区县;
                var level = hospital.医院等级;
                geoCoordMap[name] = [longitude, latitude,];
                antiGeocode[longitude + '_' + latitude] = [province, city, qu, name, level];

            });
            resolve(geoCoordMap);
        }).fail(function (error) {
            reject(error);
        });
    });
}

//获取特定医联体的交互信息
function getZhongNanHospitalData1(hospitalJH, types) {
    return new Promise(function (resolve, reject) {
        var ZNhospitals = [];
        var total = 0;
        var name_t = [];
        const typess = types.split(',');


        hospitalJH.forEach(function (hospitalJH) {
            var value = 0;
            for (const type of typess) {
                if (type == "文章数量") {
                    value += hospitalJH.文章数量;
                } else if (type == "合作") {
                    value += hospitalJH.合作;
                } else if (type == "沟通") {
                    value += hospitalJH.沟通;
                } else if (type == "技术") {
                    value += hospitalJH.技术;
                }
                var name1 = hospitalJH.hospital;
                var name2 = hospitalJH.医院名称;

                name_t = hospitalJH.hospital;
                total += value;


            }
            var item = [{
                name: name1
            }, {
                name: name2,
                value: value
            }];
            ZNhospitals.push(item);
        });




        var add = [{
            name: name_t
        }, {
            name: name_t,
            value: 50
        }];

        ZNhospitals.push(add);
        resolve(ZNhospitals);
    });
}

//返回上一级
function handleClick() {
    if (current_level == "city") {
        current_level = "province";
        current_area = area_last;
        area_last = "china";

    }
    else if (current_level == "province") {
        current_level = "country";
        area_last = "china";
        current_area = "china";
    }
    var area = current_level + '/' + current_area;
    getAddressInfo();
    drawMap(area, myecharts);
    // addressArray = [];
}

function update_yy() {
    // 获取所有被选中的复选框
    var checkboxes = document.querySelectorAll('input[name="hospital"]:checked');
    var selectedHospital = [];

    // 获取所有选中的医院的值
    checkboxes.forEach(function (checkbox) {
        selectedHospital.push(checkbox.value);
    });
    var selectedHospitals = selectedHospital.join(',');
    $.ajax({
        url: 'http://localhost:' + port_yy + '/ZhongNanHospitals',
        type: 'get',
        dataType: 'json',
        data: {//传进去的值
            selectedHospitals: selectedHospitals,
        }, // Pass the parameter here
        success: function (data) {//返回结果在data里 数据返回成功之后要干什么

            Promise.all([getHospitalLocationData1(), getZhongNanHospitalData1(data, "文章数量")])
                .then(function (results) {
                    var geoCoordMap1 = results[0];
                    //antiGeocode = results[0];

                    var ZNhospitals = results[1];
                    //drawMapChart(geoCoordMap1, ZNhospitals);




                    //var coords = results[0];
                    var ZNhospitals = results[1];
                    coords = [];
                    ZNhospitals.forEach(function (item) {
                        coords.push(geoCoordMap1[item[1].name]);
                    });

                    $(document).ready(function () {
                        // 初始化地图
                        //var myChart = echarts.init(document.getElementById('map2'))
                        myecharts.on('click', function (params, event) {
                            {
                                if (params.componentType === 'geo') {
                                    // 判断事件来源是否为地图系列
                                    var clickedRegion = params.region.country_id; // 获取点击的地区名称

                                    // 在这里可以根据点击的地区执行相应的操作

                                    if (current_level == "country") {
                                        current_level = "province";
                                        area_last = current_area;
                                        current_area = clickedRegion;
                                    }
                                    else if (current_level == "province") {
                                        current_level = "city";
                                        area_last = current_area;
                                        current_area = clickedRegion;
                                    }
                                    var area = current_level + '/' + current_area;
                                    getAddressInfo();
                                    drawMap(area, myecharts);
                                    event.stopPropagation();
                                    // addressArray = [];
                                }
                            }
                        });
                        // 绘制地图
                        var area = current_level + '/' + current_area;
                        getAddressInfo();
                        drawMap(area, myecharts);
                        addressArray = [];
                    });

                })
                .catch(function (error) {
                    console.error('获取数据失败：', error);
                });
        }
    });
}

function remove_jiaohu_info() {
    var geoCoordMap1 = {
        '医院1': [0, 0],
        '医院2': [0, 0]
    };
    //antiGeocode = results[0];

    var ZNhospitals = [
        [{
            name: '医院1'
        }, {
            name: '医院2',
            value: 0
        }]
    ];
    drawMapChart(geoCoordMap1, ZNhospitals);
}

function update_yy2() {
    // 获取所有被选中的复选框
    var checkboxes = document.querySelectorAll('input[name="hospital"]:checked');
    var selectedHospital = [];

    // 获取所有选中的医院的值
    checkboxes.forEach(function (checkbox) {
        selectedHospital.push(checkbox.value);
    });

    if (selectedHospital.length == 0) {
        //myecharts.setOption(init_option,true);
        remove_jiaohu_info();
        return;
    }

    var selectedHospitals = selectedHospital.join(',');
    $.ajax({
        url: 'http://localhost:' + port_yy + '/ZhongNanHospitals',
        type: 'get',
        dataType: 'json',
        data: {//传进去的值
            selectedHospitals: selectedHospitals,
        }, // Pass the parameter here
        success: function (data) {//返回结果在data里 数据返回成功之后要干什么

            Promise.all([getHospitalLocationData1(), getZhongNanHospitalData1(data, "文章数量")])
                .then(function (results) {
                    var geoCoordMap1 = results[0];
                    //antiGeocode = results[0];

                    var ZNhospitals = results[1];
                    drawMapChart(geoCoordMap1, ZNhospitals);
                });
        }
    });
}

function drawMapChart(geoCoordMap, ZNhospitals) {
    var color = ['#3ed4ff', '#ffa022', '#a6c84c', '#ffcccc', '#ffd9b3', '#e6f7e0'];
    var series = [];
    ZNhospitals.forEach(function (item, i) {
        var fromCoord = geoCoordMap[item[0].name];
        var toCoord = geoCoordMap[item[1].name];
        var colorvalue = 0;

        switch (item[0].name) {
            case '华中科技大学同济医学院附属协和医院':
                colorvalue = 0;
                break;
            case '华中科技大学同济医学院附属同济医院':
                colorvalue = 1;
                break;
            case '武汉大学中南医院':
                colorvalue = 2;
                break;
            case '武汉大学人民医院':
                colorvalue = 3;
                break;
            case '武汉大学口腔医院':
                colorvalue = 4;
                break;
            case '湖北省中医院':
                colorvalue = 5;
                break;
            default:
                colorvalue = -1; // 如果没有匹配项，可以选择一个默认值或特殊标识
        }

        // 确保从坐标和到坐标都存在
        if (fromCoord && toCoord) {
            series.push({
                name: item[0].name + ' to ' + item[1].name + ': ' + item[1].value,
                value: item[1].value,
                type: 'lines',
                zlevel: 1,
                effect: {
                    show: true,
                    period: 6,
                    trailLength: 0.6,
                    color: '#fff',
                    //symbol: planePath,
                    symbolSize: item[1].value / 4  // 根据值调整符号大小
                },
                lineStyle: {
                    normal: {
                        color: color[colorvalue], // 确保颜色循环使用
                        width: item[1].value / 6, // 设置线的粗细
                        curveness: 0.2,
                        formatter: '{b}'
                    }
                },
                data: [[fromCoord, toCoord]] // 需要提供数据
            });

            series.push({
                name: item[0].name + ' to ' + item[1].name + ': ' + item[1].value,
                type: 'effectScatter',
                coordinateSystem: 'geo',
                zlevel: 2,
                rippleEffect: {
                    brushType: 'stroke'
                },
                label: {
                    normal: {
                        show: true,
                        position: 'right',
                        formatter: '{b}'
                    }
                },
                symbolSize: function (val) {
                    return val[2] / 2; // 根据值设置符号大小
                },
                itemStyle: {
                    normal: {
                        color: color[colorvalue], // 确保颜色循环使用
                    }
                },
                data: [toCoord.concat(item[1].value)]
            });
        }
    });

    var option_yy = {
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
                return params.seriesName + '<br/>' + params.name;
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
        },
        series: series
    };



    //var myecharts = echarts.init($('.map .geo')[0]);
    myecharts.clear(); // 清除上一次绘制的图表
    myecharts.setOption(option_yy, { notMerge: true });
}