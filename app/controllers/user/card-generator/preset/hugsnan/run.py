'https://docs.google.com/spreadsheets/d/11fWNlLBUcTq4kLC2k08QpOCOVt6REhAR2O1X-wYAjsw/edit#gid=663685380'

import csv
import subprocess
from subprocess import PIPE

config = ''.join(open('./config.json'))
print(config)
with open('./data.csv') as csvfile:
    reader = csv.DictReader(csvfile)
    for rownumber, row in enumerate(reader, 1):
        print('no.', rownumber)
        uid = row['รหัสนิสิต']
        nme = row["ชื่อเล่น"]
        g6 = row['g6']
        g8 = row['g8']
        faculty = row['คณะ']
        year = row['ชั้นปี']
        newconfig = config.replace('{filename}', uid).replace('{name}', nme).replace('{g6}', g6).replace('{g8}', g8).replace('{faculty}', faculty).replace('{year}', year)

        if nme in ['มะเหมี่ยว', 'กล้วยฉาบ']:
            newconfig = newconfig.replace('"y": 570', '"y": 640')

        ps = subprocess.Popen(["python3", "../../main.py"],
                              stdout=PIPE,
                              stdin=PIPE,
                              stderr=PIPE)
        # print(newconfig)
        out, err = ps.communicate(input=newconfig.encode())
        if out:
            print('out:', out.decode("utf-8"))
        if err:
            print('err:', err.decode("utf-8"))
        ps.stdin.close()
