import requests
from bs4 import BeautifulSoup
import pandas as pd
import base64
import urllib.parse
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import requests
import psycopg2
import os
# import schedule
import time

# Function to encode the hospital name in Base64
def encode_base64(text):
    return base64.b64encode(text.encode('utf-8')).decode('utf-8')

def search_keywords_in_urls(articles_info, keywords):
    # 初始化关键词统计
    keyword_count = {keyword: 0 for keyword in keywords}
    urls_with_keywords = {keyword: set() for keyword in keywords}
    keyword_occurrences = {keyword: 0 for keyword in keywords}  # 记录每个关键词的出现次数

    print('当前工作目录是:',os.getcwd())
    chrome_driver_path = r'..\..\datadriver\chromedriver.exe'
    # 检查文件是否存在
    if not os.path.isfile(chrome_driver_path):
        print(f"File does not exist: {chrome_driver_path}. Please check the path.")
        return
    
    try:
        chrome_service = Service(chrome_driver_path)
    except Exception as e:
        print(f"Error occurred: {e}. Switching to backup path.")
        chrome_service = Service(chrome_driver_path)
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--ignore-certificate-errors")
    chrome_options.add_argument("--incognito")

    driver = webdriver.Chrome(service=chrome_service, options=chrome_options)

    for article_info in articles_info:
        url = article_info['url']
        if url.startswith('info'):
            url = 'https://www.whuh.com/' + url

        if not url.startswith(('http://', 'https://')):
            url = 'http://' + url  # 默认添加 http:// 前缀
            
        if url.startswith('http://../'):
        # 替换 'http://../' 为 'https://www.whuh.com/'
           url=url.replace('http://../', 'https://www.whuh.com/')
           article_info['url']=url

        print(f"正在处理 URL: {url}")

        try:
            driver.get(url)

            # 等待页面加载
            WebDriverWait(driver, 20).until(
                lambda d: d.execute_script('return document.readyState') == 'complete'
            )

            # 进一步等待动态内容加载完成
            try:
                WebDriverWait(driver, 20).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "v_news_content"))
                )
            except TimeoutException:
                print(f"警告：{url} 页面未能在规定时间内加载完成。")
                continue

            # 获取页面内容
            page_source = driver.page_source

            # 处理动态内容
            if 'v_news_content' not in page_source:
                print(f"警告：{url} 页面中未找到 <div class='v_news_content'> 元素。")
                continue

            # 解析页面内容
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(page_source, 'html.parser')
            content_elements = soup.select("div.v_news_content p.vsbcontent_start, div.v_news_content p:not(.vsbcontent_img)")
            
            if not content_elements:
                print(f"警告：{url} 中未找到内容元素。")
                continue

            article_text = " ".join(element.get_text(strip=True) for element in content_elements)

            if not article_text.strip():
                print(f"警告：未能从 {url} 提取到任何文本内容。")
                continue

            # 关键词统计
            for keyword in keywords:
                keyword_lower = keyword.lower()
                occurrences = article_text.lower().count(keyword_lower)

                if occurrences > 0:
                    keyword_count[keyword] += 1
                    urls_with_keywords[keyword].add(url)
                    keyword_occurrences[keyword] += occurrences

                    # 更新当前文章的关键词信息
                    article_info['keywords'][keyword] = True

        except Exception as e:
            print(f"处理 {url} 时出错: {e}")

    driver.quit()

    # 返回关键词统计结果
    print("关键词统计结果：", keyword_count)
    return keyword_count, urls_with_keywords, articles_info

# Step 1: 读取 Excel 文件，获取医院名称
df = pd.read_excel(r"hospital_xiehe.xlsx")
hospital_names = df['医院名称'].tolist()

