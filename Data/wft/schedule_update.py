import pandas as pd
import requests
from bs4 import BeautifulSoup
import psycopg2
import schedule
import time

# PostgreSQL数据库连接信息
db_config = {
    'dbname': 'medical_treatment_combination',  # 数据库名称
    'user': 'postgres',
    'password': '20030509',  # 数据库密码
    'host': 'localhost',  # 或者数据库所在的服务器IP
    'port': '5432'        # 默认端口为5432
}

# 读取 Excel 文件
file_path = "hospital_renmin.xlsx"
hospitals_df = pd.read_excel(file_path)

# 获取所有医院的名称列表
hospital_names = hospitals_df['医院名称'].tolist()

# 统计文章中关键词出现的次数
keywords = ['合作', '沟通', '进修']

def search_hospital_articles(hospital_name):
    search_url = f"https://www.rmhospital.com/search.html?sKey={hospital_name}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
    }
    response = requests.get(search_url, headers=headers)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        # 检查是否有“没有查到相关内容”的消息
        no_results = soup.find("div", class_="media-body")
        if no_results and "没有查到相关内容" in no_results.get_text():
            return []  # 没有找到文章，返回空列表

        # 提取所有搜索结果中的文章链接
        search_results = soup.find_all("div", class_="media-body")
        article_links = []
        for result in search_results:
            link = result.find("a")['href']
            full_link = f"https://www.rmhospital.com{link}"
            article_links.append(full_link)
        return article_links
    return []

# 访问文章并统计关键词出现的次数
def count_keywords_in_article(article_url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
    }
    response = requests.get(article_url, headers=headers)
    keyword_found = {keyword: False for keyword in keywords}
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        article_text = soup.get_text()
        # 检查每个关键词是否存在于文章中
        for keyword in keywords:
            if keyword in article_text:
                keyword_found[keyword] = True
    return keyword_found

# 将结果插入到PostgreSQL数据库
def save_to_database(data):
    conn = None
    try:
        conn = psycopg2.connect(**db_config)
        cur = conn.cursor()
        # 创建表格如果不存在，且添加唯一约束到hospital_name列
        cur.execute('''
            CREATE TABLE IF NOT EXISTS hospital_articles (
                hospital_name VARCHAR(255) UNIQUE,
                article_count INTEGER,
                cooperation INTEGER,
                communication INTEGER,
                further_study INTEGER
            )
        ''')

        # 插入数据
        for hospital, stats in data.items():
            cur.execute('''
                INSERT INTO hospital_articles (hospital_name, article_count, cooperation, communication, further_study)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT(hospital_name) DO UPDATE
                SET article_count = EXCLUDED.article_count,
                    cooperation = EXCLUDED.cooperation,
                    communication = EXCLUDED.communication,
                    further_study = EXCLUDED.further_study
            ''', (
                hospital,
                stats['文章数量'],
                stats['合作'],
                stats['沟通'],
                stats['进修']
            ))

        conn.commit()
        cur.close()
    except Exception as error:
        print(f"Error: {error}")
    finally:
        if conn is not None:
            conn.close()

# 主程序：统计每家医院的文章数量和关键词出现次数，并保存到数据库
def main_task():
    hospital_article_count = {}
    for hospital in hospital_names:
        article_links = search_hospital_articles(hospital)
        total_keywords_count = {keyword: 0 for keyword in keywords}
        for article_link in article_links:
            keyword_count = count_keywords_in_article(article_link)
            for keyword in keywords:
                total_keywords_count[keyword] += keyword_count[keyword]
        hospital_article_count[hospital] = {
            '文章数量': len(article_links),
            **total_keywords_count  # 将关键词统计结果加入字典
        }
        print(f"{hospital}: {len(article_links)} 篇文章, 关键词统计: {total_keywords_count}")

    # 将结果保存到数据库
    save_to_database(hospital_article_count)
    print("数据库更新完成！")

# 定时任务设置，例如每天××:××点更新一次
schedule.every().day.at("17:38").do(main_task)

# 启动定时任务调度
while True:
    schedule.run_pending()
    time.sleep(1)