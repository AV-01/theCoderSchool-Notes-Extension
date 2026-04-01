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
});
