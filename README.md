# 区域医联体交互评价系统运行说明（本地运行）

## 数据库

1.hospitals_with_district.sql

2.YiLianTi.sql

## 路由

1.app_wft.js

2.app_qly.js

3.app_xsy.js

4.con_yy.js

这四个文件里的数据库连接请修改为自己的数据库配置，app_xsy和app_qly的端口最好不要改变

## 运行

分别开启4个终端运行“路由”部分列举的4个js文件即可：node xxx.js

## 数据更新

数据下载模块的更新请更改app_wft.js的run-python1路由里定义的python解释器路径和Data/hct/auto_renew_data的路径为自己的本地路径，然后便可一键更新。

如果有报错请查看是否是driver版本的问题，如果是请看driver文件夹下的readme.txt下载自己对应浏览器版本的driver