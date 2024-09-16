import pandas as pd
import requests
from bs4 import BeautifulSoup
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium import webdriver
import time
import base64

class HospitalA_spider():
    name='renmin'
    def __init__(self):
        self.file_path = r"hospital_renmin.xlsx"
        self.keywords = ['合作', '沟通', '进修']
        self.read_excel()
        # 为每家医院统计文章数量和关键词统计
        self.hospital_article_count = {}

    def read_excel(self):
        # 读取 Excel 文件
        hospitals_df = pd.read_excel(self.file_path)
        self.hospital_names = hospitals_df['医院名称'].tolist()

    def search_hospital_articles(self,hospital_name):
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
    def count_keywords_in_article(self,article_url):
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        }
        response = requests.get(article_url, headers=headers)
        keyword_found = {keyword: False for keyword in self.keywords}
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            article_text = soup.get_text()
            # 检查每个关键词是否存在于文章中
            for keyword in self.keywords:
                if keyword in article_text:
                    keyword_found[keyword] = True
        return keyword_found

    def run(self):
        self.read_excel()
        for hospital in self.hospital_names:
            article_links = self.search_hospital_articles(hospital)
            total_keywords_count = {keyword: 0 for keyword in self.keywords}
            if not article_links:  # 如果没有文章链接，则设置文章数量为0
                self.hospital_article_count[hospital] = {
                    '文章数量': 0,
                    **{keyword: 0 for keyword in self.keywords}  # 所有关键词出现次数也为0
                }
            else:
                for article_link in article_links:
                    keyword_count = self.count_keywords_in_article(article_link)
                    for keyword in self.keywords:
                        total_keywords_count[keyword] += keyword_count[keyword]
                self.hospital_article_count[hospital] = {
                    '文章数量': len(article_links),
                    **total_keywords_count  # 将关键词统计结果加入字典
                }
            print(f"{hospital}: {len(article_links)} 篇文章, 关键词统计: {total_keywords_count}")

        # 保存结果到 Excel 文件
        result_df = pd.DataFrame.from_dict(self.hospital_article_count, orient='index')
        result_df.reset_index(inplace=True)
        result_df.columns = ['医院', '文章数量', '合作', '沟通', '进修']
        result_df.to_excel('hospital_article_count_remnin.xlsx', index=False)

