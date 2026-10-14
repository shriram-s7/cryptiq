"""Restore only this repository's fake shop snapshot. Stop the demo shop first."""
import sqlite3
from storage import DATA, DB, ROOT


def reset():
    snapshot = DATA / 'shop_before.db'
    if not snapshot.is_file():
        raise RuntimeError('Seed the shop before resetting it.')
    with sqlite3.connect(f'{snapshot.as_uri()}?mode=ro', uri=True) as source, sqlite3.connect(DB) as target:
        source.backup(target)
    (ROOT / 'state.json').write_text('{"mode":"before"}\n', encoding='utf-8')


if __name__ == '__main__':
    reset()
    print('Restored before snapshot. Restart the shop and log in again.')
