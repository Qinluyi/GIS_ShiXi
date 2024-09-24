//port
var port = '5501';

// 存储经纬度和医院等级的数据
var mygeoCoordMap = {};
var map_data = [];

//map1
var planePath = 'path://M.6,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705';
function getHospitalLocationData1() {
    return new Promise(function (resolve, reject) {
        $.getJSON('http://localhost:'+port+'/HospitalsLocation', function (hospitalData) {
            var geoCoordMap = {};
            antiGeocode = {};
            hospitalData.forEach(function (hospital) {
                var name = hospital.医院名称;
                var longitude = hospital.经度;
                var latitude = hospital.纬度;
                var province = hospital.所在省;
                var city = hospital.所在市;
                var qu = hospital.所在区县;
                geoCoordMap[name] = [longitude, latitude];
                antiGeocode[longitude + '_' + latitude] = [province, city, qu];

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
                } else if(type == "合作"){
                    value += hospitalJH.合作;
                }else if(type == "沟通"){
                    value += hospitalJH.沟通;
                }else if(type == "技术"){
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


//map1
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

    var option = {
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
                return params.seriesName + '<br/>' + params.name ;
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

    var myecharts = echarts.init($('.map .geo')[0]);
    myecharts.clear(); // 清除上一次绘制的图表
    myecharts.setOption(option);
}

var current_area = "china";
var area_last = "china"
var current_level = "country"
//中国地图 map2
var myChart = echarts.init($('.map .geo')[1])

var colors = ['#142957', '#6699FF', '#aaeeff'];
var addressArray = [];//地址名称
var coords = [];//存储有需要展示的医院的经纬度

var antiGeocode = {};

//点击切换辐射和交互
$(document).ready(function () {
    // 默认状态设置
    var defaultMap = "map1"; // 设置默认显示的地图 ID

    // 设置默认的active类和显示的地图
    $(".navbar span[data-map='" + defaultMap + "']").addClass("active");
    $(".mapmain .map").hide();
    $("#" + defaultMap).fadeIn();

    // 为每个span绑定点击事件
    $(".navbar span").click(function () {
        var mapID = $(this).data("map");
        $(".navbar span").removeClass("active");
        $(".mapmain .map").hide();
        $(this).addClass("active");
        $("#" + mapID).fadeIn();
    });
});


//map2
function drawMap(area, myChart) {

    var address = '/website/data/' + area + '.json';

    // 加载 GeoJSON 数据
    $.getJSON(address, function (geoJson) {

        // 注册地图
        echarts.registerMap('China', geoJson);

        // 设置地图的中心坐标

        // 调用 getAddressInfo 函数获取地址信息
        getAddressInfo().then(function (addressArray) {
            // 配置地图选项
            var option = {
                series: [{
                    name: '中国地图',
                    type: 'map',
                    map: 'China',
                    //center:mapCenter,
                    label: {
                        show: true
                    },
                    itemStyle: {
                        normal: {
                            areaColor: '#142957',
                            borderColor: '#0692a4'
                        },
                        emphasis: {
                            areaColor: '#0b1c2d'
                        }
                    },
                    data: geoJson.features.map(function (feature) {
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
                    }),
                }]
            };

            // 设置地图选项
            myChart.clear(); // 清除上一次绘制的图表
            myChart.setOption(option);
            // setTimeout(function () {
            //     var geoWidth = $(".map").width();
            //     var geoHeight = $(".map").height();

            //     myChart.resize({
            //         width: geoWidth,
            //         height: geoHeight
            //     });
            // }, 0);
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
        coords.forEach(function (element) {
            var co = element[0] + '_' + element[1];
            var promise = new Promise(function (resolve, reject) {
                var temp = antiGeocode[co];
                if (current_level == 'country') {
                    tempAddressArray.push(temp[0].substring(0, 2));
                } else if (current_level == 'province') {
                    tempAddressArray.push(temp[1]);
                } else if (current_level == 'city') {
                    tempAddressArray.push(temp[2]);
                }
                resolve();
            });
            promises.push(promise);
        });

        Promise.all(promises).then(function () {
            resolve(tempAddressArray);
        }).catch(function (error) {
            reject(error);
        });
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
    drawMap(area, myChart);
    // addressArray = [];
}


var selectedHospitals2 = "文章数量";
var selectedHospitals = "武汉大学人民医院";

// 筛选
var values = []; // 存储选择的内容
var opts = []; // 存储option标签
var selectHospital = document.getElementById("multipleSelect");
for (var i = 0; i < selectHospital.length; i++) {
    opts.push(selectHospital.item(i));
}
// 创建一个隐藏起来的option
var optionHide = document.createElement('option');
optionHide.hidden = true;
selectHospital.appendChild(optionHide);

selectHospital.addEventListener('input', function () {
    var value = this.options[this.selectedIndex].value; // 获取当前选择的值
    this.options[this.selectedIndex].style = "background: pink"; // 选中的option背景为粉色
    var index = values.indexOf(value); // 判断是否被选择，返回-1说明没选择，否则已被选择
    if (index > -1) { // 若已选择，就删除该选择，并且将option的背景恢复为未被选择的状态
        values.splice(index, 1);
        opts.filter(function (opt) {
            if (opt.value === value) {
                opt.style = "";
            }
        });
    } else { // 没选择就将该值push到values中
        values.push(value);
    }
    this.options[this.length - 1].text = values.toString(); // 将values数组中的数据转化成字符串的格式赋给隐藏的option

    if (values.length > 0) { // 将隐藏的option的selected属性设置为true，这样select.value获取的值就是多选选中的值
        this.options[this.length - 1].selected = true;
    } else {
        this.options[0].selected = true;
    }
    console.log(selectHospital.value);
    selectedHospitals = selectHospital.value;
    console.log(typeof selectedHospitals);
    $.ajax({
        url: 'http://localhost:'+port+'/ZhongNanHospitals',
        type: 'get',
        dataType: 'json',
        data: {//传进去的值
            selectedHospitals: selectedHospitals,
        }, // Pass the parameter here
        success: function (data) {//返回结果在data里 数据返回成功之后要干什么

            Promise.all([getHospitalLocationData1(), getZhongNanHospitalData1(data, selectedHospitals2)])
                .then(function (results) {
                    var geoCoordMap1 = results[0];
                    //antiGeocode = results[0];

                    var ZNhospitals = results[1];
                    drawMapChart(geoCoordMap1, ZNhospitals);



                    //var coords = results[0];
                    var ZNhospitals = results[1];
                    ZNhospitals.forEach(function (item) {
                        coords.push(geoCoordMap1[item[1].name]);
                    });

                    $(document).ready(function () {
                        // 初始化地图
                        //var myChart = echarts.init(document.getElementById('map2'))
                        myChart.on('click', function (params) {
                            if (params.componentType === 'series') {
                                // 判断事件来源是否为地图系列
                                var clickedRegion = params.data.country_id; // 获取点击的地区名称

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
                                drawMap(area, myChart);
                                // addressArray = [];
                            }
                        });
                        // 绘制地图
                        var area = current_level + '/' + current_area;
                        getAddressInfo();
                        drawMap(area, myChart);
                        addressArray = [];
                    });

                })
                .catch(function (error) {
                    console.error('获取数据失败：', error);
                });
        }
    });
});




var values2 = []; // 存储选择的内容
var opts2 = []; // 存储option标签
var selectHospital2 = document.getElementById("multipleSelect2");
for (var i = 0; i < selectHospital2.length; i++) {
    opts2.push(selectHospital2.item(i));
}
// 创建一个隐藏起来的option
var optionHide2 = document.createElement('option');
optionHide2.hidden = true;
selectHospital2.appendChild(optionHide2);

selectHospital2.addEventListener('input', function () {
    var value = this.options[this.selectedIndex].value; // 获取当前选择的值
    this.options[this.selectedIndex].style = "background: pink"; // 选中的option背景为粉色
    var index = values2.indexOf(value); // 判断是否被选择，返回-1说明没选择，否则已被选择
    if (index > -1) { // 若已选择，就删除该选择，并且将option的背景恢复为未被选择的状态
        values2.splice(index, 1);
        opts2.filter(function (opt) {
            if (opt.value === value) {
                opt.style = "";
            }
        });
    } else { // 没选择就将该值push到values中
        values2.push(value);
    }
    this.options[this.length - 1].text = values2.toString(); // 将values数组中的数据转化成字符串的格式赋给隐藏的option

    if (values2.length > 0) { // 将隐藏的option的selected属性设置为true，这样select.value获取的值就是多选选中的值
        this.options[this.length - 1].selected = true;
    } else {
        this.options[0].selected = true;
    }
    console.log(selectHospital2.value);
    selectedHospitals2 = selectHospital2.value;
    console.log(typeof selectedHospitals2);

    $.ajax({
        url: 'http://localhost:'+port+'/ZhongNanHospitals',
        type: 'get',
        dataType: 'json',
        data: {//传进去的值
            selectedHospitals: selectedHospitals,
        }, // Pass the parameter here
        success: function (data) {//返回结果在data里 数据返回成功之后要干什么
            Promise.all([getHospitalLocationData1(), getZhongNanHospitalData1(data, selectedHospitals2)])
                .then(function (results) {
                    var geoCoordMap1 = results[0];
                    //antiGeocode = results[0];

                    var ZNhospitals = results[1];
                    drawMapChart(geoCoordMap1, ZNhospitals);



                    //var coords = results[0];
                    var ZNhospitals = results[1];
                    ZNhospitals.forEach(function (item) {
                        coords.push(geoCoordMap1[item[1].name]);
                    });

                    $(document).ready(function () {
                        // 初始化地图
                        //var myChart = echarts.init(document.getElementById('map2'))
                        myChart.on('click', function (params) {
                            if (params.componentType === 'series') {
                                // 判断事件来源是否为地图系列
                                var clickedRegion = params.data.country_id; // 获取点击的地区名称

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
                                drawMap(area, myChart);
                                // addressArray = [];
                            }
                        });
                        // 绘制地图
                        var area = current_level + '/' + current_area;
                        getAddressInfo();
                        drawMap(area, myChart);
                        addressArray = [];
                    });

                })
                .catch(function (error) {
                    console.error('获取数据失败：', error);
                });
        }
    });
});
// });

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