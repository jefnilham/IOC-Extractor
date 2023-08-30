document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('extractButton').addEventListener('click', function() {
        // Query the currently active tab in the Chrome browser
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const activeTab = tabs[0];
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                function: extractText
            }, function(results) {
                const extractedText = results[0].result;
                const extractedData = extractIpAddressAndUrl(extractedText);
                console.log(extractedData)
                const uniqueIpAddresses = extractedData.ipAddresses;
                const uniqueUrlsAndUris = extractedData.urlsAndUris;

                displayUniqueIpAddressesAndUrls(uniqueIpAddresses, uniqueUrlsAndUris);
                // Initiate the download action when button is clicked
                document.getElementById('extractButton').addEventListener('click', function() {
                    downloadUniqueIpAddressesAndUrls(uniqueIpAddresses, uniqueUrlsAndUris);
                });
            });
        });
    });
});



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

function displayUniqueIpAddressesAndUrls(ipAddresses, urlsAndUris) {
    const extractedDataPre = document.getElementById('extractedData');
    
    // Create hyperlinks for each unique IP address
    const ipLinks = ipAddresses.map(ip => {
        const shodanUrl = `https://www.shodan.io/host/${ip}`;
        return `<a href="${shodanUrl}" target="_blank">${ip}</a>`;
    });

    // Create hyperlinks for each unique URL/URI
    const urlAndUriLinks = urlsAndUris.map(url => {
        return `<a href="${url}" target="_blank">${url}</a>`;
    });

    // Combine IP links and URL/URI links
    const allLinks = ipLinks.concat(urlAndUriLinks);

    extractedDataPre.innerHTML = allLinks.join('<br>');
}


function downloadUniqueIpAddressesAndUrls(uniqueIpAddresses, uniqueUrlsAndUris) {
    const allData = [...uniqueIpAddresses, ...uniqueUrlsAndUris];
    const dataText = allData.join('\n');
    const blob = new Blob([dataText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'unique_data.txt'; // Change the filename as needed
    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
}


