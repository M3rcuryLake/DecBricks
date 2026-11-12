#!/usr/bin/env python3
"""
Brand regression check (FONT-SWAP-PROMPT §4.9): every text node in the built
HTML that contains the word "Decbricks" must sit inside an element carrying
`font-brand` (the FK Raster Roman Compact wordmark). Untaggable contexts
(<head>, <script>, <style>, <title>) are skipped — but must not leak visible
brand text outside `.font-brand` anywhere in the body.

Run after `npm run build`. Prints offenders with file + snippet; exits 1 on fail.
"""
import html.parser
import pathlib
import re
import sys

BRAND = re.compile(r'\bDecbricks\b', re.IGNORECASE)

DIST = pathlib.Path(__file__).resolve().parent.parent / 'dist'

SKIP_TAGS = {'head', 'script', 'style', 'title'}


class Checker(html.parser.HTMLParser):
    def __init__(self, rel):
        super().__init__(convert_charrefs=True)
        self.rel = rel
        self.skip_depth = 0
        self.stack = []       # list of (tag, has_brand_class)
        self.offenders = []
        self.leaks = []

    @staticmethod
    def _classes(attrs):
        for k, v in attrs:
            if k == 'class':
                return (v or '').split()
        return []

    def has_brand_in_ancestors(self):
        return any(brand for _, brand in self.stack)

    def handle_starttag(self, tag, attrs):
        self.stack.append((tag, 'font-brand' in self._classes(attrs)))

    def handle_startendtag(self, tag, attrs):
        pass

    def handle_endtag(self, tag):
        if self.stack:
            self.stack.pop()

    def handle_data(self, data):
        visible = not self.has_brand_in_ancestors()
        if self.skip_depth == 0 and visible and data.strip() and BRAND.search(data):
            self.offenders.append(
                f'  {self.rel}: "…{data.strip()[:70]}…" not inside .font-brand'
            )
        # Regression guard (QA 2026-11-11): a leaked `set:html=` attribute that
        # ended up as element CONTENT renders as literal text in production.
        if self.skip_depth == 0 and 'set:html=' in data:
            self.leaks.append(f'  {self.rel}: leaked attribute text "…{data.strip()[:70]}…"')


def check(path, rel):
    html = path.read_text(encoding='utf8')

    # Strip <head> entirely, plus scripts/styles/titles (meta/OG/JSON-LD/alt/aria-label stay out)
    body = re.sub(r'<head\b.*?</head>', '', html, flags=re.S | re.I)
    for tag in ('script', 'style', 'title'):
        body = re.sub(rf'<{tag}\b.*?</{tag}>', '', body, flags=re.S | re.I)

    c = Checker(rel)
    c.feed(body)
    return c.offenders, c.leaks


def check_assets():
    """Brand lockup assets must be built into dist/ (FONT-SWAP logo task)."""
    missing = []
    required = [
        'brand/logo.webp', 'brand/logo-cream.webp', 'brand/logo.png',
        'brand/favicon.ico', 'brand/icon-192.png', 'brand/icon-512.png',
        'brand/apple-touch-icon.png', 'og-default.png',
    ]
    for rel in required:
        if not (DIST / rel).exists():
            missing.append(f'  dist/{rel} missing')
        elif (DIST / rel).stat().st_size == 0:
            missing.append(f'  dist/{rel} is empty')
    return missing


def main():
    if not DIST.exists():
        print('No dist/ — run `npm run build` first.')
        return 1
    offenders = []
    leaks = []
    files = sorted(DIST.rglob('*.html'))
    for path in files:
        rel = str(path.relative_to(DIST))
        o, l = check(path, rel)
        offenders.extend(o)
        leaks.extend(l)
    if leaks:
        print(f'FAIL: leaked set:html attribute text (rendered as literal content) in {len(leaks)} spot(s):')
        print('\n'.join(leaks))
        return 1
    if offenders:
        print(f'FAIL: brand word outside .font-brand in {len(offenders)} spot(s):')
        print('\n'.join(offenders))
        return 1
    missing = check_assets()
    if missing:
        print('FAIL: brand lockup assets missing from dist/:')
        print('\n'.join(missing))
        return 1
    print(f'PASS: all "{BRAND.pattern}" occurrences in {len(files)} built page(s) sit inside .font-brand elements; lockup + favicon assets present.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