class HospitalB_spider():
    name='zhongnan'
    def __init__(self):
        a=1
        ##随便写的a，与实现主题功能无关，只是为了让类实例化函数有东西

    def search_keywords_in_urls(self,url_list, keywords, driver):

        keyword_count = {keyword: 0 for keyword in keywords}
        urls_with_keywords = {keyword: set() for keyword in keywords}
        time_with_keywords = {keyword: set() for keyword in keywords}
        keyword_occurrences = {keyword: 0 for keyword in keywords}  # 记录每个关键词的出现次数

        try:
            for url in url_list:
                driver.get(url)
                time.sleep(3)
                article_elements = driver.find_elements(By.CLASS_NAME, "article-cont")
                if article_elements:
                    # 统计每个关键词的出现次数
                    for keyword in keywords:
                        keyword_lower = keyword.lower()
                        keyword_total_occurrences = 0

                        for article in article_elements:
                            text = article.text.lower()
                            occurrences = text.count(keyword_lower)
                            if occurrences > 0:
                                keyword_total_occurrences += occurrences

                        if keyword_total_occurrences > 0:
                            dates = driver.find_element(By.CSS_SELECTOR, '.info .s4')
                            if dates:
                                time_value = dates.text.strip()
                            else:
                                time_value = "None"
                            keyword_count[keyword] += 1  # 关键词出现在多少页面中
                            urls_with_keywords[keyword].add(url)
                            time_with_keywords[keyword].add(time_value)
                            keyword_occurrences[keyword] += keyword_total_occurrences  # 记录关键词的总出现次数
                else:
                    continue

        except Exception as e:
            print(f"发生错误: {e}")

        # for keyword, count in keyword_count.items():
        #     print(f"关键词 '{keyword}' 出现在 {count} 个页面")
        print("共有{}篇新闻,其中合作{}篇、沟通{}篇、进修{}篇".format(len(url_list), keyword_count["合作"],
                                                                   keyword_count["沟通"], keyword_count["进修"]))
        return keyword_count, urls_with_keywords, time_with_keywords

    def search_hospital_articles_v3(self,hospital_name, driver=None):
        # # 设置 ChromeDriver 的路径
        # chrome_service = Service('C:\\Program Files\\Google\\Chrome\\Application\\chromedriver.exe')
        # # 设置 ChromeOptions
        # chrome_options = Options()
        # chrome_options.add_argument("--headless")  # 无头模式，不弹出浏览器窗口
        # chrome_options.add_argument("--no-sandbox")
        # chrome_options.add_argument("--disable-dev-shm-usage")
        # chrome_options.add_argument("--ignore-certificate-errors")
        # chrome_options.add_argument("--incognito")

        # # 启动浏览器
        # driver = webdriver.Chrome(service=chrome_service, options=chrome_options)
        try:
            # 构造搜索 URL
            search_url = f"https://www.znhospital.cn/searchs/keywords/{hospital_name}"
            driver.get(search_url)
            time.sleep(4)  # 等待页面加载
            href_list = []
            print("当前搜索的医院链接:{}".format(search_url))
            pages = driver.find_elements(By.CSS_SELECTOR, ".paging-box.gray a")
            # original_pages = pages.copy()
            # 先把当前页面(第一页)的结果加进去
            results = driver.find_elements(By.CSS_SELECTOR, ".result-list .list-item")
            for result in results:
                a_tags = result.find_elements(By.TAG_NAME, "a")
                for a_tag in a_tags:
                    href = a_tag.get_attribute("href")
                    href_list.append(href)
            # 然后看后面几页的
            pages_num = len(pages)

            if pages != "":
                for i in range(1, pages_num - 1):
                    pages[i].click()
                    time.sleep(3)
                    # 获取并处理页面内容
                    results = driver.find_elements(By.CSS_SELECTOR, ".result-list .list-item")

                    for result in results:
                        a_tags = result.find_elements(By.TAG_NAME, "a")
                        for a_tag in a_tags:
                            href = a_tag.get_attribute("href")
                            href_list.append(href)
                        # 要定位回第一页
                    driver.get(search_url)
                    time.sleep(1)
                    pages = driver.find_elements(By.CSS_SELECTOR, ".paging-box.gray a")

            # if pages!= "":
            #     print("{}:一共{}页:".format(hospital_name,len(pages)))
            # else:
            #     print("{}:一共1页:".format(hospital_name))
            # 搜索每个url查找关键词
            keywords = ["合作", "沟通", "进修"]
            keyword_counts, urls_with_keywords, time_with_keywords = self.search_keywords_in_urls(href_list, keywords,driver)

            # 返回元素的数量
            return time_with_keywords, urls_with_keywords

        except Exception as e:
            print(f"发生错误: {e}")
        # finally:
        #     driver.quit()

    def search_hospital_articles_v2(self,hospital_name):
        # 设置 ChromeDriver 的路径
        chrome_service = Service('D:\\学习资料\\大四\\github\\GIS_ShiXi\Data\\datadriver\\chromedriver.exe')
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
            time.sleep(3)  # 可以根据需要调整等待时间

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
            keywords = ["合作", "沟通", "进修"]
            keyword_counts, urls_with_keywords = self.search_keywords_in_urls(href_links, keywords, driver)
            # 返回元素的数量
            return len(list_items), keyword_counts[keywords[0]], keyword_counts[keywords[1]], keyword_counts[
                keywords[2]]
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

    def count_hospitals_from_file(self,file_path, output_excel_path):
        # 设置 ChromeDriver 的路径
        chrome_service = Service('D:\\学习资料\\大四\\github\\GIS_ShiXi\\Data\\datadriver\\chromedriver.exe')
        # 设置 ChromeOptions
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # 无头模式，不弹出浏览器窗口
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")

        # 启动浏览器
        driver = webdriver.Chrome(service=chrome_service, options=chrome_options)
        try:
            # 搜索每个url查找关键词
            keywords = ["合作", "沟通", "进修"]

            with open(file_path, 'r', encoding='utf-8') as file:
                hospital_names = file.readlines()

            hospital_names = [name.strip() for name in hospital_names]
            results = []
            # 对每个医院名称进行搜索并统计
            total_count = 0
            for name in hospital_names:
                time_jiaohu, urls_with_keywords = self.search_hospital_articles_v3(name, driver)
                for keyword in keywords:
                    time_set = time_jiaohu.get(keyword, set())
                    time_list = list(time_set)
                    url_set = urls_with_keywords.get(keyword, set())
                    url_list = list(url_set)
                    for i in range(len(time_list)):
                        results.append(
                            {"医院名称": name, "交互类型": keyword, "时间": time_list[i], "链接": url_list[i]})
                        print("{}:交互类型:{} 交互时间:{} 链接:{}".format(name, keyword, time_list[i], url_list[i]))
                # print("{},文章数量:{},合作:{},沟通:{},进修:{}".format(name,count,hezuo,goutong,jinxiu))
            # 创建 DataFrame 并保存为 Excel 文件
            df = pd.DataFrame(results)
            df.to_excel(output_excel_path, index=False, engine='openpyxl')
            return total_count
        except FileNotFoundError:
            print("文件未找到")
            return 0
        finally:
            driver.quit()

    def run(self):
        file_path = '中南.txt'
        output_excel_path = '中南医院搜索结果.xlsx'
        total_count = self.count_hospitals_from_file(file_path, output_excel_path)
        print(f"总计搜索结果数量: {total_count}")

