function initPageButton() {
  if (document.getElementById('tcs-ai-page-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'tcs-ai-page-btn';
  btn.textContent = 'Generate Note';

  // Inject into .myfooter
  const container = document.querySelector('.myfooter') || document.body;
  container.appendChild(btn);

  btn.addEventListener('click', handlePageGenerate);
}

async function handlePageGenerate(e) {
  e.preventDefault(); // prevent form submit if inside form

  const btn = document.getElementById('tcs-ai-page-btn');
  const originalText = btn.textContent;

  // 1. Get Settings
  const storageData = await new Promise(resolve => chrome.storage.local.get(['geminiApiKey', 'customPrompt'], resolve));
  const apiKey = storageData.geminiApiKey;
  if (!apiKey) {
    alert("Please open the AI Notes+ extension popup and save your Gemini API Key first!");
    return;
  }

  let bullets = "";
  const iframe = document.getElementById('note_ifr');
  if (iframe && iframe.contentDocument) {
    const tinyBody = iframe.contentDocument.getElementById('tinymce');
    if (tinyBody) bullets = tinyBody.innerText.trim();
  }

  if (!bullets) {
    alert("Please type your bullet points into the main note box first!");
    return;
  }

  // 2. Get Student Context
  const langEl = document.getElementById('language');
  const language = langEl && langEl.value !== "-" ? langEl.value : "(No language selected)";

  const projEl = document.getElementById('appname');
  const project = projEl && projEl.value.trim() !== "" ? projEl.value.trim() : "their project";

  const nameSpans = document.querySelectorAll('span[style*="color:#00aa00"], span[style*="color: #00aa00"]');
  let studentName = "The student";
  if (nameSpans.length > 0) studentName = nameSpans[0].innerText.trim();

  // 3. Call API
  btn.textContent = 'Generating...';
  btn.disabled = true;

  try {
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

    const promptTemplate = storageData.customPrompt || defaultPrompt;
    
    // Replace variables
    const prompt = promptTemplate
      .replace(/{studentName}/g, studentName)
      .replace(/{language}/g, language)
      .replace(/{project}/g, project)
      .replace(/{bullets}/g, bullets);

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Invalid response format from Gemini.");

    const parsed = JSON.parse(text);

    // 4. Inject Paragraph
    if (iframe && iframe.contentDocument) {
      const tinyBody = iframe.contentDocument.getElementById('tinymce');
      if (tinyBody) {
        tinyBody.innerHTML = '';
        const p = iframe.contentDocument.createElement('p');
        p.innerText = parsed.paragraph.trim();
        tinyBody.appendChild(p);
      }
    }

    // 5. Inject Concepts and save for popup
    if (parsed.concepts && Array.isArray(parsed.concepts)) {
      chrome.storage.local.set({ lastConcepts: parsed.concepts });

      const inputEl = document.getElementById('addconcept');
      if (inputEl) {
        let delay = 0;
        parsed.concepts.forEach((concept) => {
          if (!concept || !concept.trim()) return;
          setTimeout(() => {
            inputEl.value = concept;
            const event = new KeyboardEvent('keyup', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              which: 13,
              bubbles: true,
              cancelable: true
            });
            inputEl.dispatchEvent(event);
          }, delay);
          delay += 250;
        });
      }
    }

    btn.textContent = '✓ Note Generated! (Check popup for concepts)';
    setTimeout(() => { btn.textContent = originalText; }, 4000);

  } catch (err) {
    console.error(err);
    alert("Error generating note: " + err.message);
    btn.textContent = 'Error! Try Again';
    setTimeout(() => { btn.textContent = originalText; }, 3000);
  } finally {
    btn.disabled = false;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPageButton);
} else {
  setTimeout(initPageButton, 500);
}
