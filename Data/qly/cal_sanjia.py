import pandas as pd

def count_third_level_hospitals(path_a, path_b, output_path):
    # 从路径a读取excel文件
    hospitals_df = pd.read_excel(path_a)
    # 获取“医联体”和“辐射范围”字段
    medical_groups = hospitals_df[['医联体', '辐射范围']]

    # 从路径b读取excel文件
    all_hospitals_df = pd.read_excel(path_b)

    # 创建一个列表来存储结果
    results = []

    # 遍历a文件中的医联体
    for _, row in medical_groups.iterrows():
        medical_group = row['医联体']
        radiation_range = row['辐射范围']
        
        # 查找b文件中“所属医联体”字段与医联体相等的所有行
        matched_hospitals = all_hospitals_df[all_hospitals_df['所属医联体'] == medical_group]

        # 计数三级甲等医院
        third_level_count = (matched_hospitals['医院等级'] == '三级甲等').sum()

        # 保存结果
        results.append({
            '医联体': medical_group,
            '辐射范围': radiation_range,
            '三甲医院数': third_level_count
        })

    # 将结果转换为DataFrame并保存为新的Excel文件
    results_df = pd.DataFrame(results)
    results_df.to_excel(output_path, index=False)

if __name__ == '__main__':
    # 示例调用
    path_a = r'E:\Dasishang\GISshixi\github\456\GIS_ShiXi\Data\qly\医联体辐射范围排行榜.xlsx'
    path_b = r'E:\Dasishang\GISshixi\github\456\GIS_ShiXi\Data\qly\医联体医院坐标表.xlsx'
    output_path = r'E:\Dasishang\GISshixi\github\456\GIS_ShiXi\Data\qly\医联体辐射范围排行榜v2.xlsx'
    count_third_level_hospitals(path_a, path_b, output_path)
