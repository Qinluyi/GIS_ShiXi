import requests

def search_bing(query):
    api_key = "your_bing_api_key"
    search_url = "https://api.bing.microsoft.com/v7.0/search"
    headers = {"Ocp-Apim-Subscription-Key": api_key}
    params = {"q": query, "textDecorations": True, "textFormat": "HTML"}

    response = requests.get(search_url, headers=headers, params=params)
    response.raise_for_status()
    search_results = response.json()
    
    # 获取搜索结果的URL列表
    links = [result['url'] for result in search_results.get("webPages", {}).get("value", [])]
    
    return links

from bs4 import BeautifulSoup

def fetch_web_content(url):
    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        return soup.get_text()
    else:
        return None

import spacy

# 加载spaCy模型（中文模型或者中文定制模型）
nlp = spacy.load("zh_core_web_sm")

def extract_hospital_names(text):
    # 对网页内容进行NLP分析
    doc = nlp(text)
    hospital_names = []
    
    for entity in doc.ents:
        if entity.label_ == "ORG":  # "ORG" 用于识别机构名称
            hospital_names.append(entity.text)
    
    return hospital_names

def identify_healthcare_partners(hospital_names):
    if len(hospital_names) >= 2:
        # 假设网页中提到两个或多个医院，可能是医联体的合作医院
        partners = [(hospital_names[i], hospital_names[i+1]) for i in range(len(hospital_names)-1)]
        return partners
    else:
        return []

def main():
    query = "湖北省 医联体"
    # 1. 使用 Bing 搜索 API 获取网页链接
    links = search_bing(query)
    
    for link in links:
        # 2. 抓取每个网页内容
        content = fetch_web_content(link)
        
        if content:
            # 3. 从网页内容中提取医院名称
            hospital_names = extract_hospital_names(content)
            
            # 4. 推测医联体的双方医院
            partners = identify_healthcare_partners(hospital_names)
            
            if partners:
                print(f"网页链接: {link}")
                for partner in partners:
                    print(f"可能的医联体医院: {partner[0]} 和 {partner[1]}")