class HospitalC_spider():
    name = 'kouqiang_spider'
    # 类似定义...
    def __init__(self):
        name='asd'

    def search_keywords_in_urls(self,url_list, keywords, driver):
        keyword_count = {keyword: 0 for keyword in keywords}
        urls_with_keywords = {keyword: set() for keyword in keywords}
        keyword_occurrences = {keyword: 0 for keyword in keywords}  # 记录每个关键词的出现次数
        try:
            for url in url_list:
                driver.get(url)
                # time.sleep(3)  # 等待页面加载

                article_elements = driver.find_elements(By.CLASS_NAME, "content")
                if article_elements:
                    # 统计每个关键词的出现次数
                    for keyword in keywords:
                        keyword_lower = keyword.lower()
                        keyword_total_occurrences = 0

                        for article in article_elements:
                            text = article.text.lower()
                            occurrences = text.count(keyword_lower)
                            if occurrences > 0:
                                keyword_total_occurrences += occurrences

                        if keyword_total_occurrences > 0:
                            keyword_count[keyword] += 1  # 关键词出现在多少页面中
                            urls_with_keywords[keyword].add(url)
                            keyword_occurrences[keyword] += keyword_total_occurrences  # 记录关键词的总出现次数
                else:
                    continue

        except Exception as e:
            print(f"发生错误: {e}")

        # for keyword, count in keyword_count.items():
        #     print(f"关键词 '{keyword}' 出现在 {count} 个页面")

        return keyword_count, urls_with_keywords

    def search_hospital_articles_v4(self,hospital_name):
        # 设置 ChromeDriver 的路径
        chrome_service = Service(r'D:\\学习资料\\大四\\github\\GIS_ShiXi\Data\\datadriver\\chromedriver.exe')
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
            keywords = ["合作", "沟通", "进修"]
            keyword_counts, urls_with_keywords = self.search_keywords_in_urls(href_list, keywords, driver)

            # 返回元素的数量
            return len(href_list), keyword_counts[keywords[0]], keyword_counts[keywords[1]], keyword_counts[keywords[2]]

        except Exception as e:
            print(f"发生错误: {e}")
        finally:
            driver.quit()

    def search_hospital_articles_v3(self,hospital_name):
        # 设置 ChromeDriver 的路径
        chrome_service = Service(r'D:\\学习资料\\大四\\github\\GIS_ShiXi\Data\\datadriver\\chromedriver.exe')
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
                    page_count += 1
            # if pages!= "":
            #     print("{}:一共{}页:".format(hospital_name,len(pages)))
            # else:
            #     print("{}:一共1页:".format(hospital_name))
            # 搜索每个url查找关键词
            keywords = ["合作", "沟通", "进修"]
            keyword_counts, urls_with_keywords = self.search_keywords_in_urls(href_list, keywords, driver)

            # 返回元素的数量
            return len(href_list), keyword_counts[keywords[0]], keyword_counts[keywords[1]], keyword_counts[keywords[2]]

        except Exception as e:
            print(f"发生错误: {e}")
        finally:
            driver.quit()

    def search_hospital_articles_v2(self,hospital_name):
        # 设置 ChromeDriver 的路径
        chrome_service = Service(r'D:\\学习资料\\大四\\github\\GIS_ShiXi\Data\\datadriver\\chromedriver.exe')
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
            keywords = ["合作", "沟通", "进修"]
            keyword_counts, urls_with_keywords = self.search_keywords_in_urls(href_links, keywords, driver)

            # 返回元素的数量
            return len(list_items), keyword_counts[keywords[0]], keyword_counts[keywords[1]], keyword_counts[
                keywords[2]]
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

    def count_hospitals_from_file(self,file_path, output_excel_path):
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
                count, hezuo, goutong, jinxiu = self.search_hospital_articles_v4(name)
                results.append({"医院名称": name, "文章数量": count, "合作": hezuo, "沟通": goutong, "进修": jinxiu})
                print("{},文章数量:{},合作:{},沟通:{},进修:{}".format(name, count, hezuo, goutong, jinxiu))
            # 创建 DataFrame 并保存为 Excel 文件
            df = pd.DataFrame(results)
            df.to_excel(output_excel_path, index=False, engine='openpyxl')

            return total_count
        except FileNotFoundError:
            print("文件未找到")
            return 0

    def run(self):
        file_path = r"hospital_kouqiang.xlsx"
        output_excel_path = 'hospital_article_count_kouqiang.xlsx'
        total_count = self.count_hospitals_from_file(file_path, output_excel_path)
        print(f"总计搜索结果数量: {total_count}")

