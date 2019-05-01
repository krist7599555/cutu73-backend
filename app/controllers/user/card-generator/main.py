from PIL import Image, ImageFont, ImageDraw, ImageFilter
import requests
from io import BytesIO, StringIO
import json
from pprint import pprint
from itertools import groupby, chain, product, count
from operator import itemgetter
from collections import defaultdict
import pathlib
import sys
import ast
import subprocess

# from StringIO import StringIO

DEBUG = False

files = sys.argv[1:]
if not files:
    # print("no file select: config.json (default)", file=sys.stderr)
    # files = ['config.json']
    print("use stdin")
    files = ["/dev/stdin"]

for filenumber, file in enumerate(files, 1):
    try:
        config = list(open(file))
    except Exception as e:
        if file == '/dev/stdin':
            config = list(sys.stdin)
        else:
            print(filenumber, "open error file:", file, file=sys.stderr)
            continue

    config = [ln for ln in map(str.strip, config) if ln[:2] != '//']
    config = '\n'.join(config).replace("\'", "\"")
    print(config)
    # config = StringIO(config)
    # read json
    jsonconfig = json.loads(config)
    # jsonconfig = ast.literal_eval(config)
    ddic = defaultdict(list)
    for typ, lis in groupby(jsonconfig, itemgetter('type')):
        ddic[typ] = list(lis)
    for bg in ddic['background']:
        print('background', bg['value'])
        req = requests.get(bg['value'])
        print(req)
        # canvas = Image.open(bg['value'], "r")
        ff = BytesIO(req.content) if "http" in bg['value'] else bg['value']
        canvas = Image.open(ff, "r")
        if canvas.mode != 'RGBA':
            canvas = canvas.convert('RGBA')

        for elem in jsonconfig:
            if elem['type'] == 'background': continue
            if elem['type'] == 'output': continue
            print(elem['type'], elem['value'])
            if elem['type'] == "text":

                # text
                # ending or starting with ิ ์ will cause error (fix by adding head/tail space)
                elem["value"] = ' ' + elem["value"] + ' '

                # calculate draw position
                for i in count(0):
                    lmx = elem['size'].get('x', bg['size']['x'])
                    lmy = elem['size'].get('y', bg['size']['y'])
                    fnt = ImageFont.truetype(elem["font"]["family"],
                                             elem["font"]["size"] - i)
                    szx, szy = fnt.getsize(elem["value"])
                    if szx <= lmx and szy <= lmy:
                        break

                draw = ImageDraw.Draw(canvas)
                x = elem["position"]["x"]
                y = elem["position"]["y"]
                alignx = elem["align"]["x"]
                aligny = elem["align"]["y"]
                for idx, align in enumerate(["left", "center", "right"]):
                    if alignx == align:
                        x -= (szx / 2) * idx
                for idx, align in enumerate(["top", "center", "bottom"]):
                    if aligny == align:
                        y -= (szy / 2) * idx

                # drop shadow
                if 'dropshadow' in elem:
                    offset = elem["dropshadow"]["offset"]
                    textimg = Image.new('RGBA',
                                        (szx + 2 * offset, szy + 2 * offset),
                                        "#ffffff00")
                    textcanvas = ImageDraw.Draw(textimg)
                    for outx, outy in product([-15, 0, 15],
                                              repeat=2):  # text outline
                        textcanvas.text((offset + outx, offset + outy),
                                        elem["value"],
                                        font=fnt,
                                        fill=elem["dropshadow"]["color"])

                    textimg = textimg.filter(
                        ImageFilter.GaussianBlur(
                            elem["dropshadow"]["blur"]))  # blur

                    # textimg.save('tmp.png') # show label
                    canvas.paste(textimg, (
                        int(x - offset + elem["dropshadow"]["position"]["x"]),
                        int(y - offset + elem["dropshadow"]["position"]["y"])),
                                 textimg)

                draw.text((x, y),
                          elem["value"],
                          font=fnt,
                          fill=elem["font"]["color"])

                # red boundary rectangle
                if DEBUG:
                    rect = [(x, y), (x + szx, y), (x + szx, y + szy),
                            (x, y + szy), (x, y)]
                    draw.line(rect, fill="red", width=5)
                pass

            if elem["type"] == "image" or elem["type"] == "img":

                x1 = elem["position"]["x1"]
                x2 = elem["position"]["x2"]
                y1 = elem["position"]["y1"]
                y2 = elem["position"]["y2"]
                xsz = x2 - x1
                ysz = y2 - y1
                href = elem["value"]

                img = Image.open(
                    BytesIO(requests.get(href).content) if "http" in
                    href else open(href, "rb"))

                if img.mode != 'RGBA':
                    img = img.convert('RGBA')

                w, h = img.size
                img = img.resize((w * 4, h * 4))
                w, h = img.size

                if elem["ratio"]:
                    if w >= xsz:
                        dif = xsz / w
                        w *= dif
                        h *= dif
                    if h >= ysz:
                        dif = ysz / h
                        w *= dif
                        h *= dif
                else:
                    w = szx
                    h = szy
                w, h = int(w), int(h)
                img = img.resize((w, h))

                if elem["gradient"]:
                    gradient = Image.new('L', (255, 1), color=0xFF)
                    for x in range(255):
                        gradient.putpixel((x, 0),
                                          int(min(255, max(0, x * 1.3 - 130))))
                    alpha = gradient.resize((255, 255))
                    black_im = Image.new(
                        'RGBA', (255, 255), color='#752a7c')  # i.e. black
                    black_im.putalpha(alpha)
                    black_im = black_im.rotate(-90).resize((w, h))
                    img = Image.alpha_composite(img, black_im)
                # alignx = elem["align"]["x"]
                # aligny = elem["align"]["y"]
                # for idx, align in enumerate(["left", "center", "right"]):
                #     if alignx == align:
                #         x1 -= (szx - w) // 2 * idx
                # for idx, align in enumerate(["top", "center", "bottom"]):
                #     if aligny == align:
                #         y1 -= (szy - h) // 2 * idx

                canvas.paste(img, (x1, y1))

        # output setting
        output = ddic["output"][0]
        output['directory'] = output.get('directory', '.')
        pathlib.Path(output["directory"]).mkdir(parents=True, exist_ok=True)
        canvas.convert('RGB').save(output["directory"] + "/" + output["name"])
        print(filenumber, output["directory"] + "/" + output["name"])
