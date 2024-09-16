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
from webdriver_manager.chrome import ChromeDriverManager




def search_keywords_in_urls(url_list, keywords, keywords_count, driver):
    
    # 初始化关键词出现次数和出现的URL集合
    keyword_count = {keyword: 0 for keyword in keywords_count}
    urls_with_keywords = {keyword: set() for keyword in keywords_count}
    keyword_occurrences = {keyword: 0 for keyword in keywords_count}  # 记录每个keywords_count的关键词总出现次数

    # 关键词映射：将多个关键词映射到同一个类别
    keyword_mapping = {
        "合作": ["合作", "协作"],
        "沟通": ["沟通", "交流"],
        "技术": ["研讨", "进修", "坐诊"]
    }

    try:
        for url in url_list:
            driver.get(url)
            # time.sleep(3)  # 等待页面加载

            article_elements = driver.find_elements(By.CLASS_NAME, "content")
            if article_elements:
                # 遍历每个 keywords_count 中的关键词类别
                for main_keyword, sub_keywords in keyword_mapping.items():
                    total_occurrences = 0  # 总出现次数

                    for article in article_elements:
                        text = article.text.lower()
                        
                        # 统计每个类别下所有子关键词的总出现次数
                        for sub_keyword in sub_keywords:
                            sub_keyword_lower = sub_keyword.lower()
                            occurrences = text.count(sub_keyword_lower)
                            if occurrences > 0:
                                total_occurrences += occurrences
                    
                    if total_occurrences > 0:
                        keyword_count[main_keyword] += 1  # 主关键词出现在多少页面中
                        urls_with_keywords[main_keyword].add(url)
                        keyword_occurrences[main_keyword] += total_occurrences  # 记录总出现次数
            else:
                continue
    
    except Exception as e:
        print(f"发生错误: {e}")

    return keyword_count, urls_with_keywords


def search_hospital_articles_v4(hospital_name):
    # 设置 ChromeDriver 的路径
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
    chrome_options.add_argument("--ignore-certificate-errors")
    chrome_options.add_argument("--incognito")

    # 启动浏览器
    driver = webdriver.Chrome(service=chrome_service, options=chrome_options)

    try:
        # 构造搜索 URL
        search_url = f"https://www.whuss.com/search?term={hospital_name}"
        driver.get(search_url)
        # time.sleep(4)  # 等待页面加载

        href_list = []
        page_number = 1
        max_pages = 15  # 假设有一个最大页面数限制，防止无限循环

        while page_number <= max_pages:
            # 获取搜索结果
            results = driver.find_elements(By.CSS_SELECTOR, ".col-md-12.main-content dl dt")
            for result in results:
                a_tag = result.find_element(By.TAG_NAME, "a")
                href = a_tag.get_attribute("href")
                href_list.append(href)

            # 检查是否有下一页
            next_button = driver.find_elements(By.CSS_SELECTOR, ".text-center a")
            if len(next_button) == 0:
                break  # 如果没有下一页，退出循环
            else:
                # 构造下一页 URL 并访问
                page_number += 1
                next_page_url = f"https://www.whuss.com/search?term={hospital_name}&page={page_number}"
                driver.get(next_page_url)
                # time.sleep(3)  # 等待页面加载

        # 搜索每个url查找关键词
        keywords = ["合作", "协作","沟通","交流","研讨","进修","坐诊"]
        keywords_count=["合作","沟通","技术"]
        keyword_counts, urls_with_keywords = search_keywords_in_urls(href_list, keywords, keywords_count, driver)

        # 返回元素的数量
        return len(href_list), keyword_counts[keywords_count[0]], keyword_counts[keywords_count[1]], keyword_counts[keywords_count[2]]

    except Exception as e:
        print(f"发生错误: {e}")
    finally:
        driver.quit()


def search_hospital_articles_v3(hospital_name):
    # 设置 ChromeDriver 的路径
    chrome_service = Service(r'C:\Users\LENOVO\Downloads\chromedriver-win64\chromedriver-win64\chromedriver.exe')
    # 设置 ChromeOptions
    # chrome_service = Service(ChromeDriverManager().install())
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # 无头模式，不弹出浏览器窗口
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--ignore-certificate-errors")
    chrome_options.add_argument("--incognito")

    # 启动浏览器
    driver = webdriver.Chrome(service=chrome_service, options=chrome_options)

    try:
        # 构造搜索 URL
        search_url = f"https://www.whuss.com/search?term={hospital_name}"
        driver.get(search_url)
        # time.sleep(4)  # 等待页面加载
        href_list = []
        pages = driver.find_elements(By.CSS_SELECTOR, ".paging-box.gray a")
        # 先把当前页面(第一页)的结果加进去
        results = driver.find_elements(By.CSS_SELECTOR, ".result-list .list-item")   
        for result in results:
            a_tags = result.find_elements(By.TAG_NAME, "a")
            for a_tag in a_tags:
                href = a_tag.get_attribute("href")
                href_list.append(href)
        # 然后看后面几页的
        page_count = 1  
        if pages != "":
            for page in pages:
                if page_count == len(pages):
                    continue
                if page.text.isdigit() and page.text != "1":
                    page.click()
                    # time.sleep(3)
                    # 获取并处理页面内容
                    results = driver.find_elements(By.CSS_SELECTOR, ".result-list .list-item")
                    
                    for result in results:
                        a_tags = result.find_elements(By.TAG_NAME, "a")
                        for a_tag in a_tags:
                            href = a_tag.get_attribute("href")
                            href_list.append(href)
                page_count +=1
        # if pages!= "":
        #     print("{}:一共{}页:".format(hospital_name,len(pages)))
        # else:
        #     print("{}:一共1页:".format(hospital_name))
        # 搜索每个url查找关键词
        keywords = ["合作", "协作","沟通","交流","研讨","进修","坐诊"]
        keywords_count=["合作","沟通","技术"]
        keyword_counts, urls_with_keywords = search_keywords_in_urls(href_list, keywords, keywords_count, driver)
        
        # 返回元素的数量
        return len(href_list),keyword_counts[keywords[0]],keyword_counts[keywords[1]],keyword_counts[keywords[2]]
            
    except Exception as e:
        print(f"发生错误: {e}")
    finally:
        driver.quit()

    
        
    