class HospitalD_spider():
    name = 'zhongyiyuan_spider'
    def __init__(self):
        self.file_path = '湖北省中医院高校医联体.txt'
        self.output_excel_path = '湖北省中医院高校医联体搜索结果.xlsx'
        self.output_excel_path1 = '湖北省中医院高校医联体交互强度表.xlsx'

    def search_keywords_in_urls(self,url_list, keywords, driver):
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

    def search_hospital_articles_v3(self,hospital_name, keywords, driver=None):
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
                return time_with_keywords, urls_with_keywords, 0, keyword_count
            else:
                for page in range(1, a_count - 1):  # 从第二个a标签到倒数第二个a标签
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

                    # 重新定位回第一页
                    driver.get(search_url)
                    time.sleep(2)  # 等待页面加载
                    # 定位到class为page的div元素
                    page_div = driver.find_element(By.CLASS_NAME, "page")

                    # 在page_div元素下找到所有a标签
                    a_elements = page_div.find_elements(By.TAG_NAME, "a")

            keyword_counts, urls_with_keywords, time_with_keywords = self.search_keywords_in_urls(href_list, keywords,
                                                                                             driver)

            # 返回元素的数量
            return time_with_keywords, urls_with_keywords, len(href_list), keyword_counts

        except Exception as e:
            print(f"发生错误: {e}")

    def count_hospitals_from_file(self,file_path, output_excel_path, output_excel_path1):
        # 设置 ChromeDriver 的路径
        chrome_service = Service('D:\\学习资料\\大四\\github\\GIS_ShiXi\Data\\datadriver\\chromedriver.exe')
        # 设置 ChromeOptions
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # 无头模式，不弹出浏览器窗口
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")

        # 启动浏览器
        driver = webdriver.Chrome(service=chrome_service, options=chrome_options)
        try:
            # 搜索每个url查找关键词
            keywords = [["合作", "协作"], ["沟通", "交流"], ["进修", "研讨", "坐诊"]]
            keys = ["合作", "沟通", "技术"]

            with open(file_path, 'r', encoding='utf-8') as file:
                hospital_names = file.readlines()

            hospital_names = [name.strip() for name in hospital_names]
            results = []
            results1 = []

            for name in hospital_names:
                time_jiaohu, urls_with_keywords, article_num, keyword_counts = self.search_hospital_articles_v3(name,
                                                                                                           keywords,
                                                                                                           driver)
                results1.append({"医院名称": name, "文章数量": article_num, "合作": keyword_counts[tuple(keywords[0])],
                                 "沟通": keyword_counts[tuple(keywords[1])],
                                 "技术": keyword_counts[tuple(keywords[2])]})
                print("共有{}篇新闻,其中合作{}篇、沟通{}篇、技术{}篇".format(article_num,
                                                                           keyword_counts[tuple(keywords[0])],
                                                                           keyword_counts[tuple(keywords[1])],
                                                                           keyword_counts[tuple(keywords[2])]))
                for i in range(len(keys)):
                    time_set = time_jiaohu.get(tuple(keywords[i]), set())
                    time_list = list(time_set)
                    url_set = urls_with_keywords.get(tuple(keywords[i]), set())
                    url_list = list(url_set)
                    for j in range(len(time_list)):
                        results.append(
                            {"医院名称": name, "交互类型": keys[i], "时间": time_list[j], "链接": url_list[j]})
                        print("{}:交互类型:{} 交互时间:{} 链接:{}".format(name, keys[i], time_list[j], url_list[j]))
                # print("{},文章数量:{},合作:{},沟通:{},进修:{}".format(name,count,hezuo,goutong,jinxiu))
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
    def run(self):
        self.count_hospitals_from_file(self.file_path, self.output_excel_path, self.output_excel_path1)

