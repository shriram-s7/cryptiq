WEIGHTS = {'critical': 15, 'high': 7, 'medium': 3, 'low': 1}


def calculate(findings):
    counts = dict.fromkeys(WEIGHTS, 0)
    seen = set()
    for finding in findings:
        identity = finding['ruleId']
        if identity in seen or finding['status'] not in ('open', 'manual'): continue
        seen.add(identity)
        counts[finding['severity']] += 1
    return max(0, 100 - sum(counts[key] * weight for key, weight in WEIGHTS.items())), counts
