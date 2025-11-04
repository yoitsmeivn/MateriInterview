# Materi — Founding Engineer Case Study

Materi is a modern, full-stack document editor that provides a Google Docs–style writing experience with AI powered assistance.  
It includes visible pagination (A4 layout) and an integrated chat assistant powered by OpenAI.
It is composed of a **React frontend** and a **Node.js backend**.


---

## Editor 

The **Editor** component in React manages all document state:

 `text`: The entire document content as a single joined string. 
 `pages`: Derived from `text` using the `paginate()` helper. 
 `plannedGlobalCaretRef`: Tracks global position across pages to preserve cursor stability.
 `focusedPageIndex`: Tracks which page is active. 

When a user types:

1. The `text` state updates.  
2. The content is paginated into pages.  
3. The global caret is recalculated.  

The model ensures consistent cursor position and live pagination/dynamic updates
---

## Pagination Flow

Pagination is implemented in the `paginate(fullText)` helper:

1. Split the document into lines using `fullText.split("\n")`.  
2. Estimate visual line height using:   
estimatedHeight = (line.length / 80) * LINE_HEIGHT
3. Accumulate height until the available space for that page is filled.
4. When over the limit, start a new page.  
5. Continue until all lines are filled.  
6. Return an array of page text blocks.

## Persistence Layer (Client to Server)

The client communicates with the backend through simple REST APIs:



`/documents` | `POST` | Save a document 
`/documents/:id` | `GET` | Fetch a document 
`/documents/:id` | `DELETE` | Remove document
`/api/ai` | `POST` | OpenAI 

### Storage Format

Each document is saved as a `.json` file under `/backend/data/`:
Please refer to README.md for full explanation.

## AI integration
The /api/ai endpoint handles AI interaction.
The backend receives the conversation messages array.
It calls openai.chat.completions.create() using the gpt-4o-mini model.
The response text is sanitized

## Development Flow

Run both frontend and backend together using:
npm run dev-all

## Design

Local first
Pagination: Consistent A4 layout across devices.
AI: text generation into the editor
Security: API key remains backend only.


# Materi — 2025