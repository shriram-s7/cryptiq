"""Local fake-store activity, deliberately excluding credentials and contact fields."""
import json
from pathlib import Path
from threading import Lock
from datetime import datetime, timezone
from uuid import uuid4

EVENTS = Path(__file__).resolve().parents[1] / '.runtime' / 'shop-events.json'
LOCK = Lock()

def record(kind, customer_id, order_id=None):
    with LOCK:
        EVENTS.parent.mkdir(parents=True, exist_ok=True)
        try:
            values = json.loads(EVENTS.read_text(encoding='utf-8'))
        except (OSError, ValueError):
            values = []
        values.insert(0, {'id': uuid4().hex, 'kind': kind, 'customerId': customer_id,
                         'orderId': order_id, 'at': datetime.now(timezone.utc).isoformat()})
        temporary = EVENTS.with_suffix('.tmp')
        temporary.write_text(json.dumps(values[:40]), encoding='utf-8')
        temporary.replace(EVENTS)
