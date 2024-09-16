import subprocess
import os

def install_from_gz(gz_file_path):
    # 解压缩文件
    subprocess.run(['tar', '-xzf', gz_file_path], check=True)
    
    # 获取解压缩后的目录名
    dir_name = gz_file_path.split('.tar.gz')[0]
    
    # 切换到解压缩后的目录
    os.chdir(dir_name)
    
    # 执行安装
    subprocess.run(['python', 'setup.py', 'install'], check=True)

# 使用函数安装.gz文件
install_from_gz('C:/Users/85892/Desktop/spacy-3.8.0.tar.gz')
