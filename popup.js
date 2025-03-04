document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("runButton").addEventListener("click", function() {
        console.log("clicked");
        chrome.runtime.sendMessage({
            action: "runScript",
        });
    });
});