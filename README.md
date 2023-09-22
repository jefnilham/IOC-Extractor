# IOC-Extractor
Chrome extension that extracts possible common types of IOCs such as URLs, IPv4s, filenames, hashes (MD5, SHA1, SHA256). User can view the extracted data and remove any unwanted IOCs in the displayed popup. User can download the remaining IOCs as a text file automatically named after domain of active tab.

| Extraction Type & Intended Extraction | Known False Positives |
|--------------------|----------|
| IP Address | Version numbers |
| URIs, URLs, Domains, Filenames, Filepaths | Files with spaces, formatting on site |
| Hashes | - |
| CVEs | - |
