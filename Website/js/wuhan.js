$(function () {
    var hospitalData = [];
    map();
    function map() {
        var myChart = echarts.init(document.getElementById('map_1'));

        function showProvince() {
            var geoCoordMap = {
                '武汉大学中南医院': [114.359743, 30.560207],
                '武汉大学人民医院': [114.2916252, 30.48001008],
                '武汉大学口腔医院': [114.1712836, 30.51229195],
                '华中科技大学同济医学院附属协和医院': [114.281196, 30.590103],
            };

            var data = [
                { name: '武汉大学中南医院', value: 100 },
                { name: '武汉大学人民医院', value: 100 },
                { name: '武汉大学口腔医院', value: 100 },
                { name: '华中科技大学同济医学院附属协和医院', value: 100 },
            ];

            var max = 480, min = 9;
            var maxSize4Pin = 100, minSize4Pin = 20;

            var convertData = function (data) {
                var res = [];
                for (var i = 0; i < data.length; i++) {
                    var geoCoord = geoCoordMap[data[i].name];
                    if (geoCoord) {
                        res.push({
                            name: data[i].name,
                            value: geoCoord.concat(data[i].value)
                        });
                    }
                }
                return res;
            };

            myChart.setOption(option = {
                legend: {
                    orient: 'vertical',
                    y: 'bottom',
                    x: 'right',
                    data: ['pm2.5'],
                    textStyle: {
                        color: '#fff'
                    }
                },
                visualMap: {
                    show: false,
                    min: 0,
                    max: 500,
                    left: 'left',
                    top: 'bottom',
                    text: ['高', '低'],
                    calculable: true,
                    seriesIndex: [1],
                    inRange: {}
                },
                geo: {
                    show: true,
                    map: 'wuhan',
                    mapType: 'wuhan',
                    zoom: 2,
                    label: {
                        emphasis: {
                            textStyle: {
                                color: '#fff'
                            }
                        }
                    },
                    roam: true,
                    itemStyle: {
                        normal: {
                            borderColor: 'rgba(147, 235, 248, 1)',
                            borderWidth: 1,
                            areaColor: {
                                type: 'radial',
                                x: 0.5,
                                y: 0.5,
                                r: 0.8,
                                colorStops: [
                                    // { offset: 0, color: 'rgba(175,238,238, 0)' },
                                    // { offset: 1, color: 'rgba(47,79,79, .1)' }
                                    { offset: 0, color: 'rgba(34, 45, 67, 0)' }, // 调整区域颜色
                                    { offset: 1, color: 'rgba(47, 79, 79, .5)' }
                                ],
                                globalCoord: false
                            },
                            shadowColor: 'rgba(128, 217, 248, 1)',
                            shadowOffsetX: -2,
                            shadowOffsetY: 2,
                            shadowBlur: 10
                        },
                        emphasis: {
                            areaColor: '#389BB7',
                            borderWidth: 0
                        }
                    }
                },
                series: [
                    {
                        name: 'light',
                        type: 'map',
                        coordinateSystem: 'geo',
                        data: convertData(data),
                        itemStyle: {
                            normal: {
                                color: '#F4E925'
                            }
                        }
                    },
                    {
                        name: '点',
                        type: 'scatter',
                        coordinateSystem: 'geo',
                        symbol: 'pin',
                        symbolSize: function (val) {
                            var a = (maxSize4Pin - minSize4Pin) / (max - min);
                            var b = minSize4Pin - a * min;
                            b = maxSize4Pin - a * max;
                            return a * val[2] + b;
                        },
                        itemStyle: {
                            normal: {
                                color: '#F62157',
                            }
                        },
                        zlevel: 6,
                        data: convertData(data),
                    },
                    {
                        name: ' ',
                        type: 'effectScatter',
                        coordinateSystem: 'geo',
                        data: [
                            {
                                name: '武汉大学中南医院',
                                value: geoCoordMap['武汉大学中南医院'].concat([100]),
                                label: {
                                    normal: {
                                        position: 'right',
                                        offset: [5, 0]
                                    }
                                }
                            },
                            {
                                name: '武汉大学人民医院',
                                value: geoCoordMap['武汉大学人民医院'].concat([100]),
                                label: {
                                    normal: {
                                        position: 'right',
                                        offset: [5, 0]
                                    }
                                }
                            },
                            {
                                name: '武汉大学口腔医院',
                                value: geoCoordMap['武汉大学口腔医院'].concat([100]),
                                label: {
                                    normal: {
                                        position: 'left',
                                        offset: [-5, 0]
                                    }
                                }
                            },
                            {
                                name: '华中科技大学同济医学院附属协和医院',
                                value: geoCoordMap['华中科技大学同济医学院附属协和医院'].concat([100]),
                                label: {
                                    normal: {
                                        position: 'top',
                                        offset: [0, -20]
                                    }
                                }
                            }
                        ],
                        symbolSize: function (val) {
                            return val[2] / 10;
                        },
                        showEffectOn: 'render',
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        hoverAnimation: true,
                        label: {
                            normal: {
                                formatter: '{b}',
                                position: 'left',
                                show: true,
                                offset: [-10, 0],
                                textStyle: {
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                    color: 'white'
                                }
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: '#05C3F9',
                                shadowBlur: 10,
                                shadowColor: '#05C3F9'
                            }
                        },
                        zlevel: 1
                    },
                ]
            });

            // 加载并处理JSON数据
            $.getJSON('http://localhost:3000/hospitals_c', function (hospitalDataFromServer) {
                hospitalData = hospitalDataFromServer;
                // var promises = hospitalData.map(function (hospital) {
                //     return new Promise(function (resolve) {
                //         getCoordinates(hospital.医院地址, function (coords) {
                //             if (coords) {
                //                 resolve({
                //                     name: hospital.医院名称,
                //                     value: coords.concat([100])
                //                 });
                //             } else {
                //                 console.error('无法获取坐标，跳过医院:', hospital.医院名称);
                //                 resolve(null);
                //             }
                //         });
                //     });
                // });
                var hospitalCoordinates = hospitalData.map(function (hospital) {
                    if (hospital.经度 && hospital.纬度) {
                        return {
                            name: hospital.医院名称,
                            value: [hospital.经度, hospital.纬度, 100] // 经纬度和权重
                        };
                    } else {
                        console.error('缺少经纬度数据，跳过医院:', hospital.医院名称);
                        return null;
                    }
                });

                // Promise.all(promises).then(function (hospitalCoordinates) {
                    // 过滤掉null值
                    hospitalCoordinates = hospitalCoordinates.filter(function (coord) {
                        return coord !== null;
                    });

                    myChart.setOption({
                        series: [
                            {
                                name: '新医院',
                                type: 'scatter',
                                coordinateSystem: 'geo',
                                symbol: 'diamond',
                                data: hospitalCoordinates,
                                symbolSize: 10,
                                itemStyle: {
                                    normal: {
                                        color: '#FF0000'
                                    }
                                },
                                label: {
                                    show: false // 默认不显示标签
                                },
                                emphasis: {
                                    label: {
                                        show: true, // 鼠标悬停时显示标签
                                        formatter: '{b}', // 显示医院名称
                                        position: 'right', // 标签显示在点的右侧
                                        textStyle: {
                                            color: '#fff',
                                            fontSize: 12
                                        }
                                    }
                                }
                            }
                        ]
                    });


                ;
            });

            myChart.on('click', function (params) {
                var hospitalName = params.name;
                switch (hospitalName) {
                    case '武汉大学中南医院':
                        window.location.href = 'https://www.znhospital.com';
                        break;
                    case '武汉大学人民医院':
                        window.location.href = 'https://www.whrmyy.com';
                        break;
                    case '武汉大学口腔医院':
                        window.location.href = 'https://www.whdxkqyy.com';
                        break;
                }

                var info = hospitalData.find(hospital => hospital.医院名称 === hospitalName);

                if (info) {
                    var infoContent = `
                <div style="padding=2px">
                    <h3 style="color: white; font-size: 18px; font-weight: bold;margin-bottom: 8px;">${info.医院名称}</h3>
                    <p><strong style="color: white;margin-bottom: 6px">医院地址:</strong> <span style="color: white;">${info.医院地址 || 'N/A'}</span></p>
                    <p><strong style="color: white;margin-bottom: 6px">联系电话:</strong> <span style="color: white;">${info.联系电话 || 'N/A'}</span></p>
                    <p><strong style="color: white;margin-bottom: 6px">医院等级:</strong> <span style="color: white;">${info.医院等级 || 'N/A'}</span></p>
                    <p><strong style="color: white;margin-bottom: 6px">重点科室:</strong> <span style="color: white;">${info.重点科室 || 'N/A'}</span></p>
                    <p><strong style="color: white;margin-bottom: 6px">经营方式:</strong> <span style="color: white;">${info.经营方式 || 'N/A'}</span></p>
                    <p><strong style="color: white;margin-bottom: 6px">传真号码:</strong> <span style="color: white;">${info.传真号码 || 'N/A'}</span></p>
                    <p><strong style="color: white;margin-bottom: 6px">电子邮箱:</strong> <span style="color: white;">${info.电子邮箱 || 'N/A'}</span></p>
                    <p><strong style="color: white;margin-bottom: 6px">医院网站:</strong> <a href="${info.医院网站}" target="_blank">${info.医院网站}</a></p>
                </div>`;

                    // 假设你有一个元素用于显示这些信息
                    document.getElementById('hospitalInfo').innerHTML = infoContent;
                }
            });
        }

        showProvince();

        window.addEventListener("resize", function () {
            myChart.resize();
        });
    }
    // 定义getCoordinates函数，使用百度地图API进行地址转换
    function getCoordinates(address, callback) {
        var apiKey = 'EreKpUz1LmAv8BAEPzw4BQNuTDrnpGlW';  // 请替换为你自己的API密钥
        var geocodeURL = 'https://api.map.baidu.com/geocoding/v3/';

        $.ajax({
            url: geocodeURL,
            type: 'GET',
            dataType: 'jsonp',
            data: {
                address: address,
                output: 'json',
                ak: apiKey
            },
            success: function (response) {
                if (response.status === 0) {
                    var coords = [response.result.location.lng, response.result.location.lat];
                    callback(coords);
                } else {
                    callback(null);
                }
            },
            error: function (error) {
                callback(null);
            }
        });
    }


});
