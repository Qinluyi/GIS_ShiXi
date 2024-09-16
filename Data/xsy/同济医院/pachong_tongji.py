import requests
from bs4 import BeautifulSoup
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium import webdriver
import time
import pandas as pd



def search_keywords_in_urls(url_list, keywords, driver,keyword_mapping):   
    keyword_count = {keyword: 0 for keyword in keywords}
    urls_with_keywords = {keyword: set() for keyword in keywords}
    time_with_keywords = {keyword: set() for keyword in keywords}
    keyword_occurrences = {keyword: 0 for keyword in keywords}  # 记录每个关键词的出现次数

    try:
        for url in url_list:
            driver.get(url)
            time.sleep(3)
            
            article_elements = driver.find_elements(By.CLASS_NAME, "news_detail_article")
            if article_elements:
                # 统计每个关键词的出现次数
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
                        # 定位到 class 为 news_detailMsg clearFix 的 div 元素
                        div_element = driver.find_element(By.CSS_SELECTOR, "div.news_detailMsg.clearFix")

                        # 定位到第三个 p 元素
                        third_p_element = div_element.find_elements(By.TAG_NAME, "p")[2]

                        # 获取文本并提取日期
                        text = third_p_element.text
                        time_value = text.split('：')[1].strip()
                        
                        keyword_count[main_keyword] += 1  # 关键词出现在多少页面中
                        urls_with_keywords[main_keyword].add(url)
                        time_with_keywords[main_keyword].add(time_value)
                        keyword_occurrences[main_keyword] += keyword_total_occurrences  # 记录关键词的总出现次数
            else:
                continue
    
    except Exception as e:
        print(f"发生错误: {e}")

    # for keyword, count in keyword_count.items():
    #     print(f"关键词 '{keyword}' 出现在 {count} 个页面")
    print("共有{}篇新闻,其中合作{}篇、沟通{}篇、技术{}篇".format(len(url_list),keyword_count["合作"],keyword_count["沟通"],keyword_count["技术"]))
    return keyword_count, urls_with_keywords, time_with_keywords


def search_hospital_articles_v3(hospital_name,keyword_mapping,driver=None):
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
    keywords = ["合作", "沟通","技术"]
    keyword_count = {keyword: 0 for keyword in keywords}
    try:
        # 构造搜索 URL
        search_url = f"https://www.tjh.com.cn/search.html?word={hospital_name}"
        driver.get(search_url)
        time.sleep(4)  # 等待页面加载
        href_list = []
        print("当前搜索的医院链接:{}".format(search_url))
        # 查找 id 为 hidecount 的所有元素（即使预期只有一个）
        elements = driver.find_elements(By.CSS_SELECTOR, "div.displaycount")
        page_value = 1
        if elements:
            # 如果找到元素
            # page_value = element.text.strip()  # 去除前后空白字符
            number = elements[0].text.split("共")[1].split("页")[0]
            print(f"一共有: {number}页")
            page_value = int(number)
        else:
            print("只有一页")
        # 获取p元素内span元素的文本值
        # 定位到class为fr的p元素
        div_element = driver.find_element(By.CSS_SELECTOR, "div.search_keyword.clearFix")
        p_fr_elements = div_element.find_elements(By.CSS_SELECTOR, "p.fr")
        if p_fr_elements:
            p_fr_element = p_fr_elements[0]
            p_fr_element = div_element.find_element(By.CSS_SELECTOR, "p.fr")
            span_text = p_fr_element.find_element(By.TAG_NAME, "span").text
            print("一共搜索到{}篇文章".format(span_text))
        else:
            urls_with_keywords = {keyword: set() for keyword in keywords}
            time_with_keywords = {keyword: set() for keyword in keywords}
            print("一共搜索到0篇文章")
            return time_with_keywords,urls_with_keywords, len(href_list), keyword_count
        
            
        
        # 先搜第一页
        # 定位到ul元素
        href_list = []
        ul_element = driver.find_element(By.CSS_SELECTOR, "ul.main_content")
        # 获取所有li子元素
        li_elements = ul_element.find_elements(By.TAG_NAME, "li")

        # 获取每个li中a标签的href属性值
        for li in li_elements:
            a_element = li.find_element(By.TAG_NAME, "a")
            href = a_element.get_attribute("href")
            href_list.append(href)
            
        # 如果有第二页就搜第二页
        for page in range(2,page_value+1):
            url = search_url + "&page=" + str(page)
            driver.get(url)
            time.sleep(2)
            ul_element = driver.find_element(By.CSS_SELECTOR, "ul.main_content")
            # 获取所有li子元素
            li_elements = ul_element.find_elements(By.TAG_NAME, "li")
            div_element = driver.find_element(By.CSS_SELECTOR, "div.search_keyword.clearFix")
            # 定位到class为fr的p元素
            p_fr_element = div_element.find_element(By.CSS_SELECTOR, "p.fr")

            # 获取每个li中a标签的href属性值
            for li in li_elements:
                a_element = li.find_element(By.TAG_NAME, "a")
                href = a_element.get_attribute("href")
                href_list.append(href)
           
                
        
        keyword_counts, urls_with_keywords,time_with_keywords = search_keywords_in_urls(href_list, keywords, driver,keyword_mapping)
        
        # 返回元素的数量
        return time_with_keywords,urls_with_keywords, len(href_list), keyword_counts
            
    except Exception as e:
        print(f"发生错误: {e}")


def count_hospitals_from_file(file_path, output_detail, output_count):
    # 设置 ChromeDriver 的路径
    # 设置 ChromeDriver 的路径
    chrome_service = Service(r'C:\Users\LENOVO\Downloads\chromedriver-win64\chromedriver-win64\chromedriver.exe')
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
            for keyword in keywords:
                time_set = time_jiaohu.get(keyword,set())
                time_list = list(time_set)
                url_set = urls_with_keywords.get(keyword,set())
                url_list = list(url_set)
                for i in range(len(time_list)):
                    results.append({"医院名称": name, "交互类型":keyword, "时间":time_list[i],"链接":url_list[i]})
                    print("{}:交互类型:{} 交互时间:{} 链接:{}".format(name,keyword,time_list[i],url_list[i]))
            
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
    file_path = r"Data\xsy\同济医院\同济.txt"
    output_detail = r"Data\xsy\同济医院\同济医院交互明细.xlsx"
    output_count = r"Data\xsy\同济医院\同济医院交互强度表.xlsx"

    total_count = count_hospitals_from_file(file_path,output_detail,output_count)
    print(f"总计搜索结果数量: {total_count}")
    # name = "玉田县中医医院"
    # search_hospital_articles_v3(name)
    