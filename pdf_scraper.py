import requests
import fitz  # pymupdf
import os
import json
from bs4 import BeautifulSoup
import time

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

# Pages to scan for PDFs
PAGES_TO_SCAN = [
    "https://paf-iast.edu.pk/fee-structure/",
    "https://paf-iast.edu.pk/admissions/",
    "https://paf-iast.edu.pk/scholarships/",
    "https://paf-iast.edu.pk/academic_schedules/",
    "https://paf-iast.edu.pk/bachelor-programs/",
    "https://paf-iast.edu.pk/master-programs/",
    "https://paf-iast.edu.pk/eligibilitycriteria/",
    "https://paf-iast.edu.pk/faqs/",
    "https://paf-iast.edu.pk/downloads/",
    "https://paf-iast.edu.pk/contact/",
]

def find_pdfs_on_page(url):
    """Find all PDF links on a given page"""
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(res.text, 'html.parser')
        
        pdf_links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            if href.endswith('.pdf') or '.pdf' in href.lower():
                # Make sure it's a full URL
                if href.startswith('http'):
                    pdf_links.append(href)
                else:
                    pdf_links.append(f"https://paf-iast.edu.pk{href}")
        
        return list(set(pdf_links))  # Remove duplicates
    
    except Exception as e:
        print(f"  ❌ Error scanning {url}: {e}")
        return []


def extract_text_from_pdf(pdf_url):
    """Download and extract text from a PDF"""
    try:
        res = requests.get(pdf_url, headers=HEADERS, timeout=30)
        res.raise_for_status()
        
        # Open PDF from bytes
        pdf = fitz.open(stream=res.content, filetype="pdf")
        
        text = ""
        for page in pdf:
            text += page.get_text()
        
        pdf.close()
        
        # Clean text
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        clean_text = '\n'.join(lines)
        
        return clean_text
    
    except Exception as e:
        print(f"  ❌ Failed to extract PDF: {e}")
        return None


def get_pdf_name(url):
    """Extract a clean filename from URL"""
    name = url.split('/')[-1]           # get filename
    name = name.replace('.pdf', '')     # remove .pdf
    name = name.replace('-', '_')       # replace dashes
    name = name.replace('%20', '_')     # replace spaces
    return name.lower()


def main():
    # Create output folder
    os.makedirs("scraped_data/pdfs", exist_ok=True)
    
    print("🔍 Scanning pages for PDF links...")
    print("=" * 50)
    
    # Step 1 - Collect all PDF URLs
    all_pdf_urls = []
    for page_url in PAGES_TO_SCAN:
        print(f"Scanning: {page_url}")
        pdfs = find_pdfs_on_page(page_url)
        all_pdf_urls.extend(pdfs)
        time.sleep(1)
    
    # Remove duplicates
    all_pdf_urls = list(set(all_pdf_urls))
    print(f"\n📄 Found {len(all_pdf_urls)} unique PDFs")
    print("=" * 50)
    
    # Step 2 - Extract text from each PDF
    all_pdf_data = []
    success = 0
    
    for url in all_pdf_urls:
        name = get_pdf_name(url)
        print(f"\n⏳ Extracting: {name}")
        
        text = extract_text_from_pdf(url)
        
        if text and len(text) > 50:  # Skip empty PDFs
            all_pdf_data.append({
                "page": f"pdf_{name}",
                "url": url,
                "content": text
            })
            
            # Save individual txt file
            with open(f"scraped_data/pdfs/{name}.txt", "w", encoding="utf-8") as f:
                f.write(text)
            
            print(f"  ✅ Saved: scraped_data/pdfs/{name}.txt ({len(text)} chars)")
            success += 1
        else:
            print(f"  ⚠️ Skipped: empty or unreadable PDF")
        
        time.sleep(1)
    
    # Step 3 - Merge with existing all_data.json
    print("\n📦 Merging PDF data with existing knowledge base...")
    
    try:
        with open("scraped_data/all_data.json", "r", encoding="utf-8") as f:
            existing_data = json.load(f)
    except:
        existing_data = []
    
    # Add PDF data
    combined_data = existing_data + all_pdf_data
    
    with open("scraped_data/all_data.json", "w", encoding="utf-8") as f:
        json.dump(combined_data, f, ensure_ascii=False, indent=2)
    
    print(f"  ✅ Merged! Total pages: {len(combined_data)}")
    print(f"\n🎉 Done! Extracted {success}/{len(all_pdf_urls)} PDFs successfully")
    print("📁 PDF texts saved in: scraped_data/pdfs/")
    print("\n⚠️  Now run knowledge_base.py again to rebuild with PDF data!")


if __name__ == "__main__":
    main()