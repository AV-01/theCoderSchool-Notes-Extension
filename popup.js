document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const customPromptInput = document.getElementById('customPrompt');
  const saveBtn = document.getElementById('saveBtn');
  const statusEl = document.getElementById('status');

  const defaultPrompt = `You are an expert assistant for coding coaches. You are writing note summaries to parents of students. 

Student Context:
- Name: {studentName}
- Language: {language}
- Project: {project}

Today's student bullet points:
{bullets}

Write a short, single paragraph on what the student worked on and how they did. Do NOT use markdown. Avoid filler, but make it clear work was done.
Focus on the "why" and "how" of the logic.
Tone: Supportive, clear, and professional. Use the same style as this example: "Emmy continued to work on her Tacos project. She now has three tacos she coded to move up and down, which she really enjoyed playing around with. I also showed her how to design her own sprites..."
Also extract at least 5 general coding concepts the student practiced. Use vague, general terms similar to: "Variables", "Loops", "if then", "animation", "sprites", "coordinates", "Broadcasting", "Object-Oriented Programming", "Arrays", "Events".

Return ONLY valid JSON in this format:
{
  "paragraph": "The generated paragraph here...",
  "concepts": ["concept1", "concept2", "concept3"]
}`;

  // Load existing settings
  chrome.storage.local.get(['geminiApiKey', 'customPrompt'], (result) => {
    if (result.geminiApiKey) apiKeyInput.value = result.geminiApiKey;
    if (result.customPrompt) {
      customPromptInput.value = result.customPrompt;
    } else {
      customPromptInput.value = defaultPrompt;
    }
  });

  // Save new settings
  saveBtn.addEventListener('click', () => {
    chrome.storage.local.set({ 
      geminiApiKey: apiKeyInput.value.trim(),
      customPrompt: customPromptInput.value.trim() || defaultPrompt
    }, () => {
      statusEl.textContent = 'Settings saved!';
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
