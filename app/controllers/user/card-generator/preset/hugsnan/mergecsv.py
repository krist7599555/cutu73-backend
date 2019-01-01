import csv
raw = csv.DictReader(open('./rawdata.csv'))
g6 = csv.DictReader(open('./group6.csv'))
g8 = csv.DictReader(open('./group8.csv'))
ls = list(raw)
print(ls[0]['ลำดับที่'])
# writer = csv.DictWriter(raw, fieldnames=["g6", "g8"])
ddic = dict()
for atr, group in [("g6", g6), ("g8", g8)]:
  for row in group:
    ok = list(range(len(ls)))
    for i, j in [["ชื่อเล่น", "nickname"], ['คณะ', 'faculty'], ['เพศ', 'gender']]:
      if len(ok) != 1:
        ok = [k for k in ok if ls[k][i] == row[j]]
      if len(ok) == 0:
        print("Error after filter", i, j)
        print('Not found', row)
    
    assert len(ok) == 1
    ddic[atr + '-' + str(ls[ok[0]]['รหัสนิสิต'])] = row['group']

import pandas as pd
csv_input = pd.read_csv('./rawdata.csv')
csv_input['รหัสนิสิต'] = csv_input['รหัสนิสิต'].astype(str)
uoids = csv_input['รหัสนิสิต']
for g in ["g6", "g8"]:
  csv_input[g] = [ddic.get(g + '-' + str(sid), None) for sid in uoids]
  # for i, r in csv_input.iterrows():
  #   if r[g] == None:
  #     print(r)
csv_input["g6"] = csv_input["g6"].map(lambda g: chr(ord('A') + int(g) - 1) if g is not None else '*')
csv_input.to_csv('data.csv', index=False)
