// Define global variables
let extractedData = {
    ipAddresses: [],
    urlsAndUris: [],
    hashes: [],
    cves: []
};
let extractedMatches = [];
let markersInfo = []; // store { ioc, id } for jump buttons

const patterns = {
    ipAddresses: /\b(?:\d{1,3}(?:\.\d{1,3}|\[\.\]){3}\d{1,3}|\d{1,3}(?:\[\.\]\d{1,3}){3}|\d{1,3}(?:\.\d{1,3}){3})\b/g,
    urlsAndUris: /\b(?:https?:\/\/[^\s/$.?#].[^\s]*|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|[a-zA-Z0-9-]+\[[.]\][a-zA-Z]{2,}|[a-zA-Z]:\\[^\\]+\\[^\\]+\\[^\\]+\\[^\\]+\.[a-zA-Z0-9]+|\/[^\s/]+(?:\/[^\s/]+)*|\\\\[^\\]+\\[^\\]+(?:\\[^\\]+)+\\[^\s/]+\.[a-zA-Z0-9]+)\b/g,
    hashes: /\b[0-9a-fA-F]{32}\b|\b[0-9a-fA-F]{40}\b|\b[0-9a-fA-F]{64}\b/g,
    cves: /\bCVE-\d{4}-\d{4,7}\b/g
};

// Union pattern for extracting matches from the returned marker list
const unionPattern = new RegExp(
    patterns.ipAddresses.source + '|' +
    patterns.urlsAndUris.source + '|' +
    patterns.hashes.source + '|' +
    patterns.cves.source,
    'g'
);

// Extract data from the active tab
function extractDataFromTab(tabId) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: extractTextWithMarkers
    }, function(results) {
        // results[0].result is an array of { ioc, id }
        markersInfo = results[0].result;

        // Extract unique IOCs by type from markersInfo
        extractedData = {
            ipAddresses: [],
            urlsAndUris: [],
            hashes: [],
            cves: []
        };
        extractedMatches = [];

        for (const { ioc } of markersInfo) {
            extractedMatches.push(ioc);
        }

        // Extract categorized data for internal usage
        const categorized = extractIpAddressAndUrlAndHashes(extractedMatches.join(' '));
        extractedData = categorized;

        console.log("Extracted Data:", extractedData);
        console.log("Markers Info:", markersInfo);

        displayMatches();
    });
}

// Display matches in popup with Remove + Jump buttons
function displayMatches() {
    const extractedDataContainer = document.getElementById('extractedData');
    extractedDataContainer.innerHTML = '';

    // Use unique matches to avoid duplicates
    const uniqueMatches = [...new Set(extractedMatches)];

    uniqueMatches.forEach(match => {
        // Find corresponding marker id for jump (use first one found)
        const marker = markersInfo.find(m => m.ioc === match);
        const id = marker ? marker.id : null;

        const div = createItemDiv(match, " ", id);
        extractedDataContainer.appendChild(div);
    });
}

// Create div for each IOC with Remove and Jump buttons
function createItemDiv(value, label, markerId) {
    const div = document.createElement('div');

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', function() {
        removeItem(value);
    });

    div.appendChild(removeButton);

    if (markerId) {
        const jumpButton = document.createElement('button');
        jumpButton.textContent = 'Jump to IOC';
        jumpButton.addEventListener('click', function() {
            jumpToMarker(markerId);
        });
        div.appendChild(jumpButton);
    }

    const text = document.createElement('span');
    text.textContent = label + value;
    div.appendChild(text);

    return div;
}

// Remove item from extractedMatches and extractedData
function removeItem(value) {
    extractedMatches = extractedMatches.filter(match => match !== value);
    removeFromExtractedData(value);
    displayMatches();
}

// Remove from extractedData categories
function removeFromExtractedData(value) {
    extractedData.ipAddresses = extractedData.ipAddresses.filter(ip => ip !== value);
    extractedData.urlsAndUris = extractedData.urlsAndUris.filter(url => url !== value);
    extractedData.hashes = extractedData.hashes.filter(hash => hash !== value);
    extractedData.cves = extractedData.cves.filter(cve => cve !== value);
}

// Scroll the page to the marker element by id
function jumpToMarker(markerId) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: (id) => {
                const el = document.getElementById(id);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Optionally highlight the element briefly
                    el.style.transition = 'background-color 0.5s ease';
                    el.style.backgroundColor = 'yellow';
                    setTimeout(() => { el.style.backgroundColor = ''; }, 1500);
                }
            },
            args: [markerId]
        });
    });
}

// Extract IP addresses, URLs, hashes, and CVEs from text array or string
function extractIpAddressAndUrlAndHashes(text) {
    if (Array.isArray(text)) text = text.join(' ');

    const extractedData = {};

    for (const key in patterns) {
        const pattern = patterns[key];
        const matches = text.match(pattern);
        if (matches) {
            extractedData[key] = [...new Set(matches)];
        } else {
            extractedData[key] = [];
        }
    }

    return extractedData;
}

