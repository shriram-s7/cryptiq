"""Single-origin, access-link protected public demo; local services remain available."""
from pathlib import Path
import hmac
import secrets
from urllib.parse import urlencode
from fastapi import Request
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, RedirectResponse
from starlette.middleware.wsgi import WSGIMiddleware
from starlette.staticfiles import StaticFiles

ROOT = Path(__file__).resolve().parents[2]


def install(app):
    from app import create_app
    secret_file = ROOT / 'core/.runtime/public-access.key'
    secret_file.parent.mkdir(parents=True, exist_ok=True)
    try:
        with secret_file.open('x', encoding='utf-8') as stream:
            stream.write(secrets.token_urlsafe(32))
    except FileExistsError:
        pass
    secret = secret_file.read_text(encoding='utf-8').strip()

    @app.middleware('http')
    async def demo_access(request: Request, call_next):
        local = request.url.hostname in ('localhost', '127.0.0.1')
        if not local:
            supplied = request.query_params.get('access', '')
            if supplied and hmac.compare_digest(supplied, secret):
                query = urlencode([(k,v) for k,v in request.query_params.multi_items() if k != 'access'])
                response = RedirectResponse(request.url.path + ('?' + query if query else ''), status_code=303)
                response.set_cookie('cryptiq_demo_access', secret, secure=True, httponly=True, samesite='lax', max_age=86400)
                response.headers['Referrer-Policy'] = 'same-origin'
                return response
            if not hmac.compare_digest(request.cookies.get('cryptiq_demo_access', ''), secret):
                return HTMLResponse('<h1>CryptIQ private demo</h1><p>Open the complete reviewer access link supplied by the presenter.</p>', status_code=401)
            if request.method not in ('GET','HEAD','OPTIONS'):
                origin = request.headers.get('origin', '')
                if origin and origin.split('://')[-1] != request.headers.get('host'):
                    return JSONResponse({'detail':'Use the demo from its own browser tab.'}, status_code=403)
                if request.url.path == '/api/projects' or request.headers.get('content-type','').startswith('application/zip'):
                    return JSONResponse({'detail':'Public presentation is restricted to the bundled fake shop. Source uploads remain available locally.'}, status_code=403)
            if request.url.path in ('/docs','/redoc','/openapi.json'):
                return JSONResponse({'detail':'Not found'}, status_code=404)
        response = await call_next(request)
        response.headers['Referrer-Policy'] = 'same-origin'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        return response

    @app.get('/shop', include_in_schema=False)
    def shop_root():
        return RedirectResponse('/shop/', status_code=307)

    app.mount('/shop', WSGIMiddleware(create_app()))
    dist = ROOT / 'core/web/dist'
    app.mount('/assets', StaticFiles(directory=dist/'assets'), name='assets')

    @app.get('/{path:path}', include_in_schema=False)
    def frontend(path: str):
        if path.startswith(('api/', '.', 'core/', 'docs/')):
            return JSONResponse({'detail':'Not found'}, status_code=404)
        candidate = (dist/path).resolve()
        if candidate.is_relative_to(dist.resolve()) and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(dist/'index.html', headers={'Cache-Control':'no-store'})