class HospitalE_spider():
    name = 'xiehe_spider'
    def __init__(self):
        self.path = 'hospital_xiehe.xlsx'
    # 读取excel文件
    def read_xls(self):
        df = pd.read_excel(self.path)
        self.hospital_names = df['医院名称'].tolist()

    def encode_base64(text):
        return base64.b64encode(text.encode('utf-8')).decode('utf-8')

    def search_hospital_articles(self, hospital_name):
        base64_name = self.encode_base64(hospital_name)
        search_url = f"https://www.whuh.com/searchlist.jsp?wbtreeid=1013&searchScope=0&newskeycode2={base64_name}&currentnum="

        articles_count = 0
        cooperation_count = 0
        communication_count = 0
        training_count = 0

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
                articles = articles_section.find_all('li')  # Find li elements within that section
            else:
                articles = []  # Handle case where the section is not found
            if not articles:
                break

            for article in articles:
                articles_count += 1
                article_text = article.get_text()

                # 统计关键词出现的文章数量
                if '合作' in article_text:
                    cooperation_count += 1
                if '沟通' in article_text:
                    communication_count += 1
                if '进修' in article_text:
                    training_count += 1

            # Step 4: 处理翻页 (Targeting pagination elements)
            pagination_section = soup.find('div', class_='pages wow fadeInUp')
            next_page = pagination_section.find('a', text='下页') if pagination_section else None
            if not next_page:
                break
            page += 1

        return {
            'hospital_name': hospital_name,
            'articles_count': articles_count,
            'cooperation_count': cooperation_count,
            'communication_count': communication_count,
            'training_count': training_count
        }

    def run(self):
        results = []
        for hospital_name in self.hospital_names:
            result = self.search_hospital_articles(hospital_name)
            results.append(result)
        # Step 6: 输出结果
        results_df = pd.DataFrame(results)
        results_df.to_excel('hospital_article_count_xiehe.xlsx', index=False)
        print("统计结果已保存至 hospital_article_stats.xlsx")

