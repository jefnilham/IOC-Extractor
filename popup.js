document.getElementById('extractButton').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const activeTab = tabs[0];
        chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: extractText
        }, function(results) {
            const extractedText = results[0].result;
            extractIpAddress(extractedText);
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
        const uniqueIpAddresses = [...new Set(ipAddresses)]; // Remove duplicates
        const extractedTextPre = document.getElementById('extractedText');
        
        // Create hyperlinks for each unique IP address
        const hyperlinks = uniqueIpAddresses.map(ip => {
            const shodanUrl = `https://www.shodan.io/host/${ip}`;
            return `<a href="${shodanUrl}" target="_blank">${ip}</a>`;
        });

        extractedTextPre.innerHTML = hyperlinks.join('<br>');
    }
}

