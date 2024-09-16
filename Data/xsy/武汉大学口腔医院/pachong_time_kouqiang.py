# https://www.znhospital.cn/searchs/keywords/中南医院
# 时间的获取位置在搜索结果里面，这个要改

import requests
from bs4 import BeautifulSoup
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import pandas as pd
from webdriver_manager.chrome import ChromeDriverManager



def search_keywords_in_urls(articles_info, url_list, keywords, driver):
    # 初始化关键词统计
    keyword_count = {keyword: 0 for keyword in keywords}
    urls_with_keywords = {keyword: set() for keyword in keywords}
    keyword_occurrences = {keyword: 0 for keyword in keywords}  # 记录每个关键词的出现次数

    try:
        for article_info in articles_info:
            # 访问文章的 URL
            url = article_info['url']
            driver.get(url)
            
            # 提取文章内容
            article_elements = driver.find_elements(By.CLASS_NAME, "content")
            if article_elements:
                for article in article_elements:
                    text = article.text.lower()

                    # 遍历关键词并统计
                    for keyword in keywords:
                        keyword_lower = keyword.lower()
                        occurrences = text.count(keyword_lower)
                        
                        # 如果文章中包含关键词，更新关键词统计和文章信息
                        if occurrences > 0:
                            keyword_count[keyword] += 1  # 关键词出现在多少页面中
                            urls_with_keywords[keyword].add(url)
                            keyword_occurrences[keyword] += occurrences  # 记录关键词的总出现次数
                            
                            # 更新当前文章的关键词信息
                            article_info['keywords'][keyword] = True

            # 若找不到内容则跳过
            else:
                continue

    except Exception as e:
        print(f"发生错误: {e}")

    # 返回关键词统计结果
    return keyword_count, urls_with_keywords, articles_info

def clean_date(date):
    # Remove square brackets from the date string
    if date.startswith('[') and date.endswith(']'):
        return date[1:-1]  # Remove the first and last characters (the brackets)
    return date  # Return as is if no brackets are found



def search_hospital_articles_v4(hospital_name):
    try:
        chrome_service = Service(r'C:\Users\LENOVO\Downloads\chromedriver-win64\chromedriver-win64\chromedriver.exe')
    except Exception as e:
        print(f"Error occurred: {e}. Switching to backup path.")
        chrome_service = Service('C:\\Program Files\\Google\\Chrome\\Application\\chromedriver.exe')    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--ignore-certificate-errors")
    chrome_options.add_argument("--incognito")

    driver = webdriver.Chrome(service=chrome_service, options=chrome_options)

    try:
        search_url = f"https://www.whuss.com/search?term={hospital_name}"
        driver.get(search_url)
        href_list = []
        articles_info = []
        page_number = 1
        max_pages = 15
        
         # 关键词在此定义
        keywords = ["合作", "协作","沟通","交流","研讨","进修","坐诊"]
        while page_number <= max_pages:
            # Extract <dl> elements which contain articles
            # find_element就是获得第一个
            dl_elements = driver.find_element(By.CSS_SELECTOR, "dl")
            dt_elements = dl_elements.find_elements(By.CSS_SELECTOR, "dt")
            for dt_element in dt_elements:
                # Extract publication date from <dt>
                
                date_elements = dt_element.find_elements(By.CSS_SELECTOR, "span.updated.pull-right")
                date = date_elements[0].text if date_elements else '未知'  # Extract date
                
                if date != '未知':
                    # Extract URL from <dt>
                    article_url_element = dt_element.find_element(By.TAG_NAME, "a")
                    article_url = article_url_element.get_attribute("href")

                    # Append article information
                    articles_info.append({
                        'url': article_url,
                        'date': clean_date(date),
                        'keywords': {keyword: False for keyword in keywords}
                    })
                    href_list.append(article_url)

            # Go to the next page
            next_button = driver.find_elements(By.CSS_SELECTOR, ".text-center a")
            if len(next_button) == 0:
                break
            else:
                page_number += 1
                next_page_url = f"https://www.whuss.com/search?term={hospital_name}&page={page_number}"
                driver.get(next_page_url)

        keywords = ["合作", "协作","沟通","交流","研讨","进修","坐诊"]
        keyword_counts, urls_with_keywords,article_info_new = search_keywords_in_urls(articles_info,href_list, keywords, driver)

        return len(href_list), article_info_new

    except Exception as e:
        print(f"发生错误: {e}")
    finally:
        driver.quit()


def count_hospitals_from_file(file_path, output_excel_path):
    try:
        hospitals_df = pd.read_excel(file_path)
        hospital_names = hospitals_df['医院名称'].tolist()

        results = []
        for name in hospital_names:
            count, articles_info = search_hospital_articles_v4(name)
            # Iterate through the articles information
            for info in articles_info:
                # Initialize a list to hold interaction types
                interaction_types = []

                # Determine the interaction types based on keywords
                if info['keywords'].get("合作", False) or info['keywords'].get("协作", False):
                    interaction_types.append("合作")
                if info['keywords'].get("沟通", False) or info['keywords'].get("交流", False):
                    interaction_types.append("沟通")
                if info['keywords'].get("研讨", False) or info['keywords'].get("坐诊", False) or info['keywords'].get("进修", False):
                    interaction_types.append("技术")

                # Append a record for each interaction type
                for interaction_type in interaction_types:
                    results.append({
                        "医院名称": name,
                        "交互类型": interaction_type,
                        "时间": info.get('date', '未知'),
                        "链接": info.get('url', '未知')
                    })

        # Convert the results to a DataFrame and save to Excel
        df = pd.DataFrame(results)
        df.to_excel(output_excel_path, index=False, engine='openpyxl')


        df = pd.DataFrame(results)
        df.to_excel(output_excel_path, index=False, engine='openpyxl')

    except FileNotFoundError:
        print("文件未找到")
        
keywords = ["合作", "协作","沟通","交流","研讨","进修","坐诊"]
if __name__ == "__main__":
    # 调用函数并传入文件路径
    # 统计文章中关键词出现的次数
    file_path = r"Data\xsy\武汉大学口腔医院\hospital_kouqiang.xlsx"
    output_excel_path = r"Data\xsy\武汉大学口腔医院\武汉大学口腔医院交互明细.xlsx"
    total_count = count_hospitals_from_file(file_path,output_excel_path)
    print(f"总计搜索结果数量: {total_count}")
    # name = "武汉大学中南医院嘉鱼医院"
    # search_hospital_articles_v3(name)
    
