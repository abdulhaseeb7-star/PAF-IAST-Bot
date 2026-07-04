import requests
from bs4 import BeautifulSoup
import json
import time
import os

# ── Complete PAF-IAST Page List ──────────────────────────
PAGES = {

    # ── MAIN ──
    "home":                    "https://paf-iast.edu.pk/",
    "contact":                 "https://paf-iast.edu.pk/contact/",
    "downloads":               "https://paf-iast.edu.pk/downloads/",
    "careers":                 "https://paf-iast.edu.pk/careers/",
    "tenders":                 "https://paf-iast.edu.pk/tenders/",
    "events":                  "https://paf-iast.edu.pk/events/",

    # ── ABOUT ──
    "about":                   "https://paf-iast.edu.pk/about-paf-iast/",
    "history":                 "https://paf-iast.edu.pk/history/",
    "vision":                  "https://paf-iast.edu.pk/visionmission/",
    "campus_life":             "https://paf-iast.edu.pk/campus-life/",
    "infrastructure":          "https://paf-iast.edu.pk/infrastructure/",
    "green_campus":            "https://paf-iast.edu.pk/our-green-campus/",
    "why_pafiast":             "https://paf-iast.edu.pk/why-paf-iast/",
    "code_of_conduct":         "https://paf-iast.edu.pk/paf-iast-code-of-conduct/",
    "act_statutes":            "https://paf-iast.edu.pk/act-and-statutes/",

    # ── MANAGEMENT ──
    "rector":                  "https://paf-iast.edu.pk/rector/",
    "chairman_advisory":       "https://paf-iast.edu.pk/chairman-advisory-board/",
    "advisory_board":          "https://paf-iast.edu.pk/advisory-board/",
    "board_governors":         "https://paf-iast.edu.pk/board-of-governors/",
    "executive_council":       "https://paf-iast.edu.pk/executive-council/",

    # ── OFFICES & RESOURCES ──
    "support_offices":         "https://paf-iast.edu.pk/support-offices/",
    "international_office":    "https://paf-iast.edu.pk/international-office/",
    "qec":                     "https://paf-iast.edu.pk/quality-enhancement-cell-qec/",
    "finance":                 "https://paf-iast.edu.pk/finance-directorate/",
    "examination":             "https://paf-iast.edu.pk/directorate-of-examination/",
    "asrb":                    "https://paf-iast.edu.pk/advanced-studies-research-board-asrb/",
    "computing_services":      "https://paf-iast.edu.pk/campus-computing-communication-services-3cs/",
    "library":                 "https://paf-iast.edu.pk/central-library/",

    # ── FACULTIES & DEPARTMENTS ──
    "departments":             "https://paf-iast.edu.pk/departments/",
    "fcaad":                   "https://paf-iast.edu.pk/fcaad/",
    "fest":                    "https://paf-iast.edu.pk/fest/",
    "fls":                     "https://paf-iast.edu.pk/fls/",
    "fms":                     "https://paf-iast.edu.pk/faculty-mss/",

    # ── DEPARTMENTS SPECIFIC ──
    "dept_cs":                 "https://paf-iast.edu.pk/department-of-computer-science/",
    "dept_ee":                 "https://paf-iast.edu.pk/department-of-electrical-engineering/",
    "dept_ce":                 "https://paf-iast.edu.pk/department-of-civil-engineering/",
    "dept_me":                 "https://paf-iast.edu.pk/department-of-mechanical-engineering/",
    "dept_chem":               "https://paf-iast.edu.pk/department-of-chemical-engineering/",
    "dept_arch":               "https://paf-iast.edu.pk/department-of-architecture/",
    "dept_design":             "https://paf-iast.edu.pk/department-of-design/",
    "dept_math":               "https://paf-iast.edu.pk/department-of-mathematics/",
    "dept_physics":            "https://paf-iast.edu.pk/department-of-physics/",
    "dept_biotech":            "https://paf-iast.edu.pk/department-of-biotechnology/",
    "dept_pharmacy":           "https://paf-iast.edu.pk/department-of-pharmacy/",
    "dept_physio":             "https://paf-iast.edu.pk/department-of-physiotherapy/",
    "dept_bio":                "https://paf-iast.edu.pk/department-of-biosciences/",
    "dept_mgmt":               "https://paf-iast.edu.pk/department-of-management-sciences/",
    "dept_social":             "https://paf-iast.edu.pk/department-of-social-sciences/",
    "dept_psych":              "https://paf-iast.edu.pk/department-of-applied-psychology/",
    "dept_english":            "https://paf-iast.edu.pk/department-of-english/",
    "dept_minerals":           "https://paf-iast.edu.pk/department-of-minerals-metallurgy/",

    # ── PROGRAMS ──
    "bachelor_programs":       "https://paf-iast.edu.pk/bachelor-programs/",
    "master_programs":         "https://paf-iast.edu.pk/master-programs/",
    "phd_programs":            "https://paf-iast.edu.pk/phd-programs/",
    "short_courses":           "https://paf-iast.edu.pk/short-courses/",
    "academic_schedule":       "https://paf-iast.edu.pk/academic_schedules/",
    "timetable":               "https://paf-iast.edu.pk/timetable/",
    "student_societies":       "https://paf-iast.edu.pk/student-societies-clubs/",

    # ── ADMISSIONS ──
    "admissions":              "https://paf-iast.edu.pk/admissions/",
    "fee_structure":           "https://paf-iast.edu.pk/fee-structure/",
    "fee_refund":              "https://paf-iast.edu.pk/fees-refund-policy/",
    "eligibility":             "https://paf-iast.edu.pk/eligibilitycriteria/",
    "merit_scheme":            "https://paf-iast.edu.pk/admissionsmeritscheme/",
    "entry_test":              "https://paf-iast.edu.pk/bachelor-admission-entry-test/",
    "admissions_schedule":     "https://paf-iast.edu.pk/admissions-schedule/",
    "cancellation":            "https://paf-iast.edu.pk/cancellation-of-admission/",
    "hec_disability":          "https://paf-iast.edu.pk/hec-disability-policy/",
    "faqs":                    "https://paf-iast.edu.pk/faqs/",

    # ── SCHOLARSHIPS ──
    "scholarships":            "https://paf-iast.edu.pk/scholarships/",
    "merit_scholarship":       "https://paf-iast.edu.pk/paf-iast-merit-scholarship/",
    "need_scholarship":        "https://paf-iast.edu.pk/paf-iast-need-based-scholarships/",
    "external_scholarships":   "https://paf-iast.edu.pk/external-scholarships/",
    "honors_awards":           "https://paf-iast.edu.pk/honors-and-awards/",

    # ── RESEARCH ──
    "research":                "https://paf-iast.edu.pk/paf-research/",
    "spcai":                   "https://paf-iast.edu.pk/spcai/",
    "railway_engineering":     "https://paf-iast.edu.pk/transportation-railway-engineering/",
    "mineral_resources":       "https://paf-iast.edu.pk/mineral-resource-engineering/",
    "agriculture_food":        "https://paf-iast.edu.pk/agriculture-food-technologies/",
    "nano_tech":               "https://paf-iast.edu.pk/nano-technology/",
    "oric":                    "https://paf-iast.edu.pk/office-of-research-innovation-and-commercialization/",

    # ── INTERNATIONAL ──
    "international":           "https://paf-iast.edu.pk/international/",
    "technology_park":         "https://paf-iast.edu.pk/technology-park/",
    "business_incubation":     "https://paf-iast.edu.pk/business-incubation-center/",
    "special_tech_zone":       "https://paf-iast.edu.pk/special-technology-zone/",

    # ── STUDENT LIFE ──
    "hostel":                  "https://paf-iast.edu.pk/hostel/",
    "transport":               "https://paf-iast.edu.pk/transport/",
    "cafeteria":               "https://paf-iast.edu.pk/cafeteria/",
    "sports":                  "https://paf-iast.edu.pk/sports/",
    "health":                  "https://paf-iast.edu.pk/health-services/",
    "mosque":                  "https://paf-iast.edu.pk/mosque/",
    "video_gallery":           "https://paf-iast.edu.pk/video-gallery/",

    # ── ADDITIONAL ──
    "merit_scheme_bs":         "https://paf-iast.edu.pk/admissionsmeritscheme/",
    "entry_test_master":       "https://paf-iast.edu.pk/master-admission-entry-test/",
    "entry_test_phd":          "https://paf-iast.edu.pk/phd-admission-entry-test/",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

def scrape_page(name, url):
    try:
        print(f"⏳ Scraping: {name} — {url}")
        res = requests.get(url, headers=HEADERS, timeout=10)
        res.raise_for_status()

        soup = BeautifulSoup(res.text, 'html.parser')

        # Remove junk
        for tag in soup(['nav', 'footer', 'script',
                         'style', 'header', 'noscript']):
            tag.decompose()

        text = soup.get_text(separator='\n', strip=True)
        lines = [l for l in text.splitlines() if l.strip()]
        clean_text = '\n'.join(lines)

        # Skip if page is essentially empty
        if len(clean_text) < 100:
            print(f"  ⚠️ Skipped (too short): {name}")
            return None

        return {
            "page": name,
            "url": url,
            "content": clean_text
        }

    except Exception as e:
        print(f"  ❌ Failed: {name} — {e}")
        return None


def main():
    os.makedirs("scraped_data", exist_ok=True)

    all_data = []
    success = 0
    failed = 0

    for name, url in PAGES.items():
        result = scrape_page(name, url)

        if result:
            all_data.append(result)
            with open(f"scraped_data/{name}.txt", "w",
                      encoding="utf-8") as f:
                f.write(result["content"])
            print(f"  ✅ Saved: scraped_data/{name}.txt "
                  f"({len(result['content'])} chars)")
            success += 1
        else:
            failed += 1

        time.sleep(1)

    # Save combined JSON
    with open("scraped_data/all_data.json", "w",
              encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 Done!")
    print(f"✅ Scraped: {success}/{len(PAGES)} pages")
    print(f"❌ Failed:  {failed}/{len(PAGES)} pages")
    print(f"📁 Saved in: scraped_data/")


if __name__ == "__main__":
    main()