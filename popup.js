document.addEventListener('DOMContentLoaded', function() {
    const extractedDataContainer = document.getElementById('extractedData');
    const downloadButton = document.getElementById('downloadButton');
    let extractedData = {
        ipAddresses: [],
        urlsAndUris: []
    };

    let activeTab; // Define activeTab here

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        activeTab = tabs[0]; // Update the value of activeTab
        chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: extractText
        }, function(results) {
            const extractedText = results[0].result;
            const extracted = extractIpAddressAndUrl(extractedText);
            extractedData.ipAddresses.push(...extracted.ipAddresses);
            extractedData.urlsAndUris.push(...extracted.urlsAndUris);
            displayUniqueIpAddressesAndUrls(extractedData.ipAddresses, extractedData.urlsAndUris);
        });
    });

    downloadButton.addEventListener('click', function() {
        downloadUniqueIpAddressesAndUrls(extractedData.ipAddresses, extractedData.urlsAndUris);
    });

    function displayUniqueIpAddressesAndUrls(ipAddresses, urlsAndUris) {
        extractedDataContainer.innerHTML = '';
    
        ipAddresses.forEach(ip => {
            const div = createItemDiv(ip, 'IP Address');
            extractedDataContainer.appendChild(div);
        });
    
        urlsAndUris.forEach(url => {
            const div = createItemDiv(url, 'URL/URI');
            extractedDataContainer.appendChild(div);
        });
    }

    function createItemDiv(value, label) {
        const div = document.createElement('div');
        
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', function() {
            removeItem(value);
        });
    
        const text = document.createElement('span');
        text.textContent = value;
    
        div.appendChild(removeButton);
        div.appendChild(text);
    
        return div;
    }

    function removeItem(value) {
        extractedData.ipAddresses = extractedData.ipAddresses.filter(ip => ip !== value);
        extractedData.urlsAndUris = extractedData.urlsAndUris.filter(url => url !== value);
        displayUniqueIpAddressesAndUrls(extractedData.ipAddresses, extractedData.urlsAndUris);
    }

    function extractText() {
        const allText = document.body.innerText;
        return allText;
    }

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

    function downloadUniqueIpAddressesAndUrls(uniqueIpAddresses, uniqueUrlsAndUris) {
        const allData = [...uniqueIpAddresses, ...uniqueUrlsAndUris];
        const dataText = allData.join('\n');
        const blob = new Blob([dataText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.style.display = 'none';
        
        // Get the TLD from the active tab's URL
        const tld = new URL(activeTab.url).hostname.split('.').slice(-2).join('.');
        
        // Generate a filename using the TLD and current epoch time
        const filename = `${tld}_${Date.now()}.txt`;
        
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        URL.revokeObjectURL(url);
    }
});
