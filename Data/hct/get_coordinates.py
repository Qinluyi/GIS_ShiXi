import pandas as pd
import requests

# 输入和输出文件路径
input_file = 'D:\\学习资料\\大四\\github\\GIS_ShiXi\\Data\\hct\\医联体医院名单.xlsx'
output_file = '医联体医院坐标表.xlsx'

def get_coordinates(address):
    """通过百度地图API获取地址的经纬度"""
    url = f'https://api.map.baidu.com/geocoding/v3/?address={address}&output=json&ak=R11qAoP6YUlt4sioD4loYizsDLB7HiPi'
    response = requests.get(url)
    data = response.json()

    if data['status'] == 0:
        lng = data['result']['location']['lng']
        lat = data['result']['location']['lat']
        return lng, lat
    else:
        return None, None

    # 读取Excel文件


df = pd.read_excel(input_file)

# 创建新的DataFrame存储结果
results = pd.DataFrame(columns=['医院名称', '经度', '纬度'])

# 遍历每个医院名称，获取经纬度
for index, row in df.iterrows():
    hospital_name = row['医院名称']
    lng, lat = get_coordinates(hospital_name)
    results = results.append({'医院名称': hospital_name, '经度': lng, '纬度': lat}, ignore_index=True)


#
# columns_to_add=['文章数量','合作','沟通','进修']
# results[columns_to_add]=df[columns_to_add]
# 将结果写入新的Excel文件
results.to_excel(output_file, index=False)