// This runs inside the page context to inject markers and return array of matches + ids
function extractTextWithMarkers() {
    const patternsArray = [
        { key: 'ipAddresses', pattern: /\b(?:\d{1,3}(?:\.\d{1,3}|\[\.\]){3}\d{1,3}|\d{1,3}(?:\[\.\]\d{1,3}){3}|\d{1,3}(?:\.\d{1,3}){3})\b/g },
        { key: 'urlsAndUris', pattern: /\b(?:https?:\/\/[^\s/$.?#].[^\s]*|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|[a-zA-Z0-9-]+\[[.]\][a-zA-Z]{2,}|[a-zA-Z]:\\[^\\]+\\[^\\]+\\[^\\]+\\[^\\]+\.[a-zA-Z0-9]+|\/[^\s/]+(?:\/[^\s/]+)*|\\\\[^\\]+\\[^\\]+(?:\\[^\\]+)+\\[^\s/]+\.[a-zA-Z0-9]+)\b/g },
        { key: 'hashes', pattern: /\b[0-9a-fA-F]{32}\b|\b[0-9a-fA-F]{40}\b|\b[0-9a-fA-F]{64}\b/g },
        { key: 'cves', pattern: /\bCVE-\d{4}-\d{4,7}\b/g }
    ];

    // Walk text nodes and replace matches with <span> markers with unique IDs
    function walkNodes(node) {
        // Skip unwanted nodes
        if (
            node.nodeType === Node.ELEMENT_NODE &&
            ['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE'].includes(node.tagName)
        ) {
            return; // skip script, style, code blocks, preformatted text
        }

        if (node.nodeType === Node.TEXT_NODE) {
            // Only process text nodes that have visible text and whose parent is visible
            const parent = node.parentElement;
            if (!parent) return;

            // Skip if parent or any ancestor is hidden (display:none or visibility:hidden)
            let el = parent;
            while (el && el !== document.body) {
                const style = window.getComputedStyle(el);
                if (style.display === 'none' || style.visibility === 'hidden') {
                    return;
                }
                el = el.parentElement;
            }

            let text = node.nodeValue;
            let matches = [];

            // Collect all matches from all patterns
            patternsArray.forEach(({ pattern }) => {
                pattern.lastIndex = 0;
                let m;
                while ((m = pattern.exec(text)) !== null) {
                    matches.push({ index: m.index, length: m[0].length, text: m[0] });
                }
            });

            if (matches.length === 0) return;

            // Sort matches by index ascending
            matches.sort((a, b) => a.index - b.index);

            // Filter overlapping matches, keep first
            let filteredMatches = [];
            let lastEnd = -1;
            for (const match of matches) {
                if (match.index >= lastEnd) {
                    filteredMatches.push(match);
                    lastEnd = match.index + match.length;
                }
            }

            // Rebuild the node with inserted span markers
            const fragment = document.createDocumentFragment();
            let lastPos = 0;

            filteredMatches.forEach(({ index, length, text }) => {
                // Add text before match
                if (index > lastPos) {
                    fragment.appendChild(document.createTextNode(text.substring(lastPos, index)));
                }

                // Add matched text wrapped in span with unique id
                const span = document.createElement('span');
                span.textContent = text;
                span.className = 'ioc-marker';
                const uniqueId = `ioc-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
                span.id = uniqueId;
                span.setAttribute('data-ioc', text);
                fragment.appendChild(span);

                lastPos = index + length;
            });

            // Add remaining text
            if (lastPos < text.length) {
                fragment.appendChild(document.createTextNode(text.substring(lastPos)));
            }

            // Replace original text node with new fragment
            node.parentNode.replaceChild(fragment, node);
        } else if (node.nodeType === Node.ELEMENT_NODE && node.childNodes) {
            // recurse on children
            Array.from(node.childNodes).forEach(child => walkNodes(child));
        }
    }


    walkNodes(document.body);

    // Gather all markers with their ioc text and ids
    const markers = Array.from(document.querySelectorAll('.ioc-marker')).map(el => ({
        ioc: el.getAttribute('data-ioc'),
        id: el.id
    }));

    return markers;
}

// When popup loads
document.addEventListener('DOMContentLoaded', function() {
    const downloadButton = document.getElementById('downloadButton');
    let activeTab;

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        activeTab = tabs[0];
        extractDataFromTab(activeTab.id);
    });

    downloadButton.addEventListener('click', function() {
        // Combine all the data into a single array
        const allData = extractedMatches.slice();

        // Filter out duplicates and maintain order
        const uniqueData = [];
        const uniqueSet = new Set();

        for (const item of allData) {
            if (!uniqueSet.has(item)) {
                uniqueSet.add(item);
                uniqueData.push(item);
            }
        }

        // Create a text file with the correct content
        const dataText = uniqueData.join('\n');

        // Generate a filename using the TLD and current epoch time
        const tld = new URL(activeTab.url).hostname.split('.').slice(-2).join('.');
        const filename = `${tld}_${Date.now()}.txt`;

        // Create a blob with the text data
        const blob = new Blob([dataText], { type: 'text/plain' });

        // Create a URL for the blob
        const url = URL.createObjectURL(blob);

        // Create an invisible anchor element to trigger the download
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);

        // Trigger the download
        a.click();

        // Clean up the URL object
        URL.revokeObjectURL(url);
    });
});
