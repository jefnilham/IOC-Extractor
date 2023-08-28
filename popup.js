// When the 'extractButton' is clicked, perform the following actions
document.getElementById('extractButton').addEventListener('click', function() {
    // Query the currently active tab in the Chrome browser
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const activeTab = tabs[0];
        chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: extractText
        }, function(results) {
            const extractedText = results[0].result;
            const uniqueIpAddresses = extractIpAddress(extractedText);
            displayUniqueIpAddresses(uniqueIpAddresses); // Display unique IP addresses in popup
            console.log(uniqueIpAddresses); // Log unique IP addresses to console
            // Initiate the download action when button is clicked
            document.getElementById('extractButton').addEventListener('click', function() {
                downloadUniqueIpAddresses(uniqueIpAddresses);
            });
        });
    });
});

function extractText() {
    const allText = document.body.innerText;
    return allText;
}

function extractIpAddress(text) {
    const ipAddressPattern = /\b(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\d{1,3}\.\d{1,3}\.\d{1,3}\[\.\]\d{1,3})\b/g;
    const ipAddresses = text.match(ipAddressPattern);

    if (ipAddresses) {
        const uniqueIpAddresses = [...new Set(ipAddresses)];
        return uniqueIpAddresses;
    } else {
        return [];
    }
}

function displayUniqueIpAddresses(uniqueIpAddresses) {
    const extractedTextPre = document.getElementById('extractedText');
    
    // Create hyperlinks for each unique IP address
    const hyperlinks = uniqueIpAddresses.map(ip => {
        const shodanUrl = `https://www.shodan.io/host/${ip}`;
        return `<a href="${shodanUrl}" target="_blank">${ip}</a>`;
    });

    extractedTextPre.innerHTML = hyperlinks.join('<br>');
}

function downloadUniqueIpAddresses(uniqueIpAddresses) {
    const ipAddressesText = uniqueIpAddresses.join('\n');
    const blob = new Blob([ipAddressesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'unique_ip_addresses.txt';
    document.body.appendChild(a);
    a.click();
    
    URL.revokeObjectURL(url);
}

