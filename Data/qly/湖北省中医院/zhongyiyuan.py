import requests
from bs4 import BeautifulSoup
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium import webdriver
import time
import pandas as pd



def search_keywords_in_urls(url_list, keywords, driver):   
    # 初始化计数器
    keyword_count = {tuple(kw): 0 for kw in keywords}  # 使用元组作为字典的键
    urls_with_keywords = {tuple(kw): set() for kw in keywords}
    time_with_keywords = {tuple(kw): set() for kw in keywords}
    keyword_occurrences = {tuple(kw): 0 for kw in keywords}
    try:
        for url in url_list:
            driver.get(url)
            time.sleep(3)
            
            article_elements = driver.find_elements(By.CLASS_NAME, "psgCont")
            if article_elements:
                # 统计每个关键词类别的出现次数
                for keyword_group in keywords:
                    keyword_lower_group = [kw.lower() for kw in keyword_group]
                    keyword_total_occurrences = 0
                    found_in_article = False
                    
                    for article in article_elements:
                        text = article.text.lower()
                        # 检查关键词组中的任何一个关键词是否在文章中出现
                        if any(keyword in text for keyword in keyword_lower_group):
                            found_in_article = True
                            keyword_total_occurrences += sum(text.count(keyword) for keyword in keyword_lower_group)

                    if found_in_article:
                        # 定位到 class 为 news_detailMsg clearFix 的 div 元素
                        div_element = driver.find_element(By.CSS_SELECTOR, "div.info")

                        # 定位到第三个 span 元素
                        third_span_element = div_element.find_elements(By.TAG_NAME, "span")[2]

                        # 获取文本并提取日期
                        text = third_span_element.text
                        time_value = text.split('：')[1].strip()
                        
                        keyword_count[tuple(keyword_group)] += 1  # 关键词组出现在多少页面中
                        urls_with_keywords[tuple(keyword_group)].add(url)
                        time_with_keywords[tuple(keyword_group)].add(time_value)
                        keyword_occurrences[tuple(keyword_group)] += keyword_total_occurrences  # 记录关键词组的总出现次数
                
            else:
                continue
    
    except Exception as e:
        print(f"发生错误: {e}")

    # for keyword, count in keyword_count.items():
    #     print(f"关键词 '{keyword}' 出现在 {count} 个页面")
    # print("共有{}篇新闻,其中合作{}篇、沟通{}篇、进修{}篇".format(len(url_list),keyword_count["合作"],keyword_count["沟通"],keyword_count["进修"]))
    return keyword_count, urls_with_keywords, time_with_keywords


def search_hospital_articles_v3(hospital_name,keywords,driver=None):
    # # 设置 ChromeDriver 的路径
    # chrome_service = Service('C:\\Program Files\\Google\\Chrome\\Application\\chromedriver.exe')
    # # 设置 ChromeOptions
    # chrome_options = Options()
    # chrome_options.add_argument("--headless")  # 无头模式，不弹出浏览器窗口
    # chrome_options.add_argument("--no-sandbox")
    # chrome_options.add_argument("--disable-dev-shm-usage")
    # chrome_options.add_argument("--ignore-certificate-errors")
    # chrome_options.add_argument("--incognito")

    # 启动浏览器
    # driver = webdriver.Chrome(service=chrome_service, options=chrome_options)
    # keywords = ["合作", "沟通","进修"]
    try:
        # 构造搜索 URL
        search_url = f"https://www.hbhtcm.com/index/search.html?keyword={hospital_name}"
        driver.get(search_url)
        time.sleep(4)  # 等待页面加载
        href_list = []
        print("当前搜索的医院链接:{}".format(search_url))

        # 定位到class为page的div元素
        page_div = driver.find_element(By.CLASS_NAME, "page")

        # 在page_div元素下找到所有a标签
        a_elements = page_div.find_elements(By.TAG_NAME, "a")

        # 获取a标签的数量
        a_count = len(a_elements)
        if a_count == 2:
            keyword_count = {tuple(kw): 0 for kw in keywords}  # 使用元组作为字典的键
            urls_with_keywords = {tuple(kw): set() for kw in keywords}
            time_with_keywords = {tuple(kw): set() for kw in keywords}
            
            print("一共搜索到0篇文章")
            return time_with_keywords,urls_with_keywords,0,keyword_count
        else:
            for page in range(1,a_count-1):#从第二个a标签到倒数第二个a标签
                a_element = a_elements[page]
                href = a_element.get_attribute("href")
                driver.get(href)
                time.sleep(2)
                # 定位到class为noticeList的元素
                notice_list = driver.find_element(By.CLASS_NAME, "noticeList")

                # 在noticeList元素下找到ul
                ul_element = notice_list.find_element(By.TAG_NAME, "ul")

                # 找到ul中的所有li标签
                li_elements = ul_element.find_elements(By.TAG_NAME, "li")
                if li_elements:
                    for li in li_elements:
                        a_tag = li.find_element(By.TAG_NAME, "a")
                        href = a_tag.get_attribute("href")
                        href_list.append(href)
                
                #重新定位回第一页
                driver.get(search_url)
                time.sleep(2)  # 等待页面加载
                # 定位到class为page的div元素
                page_div = driver.find_element(By.CLASS_NAME, "page")

                # 在page_div元素下找到所有a标签
                a_elements = page_div.find_elements(By.TAG_NAME, "a")
                
                        
        keyword_counts, urls_with_keywords,time_with_keywords = search_keywords_in_urls(href_list, keywords, driver)
        
        # 返回元素的数量
        return time_with_keywords,urls_with_keywords,len(href_list),keyword_counts
                    
    except Exception as e:
        print(f"发生错误: {e}")


