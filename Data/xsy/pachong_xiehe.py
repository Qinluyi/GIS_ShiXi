import requests
from bs4 import BeautifulSoup
import pandas as pd
import base64
import urllib.parse


# Function to encode the hospital name in Base64
def encode_base64(text):
    return base64.b64encode(text.encode('utf-8')).decode('utf-8')


# Step 1: 读取 Excel 文件，获取医院名称
df = pd.read_excel('hospital_xiehe.xlsx')
hospital_names = df['医院名称'].tolist()


# Step 2: 定义爬虫函数
def search_hospital_articles(hospital_name):
    base64_name = encode_base64(hospital_name)
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


# Step 5: 爬取所有医院的文章并统计
results = []
for hospital_name in hospital_names:
    result = search_hospital_articles(hospital_name)
    results.append(result)

# Step 6: 输出结果
results_df = pd.DataFrame(results)
results_df.to_excel('hospital_article_count_xiehe.xlsx', index=False)
print("统计结果已保存至 hospital_article_stats.xlsx")
