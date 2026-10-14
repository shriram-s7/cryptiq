"""Print/start a free temporary reviewer link. Keep this computer awake and online."""
from pathlib import Path
import json, os, re, subprocess, sys, time
from urllib.request import urlopen
ROOT=Path(__file__).resolve().parents[2]
RUNTIME=ROOT/'core/.runtime'

def ready(url):
    try:
        with urlopen(url,timeout=3) as response: return response.status==200
    except Exception: return False

def background(args, log, env=None):
    with (RUNTIME/log).open('w',encoding='utf-8') as output:
        return subprocess.Popen(args,cwd=ROOT,stdin=subprocess.DEVNULL,stdout=output,stderr=subprocess.STDOUT,
                                env=env,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)

def main():
    RUNTIME.mkdir(exist_ok=True)
    if not ready('http://localhost:8000/api/health'):
        background([sys.executable,str(ROOT/'core/scripts/dev.py')],'public-services.log',dict(os.environ,CRYPTIQ_PUBLIC_DEMO='1'))
        for _ in range(60):
            if ready('http://localhost:8000/shop/health'):break
            time.sleep(1)
    if not ready('http://localhost:8000/shop/health'):
        raise SystemExit('Public gateway unavailable. Start the Core launcher with CRYPTIQ_PUBLIC_DEMO=1 after stopping its existing services. See docs/PUBLIC_DEMO.md.')
    binary=RUNTIME/'bin/cloudflared.exe'
    if not binary.exists():
        raise SystemExit('Install the official cloudflared Windows binary at core/.runtime/bin/cloudflared.exe; see docs/PUBLIC_DEMO.md.')
    process=background([str(binary),'tunnel','--url','http://127.0.0.1:8000','--protocol','http2','--no-autoupdate'],'public-tunnel.log')
    for _ in range(60):
        if process.poll() is not None:raise SystemExit('Tunnel stopped; inspect core/.runtime/public-tunnel.log.')
        match=re.search(r'https://[a-z0-9-]+\.trycloudflare\.com',(RUNTIME/'public-tunnel.log').read_text(encoding='utf-8',errors='replace'))
        if match:
            url=match.group(0)+'/?access='+(RUNTIME/'public-access.key').read_text().strip()
            (RUNTIME/'public-demo-link.txt').write_text(url+'\n',encoding='utf-8')
            (RUNTIME/'public-tunnel-process.json').write_text(json.dumps({'pid':process.pid,'url':match.group(0)}))
            print('Reviewer link (keep private):\n'+url+'\nKeep this PC and the services running. The address changes on tunnel restart.')
            return
        time.sleep(1)
    raise SystemExit('Tunnel address not ready; inspect public-tunnel.log.')

if __name__=='__main__':main()
