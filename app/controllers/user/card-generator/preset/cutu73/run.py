import csv
import subprocess
import sys
import json
from subprocess import PIPE
import urllib.request


def getjson(path):
    url = urllib.request.urlopen("http://www.cutu73.ml" + path)
    return json.loads(url.read().decode())


configselector = getjson("/template/_main.json")
rows = json.loads(''.join(sys.stdin))

if type(rows) != list:
    rows = [rows]

for row in rows:
    config = getjson("/template/_config.json")
    background = None
    for k in configselector:
        if k in row.values() or k == '*':
            background = configselector[k]
            # getjson(f'/template/{configselector[k]}.json')
            break
    # if config is None:
    #     print(configselector)
    #     print(row)
    # assert config is not None

    newconfig = json.dumps(config)
    for a, b in [("{filename}", "รหัสนิสิต"), ("{name}", "ชื่อเล่น"),
                 ("{faculty}", "_facultyexl"), ("{year}", "ชั้นปี"),
                 ("{position}", "ตำแหน่ง"), ("{role}", "ฝ่าย"),
                 ("{image}", "image")]:
        newconfig = newconfig.replace(a, str(row[b]))

    newconfig = newconfig.replace("{background}", background)

    # print('config is')
    print(newconfig)
    # ps = subprocess.Popen(["python3", "../../main.py"],
    #                       stdout=PIPE,
    #                       stdin=PIPE,
    #                       stderr=PIPE)
    # # print(newconfig)
    # out, err = ps.communicate(input=newconfig.encode())
    # print('config:', config)
    # print('newconfig:', newconfig)
    # if out:
    #     print('out:', out.decode("utf-8"))
    # if err:
    #     print('err:', err.decode("utf-8"))
    # ps.stdin.close()
