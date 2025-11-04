# Materi — Founding Engineer Case Study

Materi is a modern, full-stack document editor that provides a Google Docs–style writing experience with AI powered assistance.  
It includes visible pagination (A4 layout) and an integrated chat assistant powered by OpenAI.

To complete this task, I created a dashboard page called “Home” that serves as the dashboard for managing all documents or 'workspaces'. 
From here, users can:
* Create new documents using the “New Document” button, which generates a new file entry in the system.
* View all saved documents.
* Edit existing documents by selecting them.

Each document is saved locally in the backend as a JSON file, making it easy to manage through the dashboard.

When a user selects a document, it opens inside the Materi Editor.

---

## Prerequisites & Setup

### Install dependencies
Run these commands at the root of your project:
    npm install

### Environment variables
Create a '.env' file in the root of the project with your OpenAI key for the AI Chat:
OPENAI_API_KEY = key (no quotes)

### Starting the App
To start both the frontend and backend servers, use:
    npm run dev-all
Front end runs on: http://localhost:5173

## API Endpoints

### Post(Create / Save Documents)
Creates or saves a new document.
The server generates an id automatically, unique to the document.

POST /documents

### Get(Get Documents)
GET /documents
Fetches a list of all saved documents (returns only basic info like ID and title). Used in Home.jsx
Example:
    {
    "id": "101010",
    "title": "Draft"
  }

GET /documents/:id
Fetches a specific document by its ID.
Example:
    {
  "id": "10101011",
  "title": "Draft",
  "content": "Hello World."
}

### Delete(Delete Documents)
DELETE /documents/:id
Deletes a specific document by its ID.

### Post-AI(AI Chat Bot)
POST /api/ai
Sends a chat message to the AI assistant.(Prompting)
The AI reads the message and returns a generated reply and can autofill content in the editor.

## Document Storage

Each document is saved as a .json file located in /backend/data/.
Each file has this format:
    {
        "id": "1730625402",
        "title": "My Document",
        "content": [
            "This is the text content of the document."
        ]
    }

## Pagination Logic

Each page is A4-like
Page 1 has a title block
Pagination breaks lines dynamically based on available height.
The position is globally tracked and restored after every reflow.

## AI Assistant (AI Chat Bot)

The integrated Materi AI chat assistant nserts generated content at the user’s position in the active page.
Needs OPEN AI Key and key is not exposed in the repo.


# Materi — 2025
=======
# MateriInterview
Materi Interview Repo. | Ivan Severinov
