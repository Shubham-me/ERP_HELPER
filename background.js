chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.action === "runScript") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) return;
            let tab = tabs[0]; // current tab
            console.log(tab.url);
            if(tab.url !== 'https://erp.iith.ac.in/Default/Pages/Portal/PortalInfrastructure.html'){
                return;
            }
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files : ["run.js"]
            });
        });
    }
    else if (message.action === "openNewTab") {
        const dataUrl = "data:text/html;charset=utf-8," + encodeURIComponent(message.data);
        chrome.tabs.create({ url: dataUrl });
    }
});
