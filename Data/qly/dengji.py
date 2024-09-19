import pandas as pd

def update_hospital_grades(file_a, file_b, output_file):
    """
    更新医院等级并将结果保存到新的 Excel 文件。

    参数:
    - file_a: 包含医院名称、经度和纬度的 Excel 文件路径
    - file_b: 包含医院名称和医院等级的 Excel 文件路径
    - output_file: 结果保存的 Excel 文件路径
    """
    # 加载 Excel 文件
    df_a = pd.read_excel(file_a)
    df_b = pd.read_excel(file_b)

    # 确保读取的字段在数据框中
    required_columns_a = ['医院名称', '经度', '纬度']
    required_columns_b = ['医院名称', '医院等级']

    for col in required_columns_a:
        if col not in df_a.columns:
            raise ValueError(f"Column '{col}' is missing in file a")
        
    for col in required_columns_b:
        if col not in df_b.columns:
            raise ValueError(f"Column '{col}' is missing in file b")

    # 新建“医院等级”字段
    df_a['医院等级'] = '无'
    df_a['缓冲区距离'] = 0

    # 创建一个医院名称到等级的映射
    hospital_grade_map = df_b.set_index('医院名称')['医院等级'].to_dict()
    # 定义等级到缓冲区距离的映射
    grade_buffer_map = {
        '三级甲等': 50000,
        '三级乙等': 30000,
        '二级甲等': 20000,
        '二级乙等': 15000,
        '一级甲等': 10000,
        '一级乙等': 5000,
        '无': 1000
    }


    # 遍历文件a的医院名称，并在文件b中查找等级
    for index, row in df_a.iterrows():
        hospital_name = row['医院名称']
        if hospital_name in hospital_grade_map:
            grade = hospital_grade_map[hospital_name]
            if pd.isna(grade):
                grade = '无'
            df_a.at[index, '医院等级'] = grade
            #df_a.at[index, '缓冲区距离'] = grade_buffer_map.get(grade, 0)
    for index,row in df_a.iterrows():
        grade = df_a.at[index, '医院等级']
        df_a.at[index, '缓冲区距离'] = grade_buffer_map.get(grade, 0)
    # 选择需要保存的列
    result_df = df_a[['医院名称', '经度', '纬度', '医院等级', '缓冲区距离']]

    # 将结果保存到新的Excel文件
    # result_df.to_excel(output_file, index=False)
    # 将结果保存到 CSV 文件
    result_df.to_csv(output_file, index=False, encoding='utf-8')

    print(f"Results saved to {output_file}")

# 示例用法
# update_hospital_grades('a.xlsx', 'b.xlsx', 'c.xlsx')

if __name__ == '__main__':
    update_hospital_grades(r'E:\Dasishang\GISshixi\github\456\GIS_ShiXi\Data\hct\医联体医院坐标表.xlsx', 
                           r'E:\Dasishang\GISshixi\github\456\GIS_ShiXi\Data\hct\医院信息.xlsx', 
                           r'E:\Dasishang\GISshixi\github\456\GIS_ShiXi\Data\qly\医联体医院_结算.csv')