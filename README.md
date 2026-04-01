# theCoderSchool AI Notes Extension

A Chrome Extension that generates student lesson notes for theCoderSchool Notes+ portal using the Google Gemini API.

## Purpose
For my job at theCoderSchool, I need to write lesson notes for my students. I don't like writing notes, so I decided to make an extension to help me write them. All I need to do is write bullet points about what the student did, and the extension will write the note for me!

![Example Response](Example%20Response.png)

## Features
- Injects a "Generate Note" button natively into the Notes+ writeNote.php page.
- Reads bullet points directly from the TinyMCE rich text editor.
- Generates a professional, supportive lesson summary paragraph using Gemini 2.5 Flash.
- Auto-extracts the native student name, coding language, and project name from the website and displays them cleanly in the extension popup for quick context.
- Automatically injects coding concepts (e.g., Variables, Loops) directly into the native concept tag input field via simulated keystrokes.

## Installation
1. Clone or download this repository.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the directory containing the extension files.

## Setup
1. Obtain a Google Gemini API Key from Google AI Studio.
2. Click the extension icon in your Chrome toolbar.
3. Paste your API key and click **Save**. This is a one-time setup; the key is saved locally.

## Usage
1. Navigate to a student's `writeNote.php` page in the Notes+ portal.
2. Type rough bullet points outlining the lesson into the main text box.
3. Click the green **Generate Note** button at the bottom of the page.
4. The extension will read your points, replace them with a formatted paragraph, and automatically populate the concept tags!

## Challenges Faced
During development, several technical hurdles were overcome to ensure seamless, native integration within the Notes+ portal:

- **Iframe Manipulation:** The portal uses a TinyMCE rich text editor embedded within an `iframe`. Reading and rewriting the raw bullet points required bypassing the primary DOM and dynamically querying the `contentDocument` of the isolated iframe object.
- **Simulating Native User Input:** The portal's "Concepts" input field strictly relies on specialized JavaScript `keyup` listeners. Standard DOM manipulation (e.g., `input.value = "Loops"`) bypassed their event listeners entirely. We countered this by building a custom, delayed asynchronous loop that manually triggers simulated `KeyboardEvent` objects (acting like the 'Enter' key) to trick the native listeners into registering the AI-generated concepts.
- **Strict JSON Output Enforcement:** Preventing the Google Gemini model from returning conversational filler or markdown blocks required strict prompt engineering and specifically supplying the `responseMimeType: "application/json"` configuration flag so the resulting data could be reliably parsed by the extension.
