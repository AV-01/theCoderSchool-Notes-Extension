# theCoderSchool AI Notes Extension

A Chrome Extension that generates student lesson notes for theCoderSchool Notes+ portal using the Google Gemini API.

## Purpose
For my job at theCoderSchool, I need to write lesson notes for my students. I don't like writing notes, so I decided to make an extension to help me write them. All I need to do is write bullet points about what the student did, and the extension will write the note for me!

## Features
- Injects a "Generate Note" button natively into the Notes+ writeNote.php page.
- Reads bullet points directly from the TinyMCE rich text editor.
- Generates a professional, supportive lesson summary paragraph using Gemini 2.5 Flash.
- Reads the previous lesson note to maintain ongoing context.
- Automatically injects coding concepts (e.g., Variables, Loops) into the native concept tag input field.
- Saves the most recently generated concept tags to the extension popup for manual copying.

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
2. Type bullet points outlining the lesson into the main text box.
3. Click the green **Generate Note** button at the bottom of the page.
4. The extension will replace your bullet points with a formatted paragraph and automatically populate the concept tags.
