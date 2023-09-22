# IOC-Extractor
Chrome extension that extracts possible common types of IOCs such as URLs, IPv4s, filenames, hashes (MD5, SHA1, SHA256). User can view the extracted data and remove any unwanted IOCs in the displayed popup. User can download the remaining IOCs as a text file.

1. ip address regex
IP addresses in the format xxx.xxx.xxx.xxx, where each xxx is a number from 1 to 255.
IP addresses in the format xxx[.]xxx[.]xxx[.]xxx, where each xxx is a number from 1 to 255.
A combination of both of the above formats, such as xxx.xxx.xxx[.]xxx or xxx[.]xxx.xxx.xxx.
