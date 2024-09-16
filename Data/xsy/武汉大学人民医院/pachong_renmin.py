import pandas as pd
import requests
from bs4 import BeautifulSoup

# 读取 Excel 文件
file_path = r"D:\pycharm file\pachong\hospital_renmin.xlsx"
hospitals_df = pd.read_excel(file_path)

# 获取所有医院的名称列表
hospital_names = hospitals_df['医院名称'].tolist()

# 统计文章中关键词出现的次数
keywords = ['合作', '沟通', '技术']

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
    # 关键词映射：将多个关键词映射到同一个类别
    keyword_mapping = {
        "合作": ["合作", "协作"],
        "沟通": ["沟通", "交流"],
        "技术": ["研讨", "进修", "坐诊"]
    }

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        article_text = soup.get_text()
        # 检查每个关键词是否存在于文章中
        for main_keyword, sub_keywords in keyword_mapping.items():
            for sub_keyword in sub_keywords:
                sub_keyword_lower = sub_keyword.lower()
                if sub_keyword_lower in article_text:
                    keyword_found[main_keyword] = True
    return keyword_found

# 为每家医院统计文章数量和关键词统计
hospital_article_count = {}

for hospital in hospital_names:
    article_links = search_hospital_articles(hospital)
    total_keywords_count = {keyword: 0 for keyword in keywords}
    if not article_links:  # 如果没有文章链接，则设置文章数量为0
        hospital_article_count[hospital] = {
            '文章数量': 0,
            **{keyword: 0 for keyword in keywords}  # 所有关键词出现次数也为0
        }
    else:
        for article_link in article_links:
            keyword_count = count_keywords_in_article(article_link)
            for keyword in keywords:
                total_keywords_count[keyword] += keyword_count[keyword]
        hospital_article_count[hospital] = {
            '文章数量': len(article_links),
            **total_keywords_count  # 将关键词统计结果加入字典
        }
    print(f"{hospital}: {len(article_links)} 篇文章, 关键词统计: {total_keywords_count}")

# 保存结果到 Excel 文件
result_df = pd.DataFrame.from_dict(hospital_article_count, orient='index')
result_df.reset_index(inplace=True)
result_df.columns = ['医院', '文章数量', '合作', '沟通', '技术']
result_df.to_excel('hospital_article_count_remnin.xlsx', index=False)
