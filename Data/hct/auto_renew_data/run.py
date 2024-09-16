import subprocess
from concurrent.futures import ThreadPoolExecutor
from tqdm import tqdm
import time  # 用于模拟爬虫的执行时间

# 定义要运行的 Python 文件列表
python_files = [r"Data\xsy\协和医院\pachong_xiehe.py", r"Data\xsy\同济医院\pachong_tongji.py",r"Data\xsy\武汉大学中南医院\pachong_zhongnan.py",
                r"Data\xsy\武汉大学人民医院\pachong_renmin.py",r"Data\xsy\武汉大学人民医院\pachong_time_renmin.py",r"Data\xsy\武汉大学口腔医院\pachong_kouqiang.py",
                r"Data\xsy\武汉大学口腔医院\pachong_time_kouqiang.py",r"Data\qly\湖北省中医院\zhongyiyuan.py"]

def run_script(file):
    print('正在运行{file}爬虫。')
    time.sleep(10)  # 假设每个爬虫执行需要 2 秒
    subprocess.run(['python', file])

# 使用 ThreadPoolExecutor 来并行运行文件
with ThreadPoolExecutor() as executor:
    # executor.map(run_script, python_files)
    list(tqdm(executor.map(run_script, python_files), total=len(python_files)))