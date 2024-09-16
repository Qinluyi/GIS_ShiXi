import pandas as pd
import requests
from bs4 import BeautifulSoup

# 读取 Excel 文件
file_path = r"Data\xsy\武汉大学人民医院\hospital_renmin.xlsx"
hospitals_df = pd.read_excel(file_path)

# 获取所有医院的名称列表
hospital_names = hospitals_df['医院名称'].tolist()

# 统计文章中关键词出现的次数
keywords = ["合作", "协作","沟通","交流","研讨","进修","坐诊"]

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

def get_article_details(article_url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
    }
    response = requests.get(article_url, headers=headers)
    article_details = {
        'date': '未知',
        'keywords': {keyword: False for keyword in keywords}
    }
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract publication date
        date_div = soup.find("div", class_="pull-left infoleft")
        if date_div:
            # Directly find all spans in this div
            spans = date_div.find_all("span")
            if len(spans) > 1:
                # The second span contains the publication date
                date_span = spans[-1]
                date = date_span.find("i").get_text(strip=True)
                article_details['date'] = date
        
        # Extract article text and count keywords
        article_text = soup.get_text()
        for keyword in keywords:
            if keyword in article_text:
                article_details['keywords'][keyword] = True

    return article_details



# 为每家医院统计文章数量和关键词统计
hospital_article_details = []

for hospital in hospital_names:
    article_links = search_hospital_articles(hospital)
    if not article_links:  # 如果没有文章链接，则设置文章数量为0
        continue
    else:
        for article_link in article_links:
            article_details = get_article_details(article_link)
            
            # Determine the interaction type based on keywords found
            interaction_types = []
            if article_details['keywords'].get("合作", False) or article_details['keywords'].get("协作", False):
                interaction_types.append("合作")
            if article_details['keywords'].get("沟通", False) or article_details['keywords'].get("交流", False):
                interaction_types.append("沟通")
            if article_details['keywords'].get("研讨", False) or article_details['keywords'].get("坐诊", False) or article_details['keywords'].get("进修", False):
                interaction_types.append("技术")
            
            # Append only once per article, even if multiple interaction types are found
            if interaction_types:
                for interaction_type in interaction_types:
                    hospital_article_details.append({
                        '医院名称': hospital,
                        '交互类型': interaction_type,
                        '时间': article_details['date'],
                        '链接': article_link
                    })

# 保存结果到 Excel 文件
result_df = pd.DataFrame(hospital_article_details)
result_df.to_excel(r"Data\xsy\武汉大学人民医院\武汉大学人民医院交互明细.xlsx", index=False)