class HospitalF_spider():
    name = 'tongji_spider'
    # 类似定义...
    def __init__(self):
        self.keywords = [["合作", "协作"], ["沟通", "交流"], ["进修", "研讨", "坐诊"]]
        self.file_path = '同济.txt'
        self.output_excel_path = '同济医院搜索结果.xlsx'
        self.output_excel_path1 = '同济医院交互强度表.xlsx'

    def search_keywords_in_urls(self,url_list, keywords, driver):

        # 初始化计数器
        keyword_count = {tuple(kw): 0 for kw in keywords}  # 使用元组作为字典的键
        urls_with_keywords = {tuple(kw): set() for kw in keywords}
        time_with_keywords = {tuple(kw): set() for kw in keywords}
        keyword_occurrences = {tuple(kw): 0 for kw in keywords}

        try:
            for url in url_list:
                driver.get(url)
                time.sleep(3)

                article_elements = driver.find_elements(By.CLASS_NAME, "news_detail_article")
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
                            div_element = driver.find_element(By.CSS_SELECTOR, "div.news_detailMsg.clearFix")

                            # 定位到第三个 p 元素
                            third_p_element = div_element.find_elements(By.TAG_NAME, "p")[2]

                            # 获取文本并提取日期
                            text = third_p_element.text
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

    def search_hospital_articles_v3(self,hospital_name, keywords, driver=None):
        # # 设置 ChromeDriver 的路径
        chrome_service = Service('D:\\学习资料\\大四\\github\\GIS_ShiXi\Data\\datadriver\\chromedriver.exe')
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
            span_text = 0
            div_element = driver.find_element(By.CSS_SELECTOR, "div.search_keyword.clearFix")
            p_fr_elements = div_element.find_elements(By.CSS_SELECTOR, "p.fr")
            if p_fr_elements:
                p_fr_element = p_fr_elements[0]
                p_fr_element = div_element.find_element(By.CSS_SELECTOR, "p.fr")
                span_text = p_fr_element.find_element(By.TAG_NAME, "span").text
                print("一共搜索到{}篇文章".format(span_text))
            else:
                keyword_count = {tuple(kw): 0 for kw in keywords}  # 使用元组作为字典的键
                urls_with_keywords = {tuple(kw): set() for kw in keywords}
                time_with_keywords = {tuple(kw): set() for kw in keywords}
                print("一共搜索到0篇文章")
                return time_with_keywords, urls_with_keywords, 0, keyword_count

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
            for page in range(2, page_value + 1):
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

            keyword_counts, urls_with_keywords, time_with_keywords = self.search_keywords_in_urls(href_list, keywords,
                                                                                             driver)

            # 返回元素的数量
            return time_with_keywords, urls_with_keywords, int(span_text), keyword_counts

        except Exception as e:
            print(f"发生错误: {e}")

    def count_hospitals_from_file(self,file_path, output_excel_path, output_excel_path1):
        # 设置 ChromeDriver 的路径
        chrome_service = Service('D:\\学习资料\\大四\\github\\GIS_ShiXi\Data\\datadriver\\chromedriver.exe')
        # 设置 ChromeOptions
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # 无头模式，不弹出浏览器窗口
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")

        # 启动浏览器
        driver = webdriver.Chrome(service=chrome_service, options=chrome_options)
        try:
            # 搜索每个url查找关键词
            keywords = [["合作", "协作"], ["沟通", "交流"], ["进修", "研讨", "坐诊"]]
            keys = ["合作", "沟通", "技术"]

            with open(file_path, 'r', encoding='utf-8') as file:
                hospital_names = file.readlines()

            hospital_names = [name.strip() for name in hospital_names]
            results = []
            results1 = []

            for name in hospital_names:
                time_jiaohu, urls_with_keywords, article_num, keyword_counts = self.search_hospital_articles_v3(name,
                                                                                                           keywords,
                                                                                                           driver)
                results1.append({"医院名称": name, "文章数量": article_num, "合作": keyword_counts[tuple(keywords[0])],
                                 "沟通": keyword_counts[tuple(keywords[1])],
                                 "技术": keyword_counts[tuple(keywords[2])]})
                print("共有{}篇新闻,其中合作{}篇、沟通{}篇、技术{}篇".format(article_num,
                                                                           keyword_counts[tuple(keywords[0])],
                                                                           keyword_counts[tuple(keywords[1])],
                                                                           keyword_counts[tuple(keywords[2])]))
                for i in range(len(keys)):
                    time_set = time_jiaohu.get(tuple(keywords[i]), set())
                    time_list = list(time_set)
                    url_set = urls_with_keywords.get(tuple(keywords[i]), set())
                    url_list = list(url_set)
                    for j in range(len(time_list)):
                        results.append(
                            {"医院名称": name, "交互类型": keys[i], "时间": time_list[j], "链接": url_list[j]})
                        print("{}:交互类型:{} 交互时间:{} 链接:{}".format(name, keys[i], time_list[j], url_list[j]))
                # print("{},文章数量:{},合作:{},沟通:{},进修:{}".format(name,count,hezuo,goutong,jinxiu))
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

    def run(self):
        self.count_hospitals_from_file(self.file_path, self.output_excel_path, self.output_excel_path1)

