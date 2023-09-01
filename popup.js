// Define global variables
let extractedData = {
    ipAddresses: [],
    urlsAndUris: []
};
let extractedMatches = [];

// Function to extract data from the active tab
function extractDataFromTab(tabId) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: extractText
    }, function(results) {
        const extractedText = results[0].result;
        const extracted = extractIpAddressAndUrl(extractedText);
        extractedData.ipAddresses.push(...extracted.ipAddresses);
        extractedData.urlsAndUris.push(...extracted.urlsAndUris);

        // Extract matches from the extracted text
        extractedMatches = extractedText.match(/(\b(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\d{1,3}\.\d{1,3}\.\d{1,3}\[\.\]\d{1,3}|https?:\/\/[^\s/$.?#].[^\s]*|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})\b)/g) || [];

        // Display the extracted data
        displayMatches();
    });
}

// Function to display matches
function displayMatches() {
    const extractedDataContainer = document.getElementById('extractedData');
    extractedDataContainer.innerHTML = '';

    // Iterate through matches and create divs
    extractedMatches.forEach(match => {
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
}

// Function to extract text from the active tab
function extractText() {
    const allText = document.body.innerText;
    return allText;
}

// Function to extract IP addresses and URLs from text
function extractIpAddressAndUrl(text) {
    const ipAddressPattern = /\b(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\d{1,3}\.\d{1,3}\.\d{1,3}\[\.\]\d{1,3})\b/g;
    const ipAddresses = text.match(ipAddressPattern);

    const urlAndUriPattern = /\b(?:https?:\/\/[^\s/$.?#].[^\s]*|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})\b/g;
    const urlsAndUris = text.match(urlAndUriPattern);

    if (ipAddresses && urlsAndUris) {
        const uniqueIpAddresses = [...new Set(ipAddresses)];
        const uniqueUrlsAndUris = [...new Set(urlsAndUris)];
        return {
            ipAddresses: uniqueIpAddresses,
            urlsAndUris: uniqueUrlsAndUris
        };
    } else if (ipAddresses) {
        const uniqueIpAddresses = [...new Set(ipAddresses)];
        return {
            ipAddresses: uniqueIpAddresses,
            urlsAndUris: []
        };
    } else if (urlsAndUris) {
        const uniqueUrlsAndUris = [...new Set(urlsAndUris)];
        return {
            ipAddresses: [],
            urlsAndUris: uniqueUrlsAndUris
        };
    } else {
        return {
            ipAddresses: [],
            urlsAndUris: []
        };
    }
}

// Event listener when popup is opened
document.addEventListener('DOMContentLoaded', function() {
    const extractedDataContainer = document.getElementById('extractedData');
    const downloadButton = document.getElementById('downloadButton');
    let activeTab; // Define activeTab here

    // Get the active tab and extract data
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        activeTab = tabs[0]; // Update the value of activeTab
        extractDataFromTab(activeTab.id);
    });

    downloadButton.addEventListener('click', function() {
        downloadUniqueIpAddressesAndUrls(extractedData.ipAddresses, extractedData.urlsAndUris);
    });

    function downloadUniqueIpAddressesAndUrls(uniqueIpAddresses, uniqueUrlsAndUris) {
        const allData = [...uniqueIpAddresses, ...uniqueUrlsAndUris];
        const dataText = allData.join('\n');
        const blob = new Blob([dataText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        // Get the TLD from the active tab's URL
        const tld = new URL(activeTab.url).hostname.split('.').slice(-2).join('.');

        // Generate a filename using the TLD and current epoch time
        const filename = `${tld}_${Date.now()}.txt`;

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        URL.revokeObjectURL(url);
    }
});
