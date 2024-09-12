import requests
from bs4 import BeautifulSoup
import json

if __name__ == '__main__':
    url = 'https://www.yixue.com/%E6%AD%A6%E6%B1%89%E5%B8%82%E5%8C%BB%E9%99%A2%E5%88%97%E8%A1%A8'
    res = requests.get(url, headers={'User-Agent': "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)"})
    soup = BeautifulSoup(res.text, "html.parser")
    first_div = soup.find("div", attrs={"class": "mw-parser-output"})
    lists=first_div.findAll("ul")[3].findAll("li",recursive=False)
    hospital_info=[]
    for list in lists:
        dic={}
        name=list.find("b").find("a").string
        dic['医院名称']=name
        infos=list.find("ul").findAll("li",recursive=False)
        # print(infos[0].text[5:])
        for info in infos:
            dic[info.text[:4]]=info.text[5:]
        print(dic)
        hospital_info.append(dic)
    filename = 'hospital_info.json'
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(hospital_info, f, ensure_ascii=False, indent=4)
