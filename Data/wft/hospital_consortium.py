import pandas as pd

# 读取三级医院名单表格
df = pd.read_excel('Data\wft\hospital_list.xlsx')
hospital_names = df['医院名称'].tolist()

import requests
from bs4 import BeautifulSoup

# 进行Bing搜索
def search_bing(query):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    url = f'https://www.bing.com/search?q={query}'
    response = requests.get(url, headers=headers)
    return response.text

# 解析搜索结果
def parse_search_results(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    results = []
    for result in soup.find_all('li', class_='b_algo'):
        title = result.find('h2').text
        link = result.find('a')['href']
        snippet = result.find('p').text
        results.append((title, link, snippet))
    return results

def identify_hospitals(results, hospital_names):
    identified = []
    for title, link, snippet in results:
        for hospital in hospital_names:
            if hospital in title or hospital in snippet:
                identified.append((hospital, link))
                break
    return identified

# 查询武汉市医联体信息
query = "武汉市 医联体"
html_content = search_bing(query)
search_results = parse_search_results(html_content)

# 识别主体医院和成员医院
identified_hospitals = identify_hospitals(search_results, hospital_names)

# 保存识别结果
with open('Data\wft\identified_hospitals.csv', 'w') as f:
    f.write('主体医院,成员医院,链接\n')
    for hospital, link in identified_hospitals:
        f.write(f'{hospital},{link}\n')
