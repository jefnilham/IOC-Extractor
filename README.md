# IOC-Extractor
Chrome extension that extracts possible common types of IOCs such as URLs, IPv4s, filenames, hashes (MD5, SHA1, SHA256). User can view the extracted data and remove any unwanted IOCs in the displayed popup. User can download the remaining IOCs as a text file.

1. ip address regex
IP addresses in the format xxx.xxx.xxx.xxx, xxx[.]xxx[.]xxx[.]xxx, xxx.xxx.xxx[.]xxx or xxx[.]xxx.xxx.xxx.

2. uris, urls, domains, filenames, filepaths
Has false positives, depending on how the site sanitises IOCs, whether there are spaces in the filenames/paths.

3. Hashes
MD5, SHA1, SHA256. Accurate.

| Extraction Type & Intended Extraction | Known False Positives |
|--------------------|----------|
| IP Address | Version numbers |
| URIs, URLs, Domains, Filenames, Filepaths | Files with spaces, formatting on site |
| Hashes | - |
