// Define global variables
let extractedData = {
    ipAddresses: [],
    urlsAndUris: [],
    hashes: []
};
let extractedMatches = [];

// Function to extract data from the active tab
function extractDataFromTab(tabId) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: extractText
    }, function(results) {
        const extractedText = results[0].result;
        const extracted = extractIpAddressAndUrlAndHashes(extractedText);

        // Extracted data is added in the order it's found
        extractedData.ipAddresses.push(...extracted.ipAddresses);
        extractedData.urlsAndUris.push(...extracted.urlsAndUris);
        extractedData.hashes.push(...extracted.hashes);

        extractedMatches = [];

        // Extract matches from the extracted text
        extractedMatches.push(...extractedText.match(/(\b(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\d{1,3}\.\d{1,3}\.\d{1,3}\[\.\]\d{1,3}|https?:\/\/[^\s/$.?#].[^\s]*|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})\b|\b[0-9a-fA-F]{32}\b|\b[0-9a-fA-F]{40}\b|\b[0-9a-fA-F]{64}\b)/g) || []);

        // Display the extracted data
        displayMatches();
    });
}

// Function to display matches
function displayMatches() {
    const extractedDataContainer = document.getElementById('extractedData');
    extractedDataContainer.innerHTML = '';

    // Filter extractedMatches to unique values
    const uniqueMatches = [...new Set(extractedMatches)];

    // Iterate through unique matches and create divs
    uniqueMatches.forEach(match => {
        const div = createItemDiv(match, " ");
        extractedDataContainer.appendChild(div);
    });
}

// Function to create a div for a match
function createItemDiv(value, label) {
    const div = document.createElement('div');

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', function() {
        removeItem(value);
    });

    const text = document.createElement('span');
    text.textContent = label + value;

    div.appendChild(removeButton);
    div.appendChild(text);

    return div;
}

// Function to remove an item from the displayed and extracted matches
function removeItem(value) {
    extractedMatches = extractedMatches.filter(match => match !== value);
    removeFromExtractedData(value);
    displayMatches();
}

// Function to remove an item from extractedData
function removeFromExtractedData(value) {
    extractedData.ipAddresses = extractedData.ipAddresses.filter(ip => ip !== value);
    extractedData.urlsAndUris = extractedData.urlsAndUris.filter(url => url !== value);
    extractedData.hashes = extractedData.hashes.filter(hash => hash !== value)
}

// Function to extract text from the active tab
function extractText() {
    const allText = document.body.innerText;
    return allText;
}

// Function to extract IP addresses, URLs, and Hashes from text
function extractIpAddressAndUrlAndHashes(text) {
    const ipAddressPattern = /\b(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\d{1,3}\.\d{1,3}\.\d{1,3}\[\.\]\d{1,3})\b/g;
    const ipAddresses = text.match(ipAddressPattern);

    const urlAndUriPattern = /\b(?:https?:\/\/[^\s/$.?#].[^\s]*|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})\b/g;
    const urlsAndUris = text.match(urlAndUriPattern);

    const hashPattern = /\b[0-9a-fA-F]{32}\b|\b[0-9a-fA-F]{40}\b|\b[0-9a-fA-F]{64}\b/g;
    const hashes = text.match(hashPattern)

    if (ipAddresses && urlsAndUris && hashes) {
        const uniqueIpAddresses = [...new Set(ipAddresses)];
        const uniqueUrlsAndUris = [...new Set(urlsAndUris)];
        const uniqueHashes = [...new Set(hashes)];
        return {
            ipAddresses: uniqueIpAddresses,
            urlsAndUris: uniqueUrlsAndUris,
            hashes: uniqueHashes
        };
    } else if (ipAddresses && urlsAndUris) {
        const uniqueIpAddresses = [...new Set(ipAddresses)];
        const uniqueUrlsAndUris = [...new Set(urlsAndUris)];
        return {
            ipAddresses: uniqueIpAddresses,
            urlsAndUris: uniqueUrlsAndUris,
            hashes: []
        };
    } else if (ipAddresses && hashes) {
        const uniqueIpAddresses = [...new Set(ipAddresses)];
        const uniqueHashes = [...new Set(hashes)];
        return {
            ipAddresses: uniqueIpAddresses,
            urlsAndUris: [],
            hashes: uniqueHashes
        };
    } else if (urlsAndUris && hashes) {
        const uniqueUrlsAndUris = [...new Set(urlsAndUris)];
        const uniqueHashes = [...new Set(hashes)];
        return {
            ipAddresses: [],
            urlsAndUris: uniqueUrlsAndUris,
            hashes: uniqueHashes
        }
    } else if (ipAddresses) {
        const uniqueIpAddresses = [...new Set(ipAddresses)];
        return {
            ipAddresses: uniqueIpAddresses,
            urlsAndUris: [],
            hashes: []
        };
    } else if (urlsAndUris) {
        const uniqueUrlsAndUris = [...new Set(urlsAndUris)];
        return {
            ipAddresses: [],
            urlsAndUris: uniqueUrlsAndUris,
            hashes: []
        };
    } else if (hashes) {
        const uniqueHashes = [...new Set(hashes)];
        return {
            ipAddresses: [],
            urlsAndUris: [],
            hashes: uniqueHashes
        };
    } else {
        return {
            ipAddresses: [],
            urlsAndUris: [],
            hashes: []
        };
    }
}

// Event listener when popup is opened
document.addEventListener('DOMContentLoaded', function() {
    const downloadButton = document.getElementById('downloadButton');
    let activeTab; // Define activeTab here

    // Get the active tab and extract data
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        activeTab = tabs[0]; // Update the value of activeTab
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
