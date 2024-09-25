import pandas as pd
import math
import numpy as np



guimo_dict = {
    '无': 30,
    '一级甲等': 70,
    '一级乙等': 100,
    '二级甲等': 130,
    '二级乙等': 160,
    '三级甲等': 190,
    '三级乙等': 210
}

def zuni(G, k, gama ,theta, distance, Pi,Pj):
    c = G / (k*Pi^gama*Pj^theta)
    if c == 0: return 10
    c = 1 / c
    a = distance 
    if a <= 0 or c <= 0:
        raise ValueError("a 和 c 必须大于 0")
    b = math.log(c) / math.log(a)
    return b



def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # 地球半径，单位为公里
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    
    a = (math.sin(dLat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dLon / 2) ** 2)
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def cal_zuni(excel_path,coordinate_path,hospital_name,save_result_path,save_result_path1,gama,theta,k):
    coordinates = {}
    dengji = {}
    # 初始化一个列表来保存数据
    data = []
    
    average_beta = dict()
    # 读取医院坐标数据
    coordinates_df = pd.read_excel(coordinate_path)
    # 假设坐标数据有 '医院名称', '纬度', '经度' 三列
    for _, row in coordinates_df.iterrows():
        coordinates[row['医院名称']] = (row['纬度'], row['经度'])
        dengji[row['医院名称']] = row['医院等级']
        
    for i in range(len(excel_path)):

        # 读取目标医院的经纬度
        if hospital_name[i] not in coordinates:
            print( f"{hospital_name[i]} 不在坐标文件中。")

        target_lat, target_lon = coordinates[hospital_name[i]]
        Pi = dengji[hospital_name[i]]
        Pi = guimo_dict[Pi]
        beta_list = []
        # 读取医院信息
        hospitals_df = pd.read_excel(excel_path[i])

        # 假设医院信息有 '医院名称' 列
        for _, row in hospitals_df.iterrows():
            if '医院名称' in row:
                current_hospital = row['医院名称']
            else:
                current_hospital = row['医院']
            dj = dengji[current_hospital]
            G = row['文章数量']
            Pj = guimo_dict[dj]
            current_lat, current_lon = coordinates[current_hospital]
            distance = haversine_distance(target_lat, target_lon, current_lat, current_lon)
            beta = zuni(G,k,gama,theta,distance,Pi,Pj)
            beta_list.append(beta)   
            # 将 current_hospital 和 beta 添加到数据列表
            data.append({'医院名称': current_hospital, '阻尼系数': beta})
            
        avg_beta = np.array(beta_list).mean()
        average_beta[hospital_name[i]] = avg_beta
        
    sorted_average_beta = dict(sorted(average_beta.items(), key=lambda item: item[1]))
    # 将字典转换为 DataFrame
    df = pd.DataFrame(sorted_average_beta.items(), columns=['医联体名称', '平均阻尼系数'])
    # 保存为 Excel 文件
    df.to_excel(save_result_path, index=False)
    # 创建 DataFrame
    beta_df = pd.DataFrame(data)
    # 保存为 Excel 文件
    beta_df.to_excel(save_result_path1, index=False)
        
        
        
    
    

if __name__ == '__main__':
    gama = 1
    theta = 1
    k = 100
    # G
    
    jiaohu_path_list = [
        r'E:\Dasishang\GISshixi\github\456\GIS_ShiXi\Data\xsy\同济医院\同济医院交互强度表.xlsx',
        r'E:\Dasishang\GISshixi\github\456\GIS_ShiXi\Data\xsy\武汉大学口腔医院\武汉大学口腔医院交互强度表.xlsx',
        r'E:\Dasishang\GISshixi\github\456\GIS_ShiXi\Data\xsy\武汉大学人民医院\武汉大学人民医院交互强度表.xlsx',
        r'E:\Dasishang\GISshixi\github\456\GIS_ShiXi\Data\xsy\武汉大学中南医院\武汉大学中南医院交互强度表.xlsx',
        r'E:\Dasishang\GISshixi\github\456\GIS_ShiXi\Data\xsy\协和医院\协和医院交互强度表.xlsx',
        r'E:\Dasishang\GISshixi\github\456\GIS_ShiXi\Data\qly\湖北省中医院\湖北省中医院交互强度表.xlsx'
    ]
    hospital_names = [
        "华中科技大学同济医学院附属同济医院",
        "武汉大学口腔医院",
        "武汉大学人民医院",
        "武汉大学中南医院",
        "华中科技大学同济医学院附属协和医院",
        "湖北省中医院"
    ]
    save_result_path = r'E:\Dasishang\GISshixi\github\456\GIS_ShiXi\Data\qly\阻尼系数.xlsx'
    save_result_path1 = r'E:\Dasishang\GISshixi\github\456\GIS_ShiXi\Data\qly\所有医联体医院阻尼系数.xlsx'
    # P d 
    coordinate_path = r'E:\Dasishang\GISshixi\github\456\GIS_ShiXi\Data\qly\医联体医院坐标表.xlsx'
    cal_zuni(jiaohu_path_list,coordinate_path,hospital_names,save_result_path,save_result_path1,gama,theta,k)