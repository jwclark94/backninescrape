import csv
import json
import re
import os
import requests
from datetime import date, datetime, timedelta
from dateutil import parser
from zoneinfo import ZoneInfo  # built-in, no install needed

def should_scrape_now(
    tz_name: str,
    target_hour: int = 23,
    target_minute: int = 45,
    tolerance_minutes: int = 7,
) -> bool:
    """
    Returns True if the current local time in tz_name is within
    ±tolerance_minutes of target_hour:target_minute.
    Designed for 15-minute cron intervals.
    """
    now_local = datetime.now(ZoneInfo(tz_name))
    now_minutes = now_local.hour * 60 + now_local.minute
    target_minutes = target_hour * 60 + target_minute

    return abs(now_minutes - target_minutes) <= tolerance_minutes

API_BASE = "https://book.b9.golf"
HOME_URL = f"{API_BASE}/"
API_URL_EVENTS = f"{API_BASE}/api/bookings/fetch_events"
API_URL_LOCATIONS = f"{API_BASE}/api/locations/"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
os.makedirs(BASE_DIR, exist_ok=True)

RAW_CSV_PATH = os.path.join(BASE_DIR, "booked_hours_raw.csv")
DAILY_MAX_CSV_PATH = os.path.join(BASE_DIR, "booked_hours_daily_max.csv")


# -----------------------------
# SIMPLE STATE → TIMEZONE MAP
# -----------------------------
STATE_TIMEZONE = {
    # Pacific
    "ca": "America/Los_Angeles",
    "wa": "America/Los_Angeles",
    "or": "America/Los_Angeles",
    "nv": "America/Los_Angeles",

    # Mountain
    "az": "America/Phoenix",   # no DST
    "ut": "America/Denver",
    "co": "America/Denver",
    "nm": "America/Denver",
    "id": "America/Denver",

    # Central
    "tx": "America/Chicago",
    "il": "America/Chicago",
    "wi": "America/Chicago",
    "mn": "America/Chicago",
    "mo": "America/Chicago",
    "ia": "America/Chicago",
    "ks": "America/Chicago",
    "ne": "America/Chicago",
    "ok": "America/Chicago",
    "la": "America/Chicago",
    "ar": "America/Chicago",
    "sd": "America/Chicago",
    "nd": "America/Chicago",
    "tn": "America/Chicago",
    "al": "America/Chicago",
    "ms": "America/Chicago",

    # Eastern
    "fl": "America/New_York",
    "ga": "America/New_York",
    "in": "America/Indiana/Indianapolis",
    "oh": "America/New_York",
    "mi": "America/New_York",
    "pa": "America/New_York",
    "ny": "America/New_York",
    "nj": "America/New_York",
    "ma": "America/New_York",
    "md": "America/New_York",
    "va": "America/New_York",
    "nc": "America/New_York",
    "sc": "America/New_York",
    "de": "America/New_York",
}

def debug_event_summary(events: list[dict]) -> None:
    total = 0.0
    for e in events:
        start = e.get("start")
        end = e.get("end")
        title = (e.get("title") or e.get("name") or "").strip()

        if not start or not end:
            continue

        dur = hours_between(start, end)
        total += dur
        print(f"{dur:>4.1f}h | {start} -> {end} | {title[:60]}")

    print("TOTAL (raw sum):", round(total, 2))
    
def get_timezone_for_location(slug: str) -> str:
    """
    Infer timezone from the location slug.
    Example: fishers-in → America/Indiana/Indianapolis
    """
    if not slug:
        return "America/Los_Angeles"

    parts = slug.lower().split("-")
    state = parts[-1]
    return STATE_TIMEZONE.get(state, "America/Los_Angeles")


