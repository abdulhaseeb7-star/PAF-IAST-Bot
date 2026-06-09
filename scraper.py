import requests
from bs4 import BeautifulSoup
import json
import time
import os

# All PAF-IAST pages to scrape
PAGES = {
    "admissions": "https://paf-iast.edu.pk/admissions/",
    "fee_structure": "https://paf-iast.edu.pk/fee-structure/",
    "eligibility": "https://paf-iast.edu.pk/eligibilitycriteria/",
    "faqs": "https://paf-iast.edu.pk/faqs/",
    "bachelor_programs": "https://paf-iast.edu.pk/bachelor-programs/",
    "master_programs": "https://paf-iast.edu.pk/master-programs/",
    "departments": "https://paf-iast.edu.pk/departments/",
    "scholarships": "https://paf-iast.edu.pk/scholarships/",
    "academic_schedule": "https://paf-iast.edu.pk/academic_schedules/",
    "contact": "https://paf-iast.edu.pk/contact/",
    "about": "https://paf-iast.edu.pk/about-paf-iast/",
    "history": "https://paf-iast.edu.pk/history/",
    "vision": "https://paf-iast.edu.pk/visionmission/",
    "campus_life": "https://paf-iast.edu.pk/campus-life/",
    "research": "https://paf-iast.edu.pk/paf-research/",
    "merit_scholarship": "https://paf-iast.edu.pk/paf-iast-merit-scholarship/",
    "need_scholarship": "https://paf-iast.edu.pk/paf-iast-need-based-scholarships/",
    "merit_scheme": "https://paf-iast.edu.pk/admissionsmeritscheme/",
    "entry_test": "https://paf-iast.edu.pk/bachelor-admission-entry-test/",
    "international": "https://paf-iast.edu.pk/international/",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

def scrape_page(name, url):
    try:
        print(f"⏳ Scraping: {name} ...")
        res = requests.get(url, headers=HEADERS, timeout=10)
        res.raise_for_status()

        soup = BeautifulSoup(res.text, 'html.parser')

        # Remove junk
        for tag in soup(['nav', 'footer', 'script', 'style', 'header', 'noscript']):
            tag.decompose()

        # Extract clean text
        text = soup.get_text(separator='\n', strip=True)

        # Remove empty lines
        lines = [line for line in text.splitlines() if line.strip()]
        clean_text = '\n'.join(lines)

        return {
            "page": name,
            "url": url,
            "content": clean_text
        }

    except Exception as e:
        print(f"  ❌ Failed: {name} → {e}")
        return None


def main():
    # Create output folder
    os.makedirs("scraped_data", exist_ok=True)

    all_data = []

    for name, url in PAGES.items():
        result = scrape_page(name, url)

        if result:
            all_data.append(result)

            # Save each page as individual .txt file
            with open(f"scraped_data/{name}.txt", "w", encoding="utf-8") as f:
                f.write(result["content"])

            print(f"  ✅ Saved: scraped_data/{name}.txt")

        time.sleep(1)  # Wait 1 second between requests

    # Save everything into one JSON file
    with open("scraped_data/all_data.json", "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 Done! Scraped {len(all_data)}/{len(PAGES)} pages.")
    print("📁 Files saved in: scraped_data/")


if __name__ == "__main__":
    main()