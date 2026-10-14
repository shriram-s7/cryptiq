# Demo shop scaffold

Use the shared Core environment from core/README.md, then from D:\cryptiq:

```powershell
core/.venv/Scripts/python.exe core/demo-shop/app.py
```

If Flask is already installed, `python core/demo-shop/app.py` also works.
Open http://localhost:5050 or GET /health. Ctrl+C stops the server. Debug and reloader are disabled.
This is a local demo service, not a production deployment. No customer database or account flow exists
yet; C05 adds the real before-mode shop. Port 5050 is fixed.
