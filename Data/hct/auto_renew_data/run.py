import subprocess
from concurrent.futures import ThreadPoolExecutor
from tqdm import tqdm
import time  # 用于模拟爬虫的执行时间

# 定义要运行的 Python 文件列表
python_files = ['D:\\学习资料\\大四\\Data\\医联体爬虫\\pachong_xiehe.py', 'D:\\学习资料\\大四\\Data\\医联体爬虫\\pachong_renmin.py',
                'D:\\学习资料\\大四\\Data\\医联体爬虫\\pachong_kouqiang.py','D:\\学习资料\\大四\\Data\\医联体爬虫\\tongji.py',
                'D:\\学习资料\\大四\\Data\\医联体爬虫\\zhongnan.py','D:\\学习资料\\大四\\Data\\医联体爬虫\\zhongyiyuan.py']

def run_script(file):
    print('正在运行{file}爬虫。')
    time.sleep(10)  # 假设每个爬虫执行需要 2 秒
    subprocess.run(['python', file])

# 使用 ThreadPoolExecutor 来并行运行文件
with ThreadPoolExecutor() as executor:
    # executor.map(run_script, python_files)
    list(tqdm(executor.map(run_script, python_files), total=len(python_files)))