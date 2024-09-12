import pandas as pd
import json

# 读取 JSON 文件
with open('D:\\学习资料\\大四\\Data\\hospital_info.json', 'r', encoding='utf-8') as file:
    hospitals_data = json.load(file)

# 指定需要提取的字段
fields = ["医院名称", "医院地址", "联系电话", "医院等级", "重点科室", "经营方式", "传真号码", "电子邮箱", "医院网站"]

# 处理每个医院的数据，确保字段统一
processed_data = []
for hospital in hospitals_data:
    processed_hospital = {field: hospital.get(field, None) for field in fields}
    processed_data.append(processed_hospital)

# 将处理后的数据转换为 DataFrame  
df = pd.DataFrame(processed_data)

# 写入 Excel 文件
df.to_excel("医院信息.xlsx", index=False, encoding='utf-8')