# -----------------------------
# Headers / session helpers
# -----------------------------
def base_headers() -> dict:
    return {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json, text/plain, */*",
        "Referer": HOME_URL,
        "Origin": API_BASE,
        "Connection": "keep-alive",
    }


def make_event_headers(location_slug: str, tz_name: str) -> dict:
    h = base_headers()
    h.update(
        {
            "Content-Type": "text/plain;charset=UTF-8",
            "X-Location-Slug": location_slug,
            "X-U-Tz": tz_name,
            "X-Bng-User": '{"public":true}',
        }
    )
    return h


def prime_session(sess: requests.Session) -> None:
    sess.get(HOME_URL, headers=base_headers(), timeout=20)


# -----------------------------
# Core calculations
# -----------------------------
def hours_between(start_str: str, end_str: str) -> float:
    start_dt = parser.parse(start_str)
    end_dt = parser.parse(end_str)
    return (end_dt - start_dt).total_seconds() / 3600.0


def total_booked_hours(events: list[dict], day: date) -> float:
    total = 0.0

    # Define the exact day window
    day_start = datetime(day.year, day.month, day.day, 0, 0, 0)
    day_end = day_start + timedelta(days=1)

    for e in events:
        # 👇 NEW CODE: Skip cleaning blocks
        title = (e.get("title") or e.get("name") or "").lower()
        if "clean" in title:
            continue
        # 👆 END NEW CODE

        # ... (keep the rest of the existing code below exactly the same)
        # if e.get("booking_id") is None: ...
        
        start_str = e.get("start")
        end_str = e.get("end")
        if not start_str or not end_str:
            continue

        event_start = parser.parse(start_str)
        event_end = parser.parse(end_str)

        # Clip the event to the day window
        clipped_start = max(event_start, day_start)
        clipped_end = min(event_end, day_end)

        # If there is no overlap, skip
        if clipped_start >= clipped_end:
            continue

        total += (clipped_end - clipped_start).total_seconds() / 3600.0

    return total


# -----------------------------
# Locations extraction
# -----------------------------
def _extract_locations_from_any_shape(data) -> list[dict]:
    if isinstance(data, list):
        return [x for x in data if isinstance(x, dict)]

    if isinstance(data, dict):
        for key in ("locations", "data", "results", "items"):
            if key in data:
                v = data[key]
                if isinstance(v, list):
                    return [x for x in v if isinstance(x, dict)]
                if isinstance(v, dict):
                    nested = _extract_locations_from_any_shape(v)
                    if nested:
                        return nested

        if data and all(isinstance(v, dict) for v in data.values()):
            vals = list(data.values())
            if any(("slug" in v or "location_slug" in v) for v in vals):
                return vals

        if isinstance(data.get("html"), str):
            html = data.get("html", "")
            script = data.get("script", "") if isinstance(data.get("script"), str) else ""
            blob = html + "\n" + script

            found = []

            opt_pat = re.compile(
                r'<option[^>]*value=["\']([^"\']+)["\'][^>]*>\s*([^<]+?)\s*</option>',
                re.IGNORECASE,
            )
            found.extend([(s.strip(), n.strip()) for s, n in opt_pat.findall(blob)])

            if not found:
                slug_pat = re.compile(r"[?&]slug=([a-z0-9-]+)", re.IGNORECASE)
                slugs = list(dict.fromkeys(slug_pat.findall(blob)))
                found.extend([(s, s) for s in slugs])

            locations = []
            seen = set()
            for slug, title in found:
                if slug and slug not in seen:
                    seen.add(slug)
                    locations.append({"slug": slug, "title": title})
            return locations

    return []


def fetch_locations(sess: requests.Session) -> list[dict]:
    prime_session(sess)

    headers = base_headers()
    headers.update(
        {
            "X-Bng-User": '{"public":true}',
            "X-Requested-With": "XMLHttpRequest",
        }
    )

    for url in (API_URL_LOCATIONS, API_URL_LOCATIONS.rstrip("/")):
        r = sess.get(url, headers=headers, timeout=20)
        if r.status_code != 200:
            continue
        try:
            data = r.json()
        except Exception:
            continue

        locations = _extract_locations_from_any_shape(data)
        if locations:
            return locations

    raise ValueError("Could not extract locations")


# -----------------------------
# Events (TIMEZONE AWARE)
# -----------------------------
def fetch_events_for_day(sess, day, location_slug, tz_name):

    start_dt = datetime(day.year, day.month, day.day, 0, 0, 0)
    end_dt = start_dt + timedelta(days=1)

    payload = {
        "start": start_dt.strftime("%Y-%m-%dT%H:%M:%S"),
        "end": end_dt.strftime("%Y-%m-%dT%H:%M:%S"),
    }

    r = sess.post(
        API_URL_EVENTS,
        data=json.dumps(payload),
        headers=make_event_headers(location_slug, tz_name),
        timeout=20,
    )
    r.raise_for_status()
    return r.json()


# -----------------------------
# CSV output
# -----------------------------
def append_raw_csv(run_dt, day, total, city, slug, path=RAW_CSV_PATH):
    file_exists = os.path.exists(path)
    with open(path, "a", newline="") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(
                ["run_timestamp", "city", "slug", "date", "day_of_week", "total_booked_hours"]
            )
        writer.writerow(
            [
                run_dt.isoformat(timespec="seconds"),
                city,
                slug,
                day.isoformat(),
                day.strftime("%A"),
                round(total, 2),
            ]
        )


def upsert_daily_max_csv(day, total, city, slug, run_dt, path=DAILY_MAX_CSV_PATH):
    header = ["city", "slug", "date", "day_of_week", "max_total_booked_hours", "max_captured_at"]
    key = (city, slug, day.isoformat())

    rows = []
    if os.path.exists(path):
        with open(path, "r", newline="") as f:
            rows = list(csv.DictReader(f))

    idx = {(r["city"], r["slug"], r["date"]): i for i, r in enumerate(rows)}

    if key in idx:
        i = idx[key]
        prev = float(rows[i]["max_total_booked_hours"])
        if total > prev:
            rows[i]["max_total_booked_hours"] = f"{round(total,2)}"
            rows[i]["max_captured_at"] = run_dt.isoformat(timespec="seconds")
    else:
        rows.append(
            {
                "city": city,
                "slug": slug,
                "date": day.isoformat(),
                "day_of_week": day.strftime("%A"),
                "max_total_booked_hours": f"{round(total,2)}",
                "max_captured_at": run_dt.isoformat(timespec="seconds"),
            }
        )

    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=header)
        writer.writeheader()
        writer.writerows(rows)


# -----------------------------
# Main
# -----------------------------
def main():
    sess = requests.Session()
    locations = fetch_locations(sess)

    today = date.today()
    run_dt = datetime.now()

    for loc in locations:
        slug = loc.get("slug")
        city = loc.get("title") or slug

        if not slug:
            continue

        tz_name = get_timezone_for_location(slug)

        # 🔒 ONLY run at ~11:45pm local time for this location
        #if not should_scrape_now(tz_name):
            #continue

        try:
            events = fetch_events_for_day(sess, today, slug, tz_name)
            total = total_booked_hours(events, today)
        except Exception as e:
            print(f"FAILED {city} | {slug}: {e}")
            continue

        print(f"{city} | {slug} | {tz_name} | {total:.2f} hours")

        append_raw_csv(run_dt, today, total, city, slug)
        upsert_daily_max_csv(today, total, city, slug, run_dt)

    print("Done.")


if __name__ == "__main__":
    main()
