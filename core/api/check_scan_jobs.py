"""Live scan API acceptance; run with the local launcher active."""
import io, json, time, urllib.request, urllib.error, zipfile
BASE='http://127.0.0.1:8000'
def call(path, body=None, kind='application/json', expected=200):
    data = body if isinstance(body,bytes) else json.dumps(body).encode() if body is not None else None
    try:
        response=urllib.request.urlopen(urllib.request.Request(BASE+path,data=data,headers={'Content-Type':kind}))
    except urllib.error.HTTPError as e: response=e
    assert response.status == expected, (response.status, response.read())
    return json.loads(response.read())
def archive(name, data='import hashlib\nhashlib.md5(b"demo")'):
    out=io.BytesIO()
    with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z: z.writestr(name,data)
    return out.getvalue()
def finish(job):
    for _ in range(100):
        result=call('/api/scans/'+job['scanId'])
        if result['status']!='running':
            assert result['status']=='done',result
            return result
        time.sleep(.1)
    raise AssertionError('Scan timeout')
result=finish(call('/api/projects/p_demo/scans',{'source':'demo'},expected=202))
assert result['score']==38 and len(result['findings'])==8 and len(result['stages'])==5
assert call('/api/projects/p_demo')['scan']['id']==result['id']
call('/api/projects/missing',expected=404)
call('/api/projects/p_demo/scans',{'source':'unsupported'},expected=422)
p=call('/api/projects',{'name':'ZIP acceptance'})['id']
result=finish(call(f'/api/projects/{p}/scans',archive('app.py'),'application/zip',202))
assert result['source']=='zip' and result['customerCount'] is None
call(f'/api/projects/{p}/scans',archive('../escape.py'),'application/zip',400)
call(f'/api/projects/{p}/scans',archive('large.py','x'*(21*1024*1024)),'application/zip',400)
call(f'/api/projects/{p}/scans',b'x'*(20*1024*1024+1),'application/zip',413)
call(f'/api/projects/{p}/scans',b'not zip','application/zip',400)
print('PASS: live stages, findings, ZIP source, missing project, unsupported input, traversal and size limits')
