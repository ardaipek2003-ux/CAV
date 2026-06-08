import urllib.request
import json
import ssl

req = urllib.request.Request(
    'http://127.0.0.1:8000/quote',
    data=json.dumps({'buyer_id':'06115f1c-6392-487f-85cf-06e72664aeea', 'crop_type':'TOMATO', 'quantity_kg':10000}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
try:
    res = urllib.request.urlopen(req, context=ssl._create_unverified_context())
    print(res.read().decode())
except urllib.error.HTTPError as e:
    print(e.read().decode())
