import requests
import fitz  # pymupdf
import os
import json
from bs4 import BeautifulSoup
import time

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

# ── Every PDF directly found on PAF-IAST website ────────
DIRECT_PDF_URLS = [

    # ── FEE STRUCTURE ──
    "https://paf-iast.edu.pk/wp-content/uploads/2026/04/Fee-Structure-Fall-2026PAFIAST.pdf",

    # ── ACADEMIC SCHEDULES ──
    "https://paf-iast.edu.pk/wp-content/uploads/2024/09/PAFIAST-Fall-2024-Class-Timetable-V2.pdf",
    "https://paf-iast.edu.pk/wp-content/uploads/2024/09/Short-Courses-SDCS.pdf",

    # ── SEMESTER PLANNERS ──
    "https://paf-iast.edu.pk/wp-content/uploads/2021/03/FreshmenBatch-2021Calendar-Year-2022.pdf",
    "https://paf-iast.edu.pk/wp-content/uploads/2021/03/SophomoreBatch-2020Calendar-Year-2022.pdf",

    # ── ADMISSIONS & POLICIES ──
    "https://paf-iast.edu.pk/wp-content/uploads/2024/11/Policy-for-Students-with-Disabilities-2021-Amended.pdf",

    # ── FOR NEW STUDENTS ──
    "https://paf-iast.edu.pk/wp-content/uploads/2021/05/Joining-Instructions-and-forms.pdf",
    "https://paf-iast.edu.pk/wp-content/uploads/2021/05/Hostel-Accomodation-Form.pdf",
    "https://paf-iast.edu.pk/wp-content/uploads/2021/09/Transport-Request-Form-For-Students.pdf",
    "https://paf-iast.edu.pk/wp-content/uploads/2021/09/Transport-Cancellation-Form.pdf",
]

# ── Pages to scan for additional PDFs ───────────────────
PAGES_TO_SCAN = [
    "https://paf-iast.edu.pk/downloads/",
    "https://paf-iast.edu.pk/downloadnewstudents/",
    "https://paf-iast.edu.pk/for-existing-students/",
    "https://paf-iast.edu.pk/students-guides-policies/",
    "https://paf-iast.edu.pk/user-guides-proformas/",
    "https://paf-iast.edu.pk/news-letter/",
    "https://paf-iast.edu.pk/academic_schedules/",
    "https://paf-iast.edu.pk/admission-ads/",
    "https://paf-iast.edu.pk/notice-board/",
    "https://paf-iast.edu.pk/paf-iastbudgetreport/",
    "https://paf-iast.edu.pk/act-statutes/",
    "https://paf-iast.edu.pk/fee-structure/",
    "https://paf-iast.edu.pk/admissions/",
    "https://paf-iast.edu.pk/scholarships/",
    "https://paf-iast.edu.pk/eligibilitycriteria/",
    "https://paf-iast.edu.pk/bachelor-admission-entry-test/",
    "https://paf-iast.edu.pk/faqs/",
    "https://paf-iast.edu.pk/qec/",
    "https://paf-iast.edu.pk/directorate-examination/",
    "https://paf-iast.edu.pk/paf-iast-need-based-scholarships/",
    "https://paf-iast.edu.pk/paf-iast-merit-scholarship/",
    "https://paf-iast.edu.pk/external-scholarships/",
    "https://paf-iast.edu.pk/bachelor-programs/",
    "https://paf-iast.edu.pk/master-programs/",
    "https://paf-iast.edu.pk/spcai/",
    "https://paf-iast.edu.pk/paf-research/",
    "https://paf-iast.edu.pk/international/",
    "https://paf-iast.edu.pk/tenders/",
    "https://paf-iast.edu.pk/careers-pafiast/",
]


def find_pdfs_on_page(url):
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(res.text, 'html.parser')
        pdf_links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            if '.pdf' in href.lower():
                if href.startswith('http'):
                    pdf_links.append(href)
                elif href.startswith('/'):
                    pdf_links.append(f"https://paf-iast.edu.pk{href}")
        return list(set(pdf_links))
    except Exception as e:
        print(f"  ❌ Error scanning {url}: {e}")
        return []


def extract_text_from_pdf(pdf_url):
    try:
        res = requests.get(pdf_url, headers=HEADERS, timeout=30)
        res.raise_for_status()
        pdf = fitz.open(stream=res.content, filetype="pdf")
        text = ""
        for page in pdf:
            text += page.get_text()
        pdf.close()
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        return '\n'.join(lines)
    except Exception as e:
        print(f"  ❌ Failed to extract: {e}")
        return None


def get_pdf_name(url):
    name = url.split('/')[-1]
    name = name.replace('.pdf', '')
    name = name.replace('-', '_')
    name = name.replace('%20', '_')
    return name.lower()[:80]


def main():
    os.makedirs("scraped_data/pdfs", exist_ok=True)

    print("🔍 Scanning pages for PDF links...")
    print("=" * 50)

    # Step 1 — Collect PDFs from pages
    discovered_pdfs = []
    for url in PAGES_TO_SCAN:
        print(f"Scanning: {url}")
        pdfs = find_pdfs_on_page(url)
        discovered_pdfs.extend(pdfs)
        time.sleep(1)

    # Step 2 — Merge with direct PDFs
    all_pdf_urls = list(set(DIRECT_PDF_URLS + discovered_pdfs))
    print(f"\n📄 Found {len(all_pdf_urls)} unique PDFs total")
    print("=" * 50)

    # Step 3 — Extract text from each PDF
    all_pdf_data = []
    success = 0
    failed = 0

    for url in all_pdf_urls:
        name = get_pdf_name(url)
        print(f"\n⏳ Extracting: {name}")
        print(f"   URL: {url}")

        text = extract_text_from_pdf(url)

        if text and len(text) > 50:
            all_pdf_data.append({
                "page": f"pdf_{name}",
                "url": url,
                "content": text
            })
            with open(f"scraped_data/pdfs/{name}.txt",
                      "w", encoding="utf-8") as f:
                f.write(text)
            print(f"  ✅ Saved: {name}.txt ({len(text)} chars)")
            success += 1
        else:
            print(f"  ⚠️ Skipped: empty or unreadable")
            failed += 1

        time.sleep(1)

    # Step 4 — Merge with existing all_data.json
    print("\n📦 Merging PDF data with existing knowledge base...")
    try:
        with open("scraped_data/all_data.json", "r",
                  encoding="utf-8") as f:
            existing_data = json.load(f)
    except:
        existing_data = []

    # Remove old PDF entries to avoid duplicates
    existing_data = [d for d in existing_data
                     if not d["page"].startswith("pdf_")]

    combined_data = existing_data + all_pdf_data

    with open("scraped_data/all_data.json", "w",
              encoding="utf-8") as f:
        json.dump(combined_data, f, ensure_ascii=False, indent=2)

    print(f"  ✅ Merged! Total pages: {len(combined_data)}")
    print(f"\n🎉 Done!")
    print(f"✅ Extracted: {success} PDFs")
    print(f"❌ Failed:    {failed} PDFs")
    print(f"📁 Saved in: scraped_data/pdfs/")
    print(f"\n⚠️ Now run: python knowledge_base.py")


if __name__ == "__main__":
    main()