# https://www.znhospital.cn/searchs/keywords/中南医院

import requests
from bs4 import BeautifulSoup
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium import webdriver
import time
import pandas as pd


def search_keywords_in_urls(url_list, keywords, driver, keyword_mapping):
    keyword_count = {keyword: 0 for keyword in keywords}
    urls_with_keywords = {keyword: set() for keyword in keywords}
    time_with_keywords = {keyword: set() for keyword in keywords}
    keyword_occurrences = {keyword: 0 for keyword in keywords}  # 初始化每个关键词的出现次数

    try:
        for url in url_list:
            driver.get(url)
            time.sleep(3)
            article_elements = driver.find_elements(By.CLASS_NAME, "article-cont")
            if article_elements:
                for main_keyword, sub_keywords in keyword_mapping.items():
                    keyword_total_occurrences = 0
                    for article in article_elements:
                        text = article.text.lower()
                        for sub_keyword in sub_keywords:
                            keyword_lower = sub_keyword.lower()
                            occurrences = text.count(keyword_lower)
                            if occurrences > 0:
                                keyword_total_occurrences += occurrences

                    if keyword_total_occurrences > 0:
                        dates = driver.find_element(By.CSS_SELECTOR, '.info .s4')
                        if dates:
                            time_value = dates.text.strip()
                        else:
                            time_value = "None"
                        keyword_count[main_keyword] += 1
                        urls_with_keywords[main_keyword].add(url)
                        time_with_keywords[main_keyword].add(time_value)
                        keyword_occurrences[main_keyword] += keyword_total_occurrences
            else:
                continue

    except Exception as e:
        print(f"发生错误: {e}")

    print("共有{}篇新闻,其中合作{}篇、沟通{}篇、技术{}篇".format(len(url_list), keyword_count["合作"], keyword_count["沟通"], keyword_count["技术"]))
    return keyword_count, urls_with_keywords, time_with_keywords



def search_hospital_articles_v3(hospital_name, keyword_mapping, driver=None):
    try:
        # 构造搜索 URL
        search_url = f"https://www.znhospital.cn/searchs/keywords/{hospital_name}"
        driver.get(search_url)
        time.sleep(4)  # 等待页面加载
        href_list = []
        print("当前搜索的医院链接:{}".format(search_url))

        pages = driver.find_elements(By.CSS_SELECTOR, ".paging-box.gray a")
        results = driver.find_elements(By.CSS_SELECTOR, ".result-list .list-item")

        for result in results:
            a_tags = result.find_elements(By.TAG_NAME, "a")
            for a_tag in a_tags:
                href = a_tag.get_attribute("href")
                href_list.append(href)

        pages_num = len(pages)
        if pages:
            for i in range(1, pages_num-1):
                pages[i].click()
                time.sleep(3)
                results = driver.find_elements(By.CSS_SELECTOR, ".result-list .list-item")
                for result in results:
                    a_tags = result.find_elements(By.TAG_NAME, "a")
                    for a_tag in a_tags:
                        href = a_tag.get_attribute("href")
                        href_list.append(href)
                driver.get(search_url)
                time.sleep(1)
                pages = driver.find_elements(By.CSS_SELECTOR, ".paging-box.gray a")

        keywords = ["合作", "沟通", "技术"]
        # 初始化 keyword_counts 以避免未定义的情况
        keyword_counts, urls_with_keywords, time_with_keywords = search_keywords_in_urls(href_list, keywords, driver, keyword_mapping)
        
        return time_with_keywords, urls_with_keywords, len(href_list), keyword_counts

    except Exception as e:
        print(f"发生错误: {e}")

    
        
    


def count_hospitals_from_file(file_path,output_detail, output_count):
    try:
        chrome_service = Service(r'C:\Users\LENOVO\Downloads\chromedriver-win64\chromedriver-win64\chromedriver.exe')
    except Exception as e:
        print(f"Error occurred: {e}. Switching to backup path.")
        chrome_service = Service('C:\\Program Files\\Google\\Chrome\\Application\\chromedriver.exe')    
    # 设置 ChromeOptions
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # 无头模式，不弹出浏览器窗口
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # 启动浏览器
    driver = webdriver.Chrome(service=chrome_service, options=chrome_options)
    try:
        # 搜索每个url查找关键词
        keywords = ["合作", "沟通","技术"]
         # 关键词映射：将多个关键词映射到同一个类别
        keyword_mapping = {
            "合作": ["合作", "协作"],
            "沟通": ["沟通", "交流"],
            "技术": ["研讨", "进修", "坐诊"]
        }
        
        with open(file_path, 'r', encoding='utf-8') as file:
            hospital_names = file.readlines()
        
        hospital_names = [name.strip() for name in hospital_names]
        results = []
        count_hos=[]
        # 对每个医院名称进行搜索并统计
        total_count = 0
        for name in hospital_names:
            time_jiaohu,urls_with_keywords,article_num, keyword_counts = search_hospital_articles_v3(name,keyword_mapping,driver)
            for main_keyword, sub_keywords in keyword_mapping.items():
                # 统计每个类别下所有子关键词的总出现次数
                for sub_keyword in sub_keywords:
                    time_set = time_jiaohu.get(sub_keyword,set())
                    time_list = list(time_set)
                    url_set = urls_with_keywords.get(sub_keyword,set())
                    url_list = list(url_set)
                    for i in range(len(time_list)):
                        results.append({"医院名称": name, "交互类型":main_keyword, "时间":time_list[i],"链接":url_list[i]})
                        print("{}:交互类型:{} 交互时间:{} 链接:{}".format(name,main_keyword,time_list[i],url_list[i]))
            
            count_hos.append({"医院名称": name, "文章数量":article_num, "合作":keyword_counts["合作"], "沟通":keyword_counts["沟通"], "技术": keyword_counts["技术"]})
            #print("{},文章数量:{},合作:{},沟通:{},进修:{}".format(name,count,hezuo,goutong,jinxiu))
        # 创建 DataFrame 并保存为 Excel 文件
        df = pd.DataFrame(results)
        df1 = pd.DataFrame(count_hos)
        df.to_excel(output_detail, index=False, engine='openpyxl')
        df1.to_excel(output_count, index=False, engine='openpyxl')

        
        return total_count
    except FileNotFoundError:
        print("文件未找到")
        return 0
    finally:
        driver.quit()

if __name__ == "__main__":
    # 调用函数并传入文件路径
    file_path = r"Data\xsy\武汉大学中南医院\中南.txt"
    output_detail = r"Data\xsy\武汉大学中南医院\武汉大学中南医院交互明细.xlsx"
    output_count = r"Data\xsy\武汉大学中南医院\武汉大学中南医院交互强度表.xlsx"

    total_count = count_hospitals_from_file(file_path,output_detail,output_count)
    print(f"总计搜索结果数量: {total_count}")
    # name = "武汉大学医院"
    # search_hospital_articles_v3(name)
    
