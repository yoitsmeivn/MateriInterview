# AI_USAGE.md

## Overview

This document describes how AI tools were used during the development of Materi.

## AI Tools Used

### 1. ChatGPT (OpenAI GPT-5)
**Purpose:** General development assistance and problem-solving.  

ChatGPT was used to:
Refine and debug frontend UI layouts (React + CSS) to achieve a minimal design.  
Assist in designing the pagination system to maintain a consistent A4 sized layout across devices.  
Generate and refine logic for caret preservation across paginated text areas.  
Suggest improved methods for sanitization, ensuring compatibility with character sets.  
Help draft clear and consistent documentation files (`README.md`, `ARCHITECTURE.md`, `AI_USAGE.md`).

prompts included:
- “Help me design a consistent A4 style pagination system in React with dynamic text reflow.”  
- “How do I sanitize OpenAI responses to remove invisible Unicode characters without breaking text?”  
- “Generate a minimalist chat assistant component”  
- "Help me with components and AI ChatAssistant.


---

### 2. OpenAI API (GPT-4o-mini)
Purpose: Integrated AI assistant within Materi for real time document editing and writing aid.  

The application uses OpenAI’s `gpt-4o-mini` model for:
Generating and writing document content inside the editor.  
Providing live AI streaming responses via `/api/ai`.  
Acting as an interactive writing assistant


Materi-2025