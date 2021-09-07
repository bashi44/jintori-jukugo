# モジュールをインポート
from bs4 import BeautifulSoup
import requests
import random
import time
import json
import re

# システムによるアクセスを検知されないよう、海外のプロキシサーバーを経由してアクセス、ページ遷移後にランダムな秒数待機
# プロキシサーバーの設定
def get_proxy():
  proxy_list = [
    os.environ['PROXY1'],
    os.environ['PROXY2'],
    os.environ['PROXY3'],
    os.environ['PROXY4'],
    os.environ['PROXY5'],
    os.environ['PROXY6'],
    os.environ['PROXY7'],
    os.environ['PROXY8'],
    os.environ['PROXY9'],
    os.environ['PROXY10'],
  ]
  proxy_port = os.environ['PROXY_PORT']
  proxy_username = os.environ['PROXY_USERNAME']
  proxy_password = os.environ['PROXY_PASSWORD']
  random_proxy = 'http://' + proxy_username + ':' + proxy_password + '@' + random.choice(proxy_list) + ':' + proxy_port
  proxy_set = {'http': random_proxy, 'https': random_proxy}
  return proxy_set
# 待機時間を配列で定義
count = ['3', '4', '5', '6', '7', '8']

# バリデーション
def validation():
  # 言葉・読み・urlを取得
  words = soup.select('.col-right > .example_sentence > .content_list > li > a > .title')
  links = soup.select('.col-right > .example_sentence > .content_list > li > a')
  for (word, link) in zip(words, links):
    obj = {}
    word = word.text
    link = link.get('href')
    words = list(word)
    kotobas = []
    yomies = []
    # 漢字を抽出
    for i in range(0, len(words)):
      if words[i] == '【':
        for j in range(i + 1, len(words)):
          if words[j] == '〔' or words[j] == '／' or words[j] == '】':
            break
          else:
            kotobas.append(words[j])
      # 読み方を抽出
      if words[i] != '【':
        yomies.append(words[i])
      else:
        break
    # 文字列に戻す
    obj['kotoba'] = ''.join(kotobas)
    obj['yomi'] = ''.join(yomies)
    obj['link'] = link
    word_count = len(obj['kotoba'])
    # 漢字2文字以上の熟語を保存
    if word_count >= 2 and re.compile(r'^[\u4E00-\u9FD0]+$').fullmatch(obj['kotoba']):
      lists.append(obj)

# トップページへアクセス
top_url = 'https://dictionary.goo.ne.jp'
res = requests.get(top_url, proxies = get_proxy())
soup = BeautifulSoup(res.content, 'html.parser')
time.sleep(5)

# あ ~ ぽまでのリンクを取得
results = soup.select('.pt-0 > .content-row > div:nth-of-type(1) > .content-index > .index-row > ol > li > a')
# あ ~ ぽまでのページを巡回
for i, result in enumerate(results):
  # スクレイピングで取得したデータを格納する配列
  lists = []
  # ファイルを作成
  f = open(f'words/words{i}.json', 'w')
  f.close()
  # 次のページへアクセスし、DOMを取得
  next_word = top_url + result.get('href')
  res = requests.get(next_word, proxies = get_proxy())
  time.sleep(int(random.choice(count)))
  soup = BeautifulSoup(res.content, 'html.parser')
  # 各頭文字の個別ページ数を取得
  pages = soup.select_one('.last-num > a')
  # ページが複数の場合
  if pages != None:
    pages = pages.text
    for page in range(2, int(pages) + 1):
      validation()
      # 次のページへアクセスし、DOMを取得
      next_page = soup.select_one('.nav-paging-in > span + li > a')
      href = top_url + next_page.get('href')
      res = requests.get(href, proxies = get_proxy())
      time.sleep(int(random.choice(count)))
      soup = BeautifulSoup(res.content, 'html.parser')
      # テスト用に現在のページとアクセスしているプロキシサーバーを表示
      print(result.text + ':' + next_page.text)
      print(get_proxy())
  # ページが単数の場合
  else:
    validation()
    # テスト用に現在のページとアクセスしているプロキシサーバーを表示
    print(result.text + ':' + next_page.text)
    print(get_proxy())
  # jsonファイルに書き込み
  with open(f'/Applications/MAMP/htdocs/jintori/words/words{i}.json', 'w', encoding='utf-8') as save:
    json.dump(lists, save, indent=2, ensure_ascii = False)
