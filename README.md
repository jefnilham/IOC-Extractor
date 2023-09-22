# IOC-Extractor
Chrome extension that extracts possible common types of IOCs such as URLs, IPv4s, filenames, hashes (MD5, SHA1, SHA256). User can view the extracted data and remove any unwanted IOCs in the displayed popup. User can download the remaining IOCs as a text file automatically named after domain of active tab. Made for analysts who scrape through OSINT reports.

| Intended Extraction Type | Known False Positives (Unintended Extractions) |
|--------------------|----------|
| IP Address | Version numbers |
| URIs, URLs, Domains, Filenames, Filepaths | Files with spaces, formatting on site, emails, non-malicious URLs, "/"s |
| Hashes | - |
| CVEs | - |

Known issues:
1. Still cant get from raw files on browser as it wont get extracted in allText. DOM related. Probably need to make http request and parse the response. :(