def search_hospital_articles_v2(hospital_name):
    # 设置 ChromeDriver 的路径
    chrome_service = Service(r'C:\Users\LENOVO\Downloads\chromedriver-win64\chromedriver-win64\chromedriver.exe')
    # chrome_service = Service(ChromeDriverManager().install())

    # 设置 ChromeOptions
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # 无头模式，不弹出浏览器窗口
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # 启动浏览器
    driver = webdriver.Chrome(service=chrome_service, options=chrome_options)
    
    try:
        # 构造搜索 URL
        search_url = f"https://www.znhospital.cn/searchs/keywords/{hospital_name}"
        driver.get(search_url)
        print("当前搜索的医院链接:{}".format(search_url))

        # 等待页面加载完成
        # time.sleep(3)  # 可以根据需要调整等待时间

        # 查找具有特定 id 的元素
        ajax_list_element = driver.find_element(By.ID, "ajax-list")
        
        # 查找所有子元素
        list_items = ajax_list_element.find_elements(By.CLASS_NAME, "list-item")
        

        # 提取每个 list-item 的 href 链接
        href_links = []
        for item in list_items:
            # 查找 class 为 t 的元素中的 <a> 标签
            t_element = item.find_element(By.CLASS_NAME, "t")
            a_tags = t_element.find_elements(By.TAG_NAME, "a")
            
            for a_tag in a_tags:
                href = a_tag.get_attribute("href")
                if href:
                    href_links.append(href)
                    
        # 搜索每个url查找关键词
        keywords = ["合作", "协作","沟通","交流","研讨","进修","坐诊"]
        keyword_counts, urls_with_keywords = search_keywords_in_urls(href_links, keywords, driver)
        
        # 返回元素的数量
        return len(list_items),keyword_counts[keywords[0]],keyword_counts[keywords[1]],keyword_counts[keywords[2]]
    except Exception as e:
        print(f"发生错误: {e}")
        return 0
    finally:
        driver.quit()


def search_hospital_articles(hospital_name):
    
    # 构造搜索 URL
    search_url = f"https://www.znhospital.cn/searchs/keywords/{hospital_name}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
    }
    
    try:
        response = requests.get(search_url, headers=headers)
        response.raise_for_status()  # 检查请求是否成功
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 提取所有符合条件的元素
        list_items = soup.find_all("div", class_="list-item")
        
        # 返回元素的数量
        return len(list_items)
    except requests.RequestException as e:
        print(f"请求出错: {e}")
        return 0

def count_hospitals_from_file(file_path,output_excel_path):
    try:
        # with open(file_path, 'r', encoding='utf-8') as file:
        #     hospital_names = file.readlines()
        hospitals_df = pd.read_excel(file_path)

        # hospital_names = [name.strip() for name in hospital_names]
        hospital_names = hospitals_df['医院名称'].tolist()

        results = []
        # 对每个医院名称进行搜索并统计
        total_count = 0
        for name in hospital_names:
            count,hezuo,goutong,jishu = search_hospital_articles_v4(name)
            results.append({"医院名称": name, "文章数量": count, "合作": hezuo, "沟通":goutong, "技术":jishu})
            print("{},文章数量:{},合作:{},沟通:{},进修:{}".format(name,count,hezuo,goutong,jishu))
        # 创建 DataFrame 并保存为 Excel 文件
        df = pd.DataFrame(results)
        df.to_excel(output_excel_path, index=False, engine='openpyxl')


        return total_count
    except FileNotFoundError:
        print("文件未找到")
        return 0

if __name__ == "__main__":
    # 调用函数并传入文件路径
    file_path = r"Data\xsy\武汉大学口腔医院\hospital_kouqiang.xlsx"
    output_excel_path = r"Data\xsy\武汉大学口腔医院\武汉大学口腔医院交互强度表.xlsx"
    total_count = count_hospitals_from_file(file_path,output_excel_path)
    print(f"总计搜索结果数量: {total_count}")
    # name = "武汉大学中南医院嘉鱼医院"
    # search_hospital_articles_v3(name)
    
