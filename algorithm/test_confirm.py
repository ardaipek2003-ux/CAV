import urllib.request
import json
import ssl

req = urllib.request.Request(
    'http://127.0.0.1:8000/confirm',
    data=json.dumps({'order_id':'c3c5746f-c255-4f7f-a0e3-414ee7085ffc', 'buyer_id':'06115f1c-6392-487f-85cf-06e72664aeea'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
try:
    with urllib.request.urlopen(req, context=ssl._create_unverified_context()) as response:
        print(response.read().decode())
except urllib.error.HTTPError as e:
    print(e.read().decode())
