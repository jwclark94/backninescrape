import csv
from collections import defaultdict
from statistics import mean

INPUT_PATH = "booked_hours_daily_max.csv"
OUTPUT_PATH = "location_stats_daily_max.csv"

WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def safe_float(x, default=None):
    """
    Returns float(x) if possible, else default.
    Use default=None when you want "missing" to stay missing.
    """
    try:
        return float(x)
    except Exception:
        return default


def main():
    # Store totals per location (slug-only, since you want city removed)
    overall = defaultdict(list)  # slug -> [hours...]
    by_weekday = defaultdict(lambda: defaultdict(list))  # slug -> weekday -> [hours...]

    with open(INPUT_PATH, "r", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            slug = (row.get("slug") or "").strip()
            dow = (row.get("day_of_week") or "").strip()
            hours = safe_float(row.get("max_total_booked_hours"), default=None)

            if not slug or hours is None:
                continue

            overall[slug].append(hours)
            if dow:
                by_weekday[slug][dow].append(hours)

    # Output header (your requested changes)
    header = [
        "slug",
        "number_of_bays",
        "average_hours_perbay",
        "avg_daily_max_hours",
        *[f"avg_{d[:3].lower()}_max_hours" for d in WEEKDAYS],  # avg_mon_max_hours, ...
    ]

    with open(OUTPUT_PATH, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)

        for slug, vals in sorted(overall.items()):
            avg_all = mean(vals) if vals else 0.0

            weekday_avgs = []
            for d in WEEKDAYS:
                v = by_weekday[slug].get(d, [])
                weekday_avgs.append(mean(v) if v else "")

            # Manual column (you will fill this in later)
            number_of_bays = ""

            # average_hours_perbay stays blank until you fill number_of_bays
            average_hours_perbay = ""

            writer.writerow(
                [
                    slug,
                    number_of_bays,
                    average_hours_perbay,
                    round(avg_all, 2),
                    *[("" if x == "" else round(x, 2)) for x in weekday_avgs],
                ]
            )

    print(f"✅ Wrote {OUTPUT_PATH} for {len(overall)} locations.")


if __name__ == "__main__":
    main()