def count_hospitals_from_file(file_path,output_excel_path,output_excel_path1):
    # 设置 ChromeDriver 的路径
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
        keywords = [["合作","协作"],["沟通","交流"],["进修","研讨","坐诊"]]
        keys=["合作","沟通","技术"]
        
        with open(file_path, 'r', encoding='utf-8') as file:
            hospital_names = file.readlines()
        
        hospital_names = [name.strip() for name in hospital_names]
        results = []
        results1 = []
        
        for name in hospital_names:
            time_jiaohu,urls_with_keywords,article_num,keyword_counts = search_hospital_articles_v3(name,keywords,driver)
            results1.append({"医院名称":name, "文章数量":article_num,"合作":keyword_counts[tuple(keywords[0])],"沟通":keyword_counts[tuple(keywords[1])],"技术":keyword_counts[tuple(keywords[2])]})
            print("共有{}篇新闻,其中合作{}篇、沟通{}篇、技术{}篇".format(article_num,keyword_counts[tuple(keywords[0])],keyword_counts[tuple(keywords[1])],keyword_counts[tuple(keywords[2])]))
            for i in range(len(keys)):
                time_set = time_jiaohu.get(tuple(keywords[i]), set())
                time_list = list(time_set)
                url_set = urls_with_keywords.get(tuple(keywords[i]) ,set())
                url_list = list(url_set)
                for j in range(len(time_list)):
                    results.append({"医院名称": name, "交互类型":keys[i], "时间":time_list[j],"链接":url_list[j]})
                    print("{}:交互类型:{} 交互时间:{} 链接:{}".format(name,keys[i],time_list[j],url_list[j]))
            #print("{},文章数量:{},合作:{},沟通:{},进修:{}".format(name,count,hezuo,goutong,jinxiu))
        # 创建 DataFrame 并保存为 Excel 文件
        df = pd.DataFrame(results)
        df.to_excel(output_excel_path, index=False, engine='openpyxl')
        df1 = pd.DataFrame(results1)
        df1.to_excel(output_excel_path1, index=False, engine='openpyxl')
        

        
        
    except FileNotFoundError:
        print("文件未找到")
        return 0
    finally:
        driver.quit()

if __name__ == "__main__":
    # 调用函数并传入文件路径
    file_path = r"Data\qly\湖北省中医院\湖北省中医院高校医联体.txt"
    output_excel_path = r"Data\qly\湖北省中医院\湖北省中医院交互明细.xlsx"
    output_excel_path1 = r"Data\qly\湖北省中医院\湖北省中医院交互强度表.xlsx"
    count_hospitals_from_file(file_path,output_excel_path,output_excel_path1)
    
    # name = "玉田县中医医院"
    # search_hospital_articles_v3(name)
    