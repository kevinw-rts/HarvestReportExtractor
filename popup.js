document.getElementById("downloadReport").addEventListener("click", () => {
  // Get the active tab in the current window
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // Execute content script on the active tab
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        files: ["content.js"],
      },
      (result) => {
        // Check if there are any errors in executing the script
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
        } else {
          console.log("Content script executed successfully");
        }
      }
    );
  });
});
