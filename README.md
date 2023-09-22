# IOC-Extractor
Chrome extension that extracts possible common types of IOCs such as URLs, IPv4s, filenames, hashes (MD5, SHA1, SHA256). User can view the extracted data and remove any unwanted IOCs in the displayed popup. User can download the remaining IOCs as a text file automatically named after domain of active tab. Made for analysts who scrape through OSINT reports.

| Intended Extraction Type | Known False Positives |
|--------------------|----------|
| IP Address | Version numbers |
| URIs, URLs, Domains, Filenames, Filepaths | Files with spaces, formatting on site, emails, non-malicious URLs |
| Hashes | - |
| CVEs | - |

Known issues:
1. Still cant get from raw files on browser. Something to do with DOM i guess.
