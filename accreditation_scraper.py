import requests
from bs4 import BeautifulSoup
import json
import time
from datetime import date

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

# ── Pages to scrape for PAF-IAST accreditation data ─────
ACCREDITATION_SOURCES = {

    # PAF-IAST own pages about accreditation
    "paf_nceac_visit": "https://paf-iast.edu.pk/nceac-zero-visit/",
    "paf_pec":         "https://paf-iast.edu.pk/pec-accreditation/",
    "paf_about":       "https://paf-iast.edu.pk/about-paf-iast/",
    "paf_fest":        "https://paf-iast.edu.pk/fest/",
    "paf_fcaad":       "https://paf-iast.edu.pk/fcaad/",

    # PEC pages
    "pec_zero":        "https://www.pec.org.pk/accredition/programs-under-zero-interim-phase/",
    "pec_level1":      "https://www.pec.org.pk/accredition/programs-under-level-1/",
    "pec_level2":      "https://www.pec.org.pk/accredition/programs-under-level-2/",

    # NCEAC
    "nceac_accredited": "https://nceac.org.pk/Accreditation/AccreditedInstitutions",
}


def scrape_for_pafiast(url):
    """Scrape a page and extract only PAF-IAST relevant content."""
    try:
        res = requests.get(url, headers=HEADERS, timeout=15)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, 'html.parser')

        for tag in soup(['nav', 'footer', 'script',
                         'style', 'header', 'noscript']):
            tag.decompose()

        text = soup.get_text(separator='\n', strip=True)

        # Extract only paragraphs mentioning PAF-IAST
        lines = text.splitlines()
        relevant = []
        for i, line in enumerate(lines):
            if any(keyword in line.lower() for keyword in
                   ['paf-iast', 'paf iast', 'haripur',
                    'pak-austria', 'pak austria']):
                # Include surrounding context (2 lines before and after)
                start = max(0, i - 2)
                end = min(len(lines), i + 3)
                chunk = '\n'.join(lines[start:end]).strip()
                if chunk and chunk not in relevant:
                    relevant.append(chunk)

        return '\n\n'.join(relevant) if relevant else None

    except Exception as e:
        print(f"  ❌ Failed: {url} — {e}")
        return None


def update_accreditation_in_config(findings):
    """Update config.json with latest accreditation data."""
    try:
        with open("config.json", "r", encoding="utf-8") as f:
            config = json.load(f)
    except:
        config = {}

    # Build updated accreditation section
    config["accreditation"] = {
        "hec": {
            "status": "PAF-IAST is a HEC recognized and chartered public sector university.",
            "verify": "https://hec.gov.pk"
        },
        "pec": {
            "status": findings.get("pec_status",
                "PEC has granted permission under Zero/Interim phase to launch "
                "engineering programs. Full accreditation is ongoing subject to compliance."),
            "programs": "BE Chemical Engineering, BE Electrical Engineering, "
                       "BE Civil Engineering, BE Mechanical Engineering, "
                       "BS Mining Engineering, BS Computer Engineering, "
                       "BS Biomedical Engineering",
            "raw_data": findings.get("pec_raw", ""),
            "verify": "https://pec.org.pk",
            "zero_interim_pdf": "https://www.pec.org.pk/wp-content/uploads/2023/03/Zero-Interim-03-03-2023.pdf"
        },
        "nceac": {
            "status": findings.get("nceac_status",
                "NCEAC Zero Visit has been conducted at PAF-IAST for computing programs. "
                "Accreditation process is ongoing."),
            "programs": "BS Computer Science, BS Software Engineering, "
                       "BS Data Science, BS Artificial Intelligence",
            "raw_data": findings.get("nceac_raw", ""),
            "verify": "https://nceac.org.pk"
        },
        "pcatp": {
            "status": findings.get("pcatp_status",
                "PCATP has authorized intake for BS Architecture program "
                "with up to 45 students per year. Full accreditation subject to compliance."),
            "programs": "BS Architecture",
            "verify": "https://pcatp.org.pk"
        },
        "important_note": (
            "Accreditation status is batch-specific and subject to change. "
            "Always verify current batch status directly with the relevant "
            "accreditation body before taking admission."
        ),
        "last_updated": str(date.today())
    }

    with open("config.json", "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)

    print("  ✅ config.json updated with latest accreditation data!")


def save_to_scraped_data(name, content):
    """Save accreditation data as txt for FAISS knowledge base."""
    import os
    os.makedirs("scraped_data", exist_ok=True)
    path = f"scraped_data/accreditation_{name}.txt"
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  ✅ Saved: {path}")


def main():
    print("=" * 50)
    print("  PAF-IAST Accreditation Data Scraper")
    print("=" * 50)

    findings = {}
    all_accreditation_text = ""

    for name, url in ACCREDITATION_SOURCES.items():
        print(f"\n⏳ Scraping: {name}")
        print(f"   URL: {url}")

        content = scrape_for_pafiast(url)

        if content:
            print(f"  ✅ Found PAF-IAST relevant content ({len(content)} chars)")
            all_accreditation_text += f"\n\n=== {name} ===\n{content}"

            # Categorize findings
            content_lower = content.lower()
            if 'pec' in name or 'pec' in content_lower:
                findings["pec_raw"] = content
                if 'zero' in content_lower or 'interim' in content_lower:
                    findings["pec_status"] = (
                        "PEC has granted permission under Zero/Interim phase "
                        "for PAF-IAST engineering programs. Full accreditation "
                        "is ongoing subject to satisfactory compliance."
                    )
            if 'nceac' in name or 'nceac' in content_lower:
                findings["nceac_raw"] = content
                findings["nceac_status"] = (
                    "NCEAC Zero Visit was conducted at PAF-IAST for "
                    "BS CS, BS Software Engineering, BS Data Science, "
                    "and BS AI programs. Accreditation is ongoing."
                )
            if 'pcatp' in name or 'pcatp' in content_lower:
                findings["pcatp_status"] = (
                    "PCATP has authorized PAF-IAST to enroll up to 45 "
                    "students per year for BS Architecture. Full "
                    "accreditation subject to compliance."
                )
        else:
            print(f"  ⚠️ No PAF-IAST specific content found")

        time.sleep(1)

    # Save all accreditation text for FAISS
    if all_accreditation_text:
        save_to_scraped_data("all_bodies", all_accreditation_text)

    # Update config.json
    print("\n📝 Updating config.json...")
    update_accreditation_in_config(findings)

    print("\n🎉 Accreditation data updated!")
    print("⚠️  Run knowledge_base.py to rebuild FAISS with new data")


if __name__ == "__main__":
    main()