# Step 2: 定义爬虫函数
def search_hospital_articles(hospital_name):
    keywords = ["合作", "协作","沟通","交流","研讨","进修","坐诊"]
    base64_name = encode_base64(hospital_name)
    search_url = f"https://www.whuh.com/searchlist.jsp?wbtreeid=1013&searchScope=0&newskeycode2={base64_name}&currentnum="

    articles_count = 0
    cooperation_count = 0
    communication_count = 0
    technique_count = 0
    articles_info = []

    page = 1
    while True:
        url = search_url + str(page)
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        

        # Step 3: 解析文章列表 (Targeting ul elements with specific class)
        articles_section = soup.find('ul', class_='ul-newsl1 wow fadeInUp')  # Find the specific section
        if articles_section:
            lielements = articles_section.find_all('li')  # Find li elements within that section
        else:
            lielements = []  # Handle case where the section is not found
        if not lielements:
            break

        for lielement in lielements:
            articles_count += 1
            article_url_element = lielement.find("a")  # Corrected method
            article_url = article_url_element['href']  # Get the 'href' attribute direct 
            # 找到包含日期的 "txt-l" div
            txt_l = lielement.find("div", class_="txt-l")
            
            if txt_l:
                # 从包含日的 div 中提取日期
                day = txt_l.find("div", class_="d").get_text(strip=True)
                # 从包含年月的 div 中提取年月
                year_month = txt_l.find("div", class_="y").get_text(strip=True)
                
                # 将年月日组合成“年-月-日”格式
                full_date = f"{year_month}-{day}"
            # Append article information
            articles_info.append({
                'url': 'https://www.whuh.com/' + article_url if article_url.startswith('info') else article_url,
                'date': full_date,
                'keywords': {keyword: False for keyword in keywords}
            })

            
            # # 统计关键词出现的文章数量
            # if '合作' in article_text:
            #     cooperation_count += 1
            # if '沟通' in article_text:
            #     communication_count += 1
            # if '进修' in article_text:
            #     training_count += 1

        # Step 4: 处理翻页 (Targeting pagination elements)
        pagination_section = soup.find('div', class_='pages wow fadeInUp')
        next_page = pagination_section.find('a', text='下页') if pagination_section else None
        if not next_page:
            break
        page += 1
        
    keywords = ["合作", "协作","沟通","交流","研讨","进修","坐诊"]
    keyword_counts, urls_with_keywords,article_info_new = search_keywords_in_urls(articles_info, keywords)
    
    results_detail = []
    results_count = []
    for info in article_info_new:
        # Initialize a list to hold interaction types
        interaction_types = []

        # Determine the interaction types based on keywords
        if info['keywords'].get("合作", False) or info['keywords'].get("协作", False):
            interaction_types.append("合作")
            cooperation_count += 1
        if info['keywords'].get("沟通", False) or info['keywords'].get("交流", False):
            interaction_types.append("沟通")
            communication_count += 1
        if info['keywords'].get("研讨", False) or info['keywords'].get("坐诊", False) or info['keywords'].get("进修", False):
            interaction_types.append("技术")
            technique_count += 1
            
        # Append a record for each interaction type
        for interaction_type in interaction_types:
            results_detail.append({
                "医院名称": hospital_name,
                "交互类型": interaction_type,
                "时间": info.get('date', '未知'),
                "链接": info.get('url', '未知')
            })

    results_count.append({
        "医院名称": hospital_name,
        "文章数量": articles_count,
        "合作": cooperation_count,
        "沟通": communication_count,
        "技术": technique_count
    })
    
    
    return results_detail,results_count


# Step 5: 爬取所有医院的文章并统计
results_detail = []
results_count = []
for hospital_name in hospital_names:
    result_detail, result_count = search_hospital_articles(hospital_name)
    results_detail.extend(result_detail)
    results_count.extend(result_count)

# Step 6: 输出结果
if results_detail:
    results_detail_df = pd.DataFrame(results_detail)
else:
    results_detail_df = pd.DataFrame(columns=["医院名称", "交互类型", "时间", "链接"])
if results_count:
    results_count_df = pd.DataFrame(results_count)
else:
    results_count_df = pd.DataFrame(columns=["医院名称", "文章数量", "合作", "沟通", "技术"])

results_detail_df.to_excel(r"协和医院交互明细.xlsx", index=False)
results_count_df.to_excel(r"协和医院交互强度表.xlsx", index=False)

print("统计结果已保存至 hospital_xiehe_article_detail.xlsx 和 hospital_article_count_xiehe.xlsx")

# Step 7：自动信息入库

# PostgreSQL数据库连接信息
def connect_db():  
    try:  
        conn = psycopg2.connect(  
            dbname='ylt',  
            user='postgres',  
            password='20030509',  
            host='localhost',  
            port='5432'  
        )  
        return conn  
    except Exception as e:  
        print(f"数据库连接错误: {e}")  
        return None  
    
# 定义两个函数分别用于更新交互明细与交互强度表
def update_interaction_detail(conn, data):  
    with conn.cursor() as cursor:  
        cursor.execute("DELETE FROM \"协和医院交互明细\";")
        for record in data:  
            cursor.execute("""  
                INSERT INTO "协和医院交互明细" (医院名称, 交互类型, 时间, 链接)   
                VALUES (%s, %s, %s, %s)  
            """, (record['医院名称'], record['交互类型'], record['时间'], record['链接']))  
        
        conn.commit()  

def update_interaction_count(conn, data):  
    with conn.cursor() as cursor:  
        cursor.execute("DELETE FROM \"协和医院交互强度表\";")
        for record in data:  
            cursor.execute("""  
                INSERT INTO "协和医院交互强度表" (医院名称, 文章数量, 合作, 沟通, 技术)   
                VALUES (%s, %s, %s, %s, %s)  
            """, (record['医院名称'], record['文章数量'], record['合作'], record['沟通'], record['技术']))  
        conn.commit()


#更新数据库
conn=connect_db()
if conn:
    update_interaction_count(conn,result_count)
    update_interaction_detail(conn,result_detail)
    conn.close()

print("协和医院数据已成功更新到数据库中。")