# 获取医院爬虫类
def get_spider_by_hospital(hospital_name):
    spiders = {
        '武汉大学人民医院': HospitalA_spider,
        '武汉大学中南医院': HospitalB_spider,
        '武汉大学口腔医院': HospitalC_spider,
        '湖北省中医院': HospitalD_spider,
        '华中科技大学同济医学院附属协和医院': HospitalE_spider,
        '华中科技大学同济医学院附属同济医院': HospitalF_spider
    }
    return spiders.get(hospital_name)

# 运行爬虫
def run_crawlers(hospital_list):
    for hospital_name in hospital_list:
        if hospital_name=='武汉大学人民医院':
            print(f'正在运行{hospital_name}爬虫。')
            renmin=HospitalA_spider()
            renmin.run()
        elif hospital_name=='武汉大学中南医院':
            print(f'正在运行{hospital_name}爬虫。')
            zhongnan=HospitalB_spider()
            zhongnan.run()
        elif hospital_name=='武汉大学口腔医院':
            print(f'正在运行{hospital_name}爬虫。')
            kouqiang=HospitalC_spider()
            kouqiang.run()
        elif hospital_name=='湖北省中医院':
            print(f'正在运行{hospital_name}爬虫。')
            zhongyiyuan=HospitalD_spider()
            zhongyiyuan.run()
        elif hospital_name=='华中科技大学同济医学院附属协和医院':
            print(f'正在运行{hospital_name}爬虫。')
            xiehe=HospitalE_spider()
            xiehe.run()
        elif hospital_name=='华中科技大学同济医学院附属同济医院':
            print(f'正在运行{hospital_name}爬虫。')
            tongji=HospitalF_spider()
            tongji.run()
        else:
            print('没有找到相应的爬虫。')

# 从 Excel 文件读取医院列表
def read_main_hospital_list(file_path):
    df = pd.read_excel(file_path)
    main_hospital_list = df['医院'].tolist()
    return main_hospital_list

if __name__ == "__main__":
    hospital_list = read_main_hospital_list('医联体名单.xlsx')
    print('医联体名单如下：')
    print(hospital_list)
    run_crawlers(hospital_list)
