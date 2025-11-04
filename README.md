<<<<<<< HEAD
# Materi — Founding Engineer Case Study

Materi is a modern, full-stack document editor that provides a Google Docs–style writing experience with AI powered assistance.  
It includes visible pagination (A4 layout) and an integrated chat assistant powered by OpenAI.

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

### Get(Get Documents)

### Delete(Delete Documents)

### Post-AI(AI Chat Bot)

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
>>>>>>> a4cd6201a6d09bcf2b8ea9d54f13d107adc51a83
