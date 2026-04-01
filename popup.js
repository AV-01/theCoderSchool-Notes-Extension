document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const statusEl = document.getElementById('status');

  // Load existing key
  chrome.storage.local.get(['geminiApiKey'], (result) => {
    if (result.geminiApiKey) apiKeyInput.value = result.geminiApiKey;
  });

  // Save new key
  saveBtn.addEventListener('click', () => {
    chrome.storage.local.set({ geminiApiKey: apiKeyInput.value.trim() }, () => {
      statusEl.textContent = 'Key saved!';
      statusEl.className = 'status-msg success';
      setTimeout(() => { statusEl.textContent = ''; }, 2000);
    });
  });

  // Scrape info from page
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes("thecoderschool.com/notes")) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            const langEl = document.getElementById('language');
            const projEl = document.getElementById('appname');
            // Find student name - span with color #00aa00
            const nameSpans = document.querySelectorAll('span[style*="color:#00aa00"], span[style*="color: #00aa00"]');
            let studentName = "";
            if (nameSpans.length > 0) studentName = nameSpans[0].innerText.trim();
            
            return {
              language: langEl && langEl.value !== "-" ? langEl.value : "",
              project: projEl ? projEl.value.trim() : "",
              name: studentName
            };
          }
        });
        const res = results[0]?.result;
        if (res) {
          document.getElementById('ctxName').textContent = res.name || "N/A";
          document.getElementById('ctxLang').textContent = res.language || "N/A";
          document.getElementById('ctxProj').textContent = res.project || "N/A";
        }
      } catch (e) {
        console.error("Script execution failed: ", e);
      }
    } else {
        document.getElementById('ctxName').textContent = "Not on Notes Page";
        document.getElementById('ctxLang').textContent = "Not on Notes Page";
        document.getElementById('ctxProj').textContent = "Not on Notes Page";
    }
  });
});
