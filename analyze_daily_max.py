import csv
from collections import defaultdict
from statistics import mean

INPUT_PATH = "booked_hours_daily_max.csv"
OUTPUT_PATH = "location_stats_daily_max.csv"

WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def safe_float(x, default=0.0):
    try:
        return float(x)
    except Exception:
        return default

def main():
    # Store totals per location
    overall = defaultdict(list)                # (city, slug) -> [hours...]
    by_weekday = defaultdict(lambda: defaultdict(list))  # (city, slug) -> weekday -> [hours...]

    with open(INPUT_PATH, "r", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            city = row.get("city", "").strip()
            slug = row.get("slug", "").strip()
            dow = row.get("day_of_week", "").strip()
            hours = safe_float(row.get("max_total_booked_hours"))

            if not city or not slug:
                continue

            overall[(city, slug)].append(hours)
            if dow:
                by_weekday[(city, slug)][dow].append(hours)

    # Write output
    header = [
        "city",
        "slug",
        "num_days",
        "avg_daily_max_hours",
        *[f"avg_{d[:3].lower()}_max_hours" for d in WEEKDAYS],   # avg_mon_max_hours, ...
    ]

    with open(OUTPUT_PATH, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)

        for (city, slug), vals in sorted(overall.items(), key=lambda x: (x[0][0], x[0][1])):
            num_days = len(vals)
            avg_all = mean(vals) if vals else 0.0

            weekday_avgs = []
            for d in WEEKDAYS:
                v = by_weekday[(city, slug)].get(d, [])
                weekday_avgs.append(mean(v) if v else "")

            writer.writerow([
                city,
                slug,
                num_days,
                round(avg_all, 2),
                *[("" if x == "" else round(x, 2)) for x in weekday_avgs],
            ])

    print(f"✅ Wrote {OUTPUT_PATH} for {len(overall)} locations.")

if __name__ == "__main__":
    main()
