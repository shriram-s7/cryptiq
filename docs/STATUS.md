# Core status

C01-C06 accepted. C03 pushed as 2e1c317; C04 as b1b70d5; shop/seed in current task commit.
Working: React shell + labelled mock scenarios, public summary stub, shop signup/login/cart/checkout,
3000 fake customers, 45% common passwords, seed snapshot and reset.
Run `python core/scripts/dev.py`; visit localhost:5173 and localhost:5050.
Priya login: priya@example.test / priya@123. Services stopped after checks.
Checks: core/demo-shop/check_shop.py; one live browser journey passed.
Next: C07 planted issues and independent discovery, then protected migration.
Not built: live scans, attacks, fixes, verification and reports. T02/T09 deferred; Hub untouched.
See core/README.md, core/demo-shop/README.md, progress.json and PROMPT_COMPLETIONS.md.
