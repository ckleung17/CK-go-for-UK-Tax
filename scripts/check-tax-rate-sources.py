"""Monitor official tax-rate sources without changing published tax data.

The script compares normalized visible page text with a committed fingerprint
baseline. A difference is a review signal, not proof that a tax figure changed.
"""

from __future__ import annotations

import argparse
import hashlib
import html.parser
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REFERENCE_DIR = ROOT / "reference" / "tax-rates"
DATASETS = (
    REFERENCE_DIR / "uk-tax-rates.json",
    REFERENCE_DIR / "published-topic-rates.json",
)
DEFAULT_BASELINE = REFERENCE_DIR / "source-fingerprints.json"
ALLOWED_HOSTS = ("gov.uk", "gov.scot")
USER_AGENT = "CK-go-for-UK-Tax source monitor/1.0 (+GitHub Actions)"


class VisibleTextParser(html.parser.HTMLParser):
    """Extract stable visible text while ignoring executable and vector data."""

    IGNORED = {"script", "style", "noscript", "svg"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._ignored_depth = 0
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in self.IGNORED:
            self._ignored_depth += 1

    def handle_endtag(self, tag: str) -> None:
        if tag in self.IGNORED and self._ignored_depth:
            self._ignored_depth -= 1

    def handle_data(self, data: str) -> None:
        if not self._ignored_depth:
            self.parts.append(data)


def load_sources() -> dict[str, dict[str, str]]:
    sources: dict[str, dict[str, str]] = {}
    for dataset_path in DATASETS:
        dataset = json.loads(dataset_path.read_text(encoding="utf-8"))
        for source_id, source in dataset["sources"].items():
            url = source["url"]
            existing = sources.get(url)
            if existing:
                existing["ids"] += ", " + source_id
            else:
                sources[url] = {
                    "ids": source_id,
                    "title": source["title"],
                    "url": url,
                }
    return sources


def validate_url(url: str) -> None:
    parsed = urllib.parse.urlparse(url)
    hostname = (parsed.hostname or "").lower()
    allowed = any(hostname == host or hostname.endswith("." + host) for host in ALLOWED_HOSTS)
    if parsed.scheme != "https" or not allowed:
        raise ValueError("Source is not an allowed official HTTPS URL: " + url)


def fetch_fingerprint(source: dict[str, str]) -> dict[str, str]:
    validate_url(source["url"])
    request = urllib.request.Request(
        source["url"],
        headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        content_type = response.headers.get_content_type()
        if content_type not in {"text/html", "application/xhtml+xml"}:
            raise ValueError("Unsupported content type " + content_type)
        body = response.read(5_000_001)
        if len(body) > 5_000_000:
            raise ValueError("Source page exceeds the 5 MB monitoring limit")
        charset = response.headers.get_content_charset() or "utf-8"

    parser = VisibleTextParser()
    parser.feed(body.decode(charset, errors="replace"))
    normalized = re.sub(r"\s+", " ", " ".join(parser.parts)).strip()
    if len(normalized) < 200:
        raise ValueError("Source page returned too little visible text")

    return {
        "ids": source["ids"],
        "title": source["title"],
        "url": source["url"],
        "sha256": hashlib.sha256(normalized.encode("utf-8")).hexdigest(),
    }


def write_report(
    checked: list[dict[str, str]],
    changed: list[tuple[dict[str, str], str | None]],
    failures: list[tuple[dict[str, str], str]],
) -> None:
    print("# Tax-rate source monitor")
    print()
    print("Checked", len(checked), "official source pages on", date.today().isoformat() + ".")
    print()
    if changed:
        print("## Sources requiring review")
        print()
        for current, previous_hash in changed:
            state = "new source" if previous_hash is None else "page text changed"
            print(f"- [{current['title']}]({current['url']}) — {state}.")
        print()
    if failures:
        print("## Sources that could not be checked")
        print()
        for source, message in failures:
            print(f"- [{source['title']}]({source['url']}) — {message}.")
        print()
    if not changed and not failures:
        print("No monitored source changes were detected.")
    else:
        print("A human tax review is required. Do not update figures from this alert alone.")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--baseline", type=Path, default=DEFAULT_BASELINE)
    parser.add_argument("--update-baseline", action="store_true")
    args = parser.parse_args()

    baseline = {}
    if args.baseline.exists():
        baseline_document = json.loads(args.baseline.read_text(encoding="utf-8"))
        baseline = {item["url"]: item for item in baseline_document["sources"]}

    checked: list[dict[str, str]] = []
    changed: list[tuple[dict[str, str], str | None]] = []
    failures: list[tuple[dict[str, str], str]] = []
    for source in load_sources().values():
        try:
            current = fetch_fingerprint(source)
            checked.append(current)
            previous = baseline.get(current["url"])
            if not previous or previous["sha256"] != current["sha256"]:
                changed.append((current, previous["sha256"] if previous else None))
        except (OSError, ValueError, UnicodeError, urllib.error.URLError) as error:
            failures.append((source, str(error)))

    write_report(checked, changed, failures)

    if args.update_baseline and not failures:
        document = {
            "schemaVersion": 1,
            "generatedOn": date.today().isoformat(),
            "normalization": "Visible HTML text, whitespace collapsed, SHA-256",
            "sources": sorted(checked, key=lambda item: item["url"]),
        }
        args.baseline.write_text(
            json.dumps(document, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        return 0

    return 1 if changed or failures else 0


if __name__ == "__main__":
    sys.exit(main())
