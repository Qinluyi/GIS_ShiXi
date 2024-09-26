import subprocess
from concurrent.futures import ThreadPoolExecutor
from tqdm import tqdm
import time  # 用于模拟爬虫的执行时间

# 定义要运行的 Python 文件列表
python_files = [r"pachong_xiehe.py", r"pachong_tongji.py",r"pachong_zhongnan.py",
                r"pachong_renmin.py",r"pachong_time_renmin.py",r"pachong_kouqiang.py",
                r"pachong_time_kouqiang.py",r"zhongyiyuan.py"]

def run_script(file):
    print('正在运行{file}爬虫。')
    time.sleep(10)  # 假设每个爬虫执行需要 2 秒
    subprocess.run(['python', file])
# 使用 ThreadPoolExecutor 来并行运行文件
with ThreadPoolExecutor() as executor:
    # executor.map(run_script, python_files)
    list(tqdm(executor.map(run_script, python_files), total=len(python_files)))