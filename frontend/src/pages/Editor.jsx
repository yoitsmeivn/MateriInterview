import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import "./Editor.css";
import ChatAssistant from "../components/ChatAssistant";



export default function Editor() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [text, setText] = useState("");
  const [title, setTitle] = useState(searchParams.get("title") || "Untitled Document");
  const [showSaved, setShowSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  // A4 constants 
  const PAGE_WIDTH = 794;
  const PAGE_HEIGHT = 1123;
  const MARGIN = 72;
  const CONTENT_HEIGHT = PAGE_HEIGHT - MARGIN * 2;
  const LINE_HEIGHT = 25.6;
  const TITLE_HEIGHT = 70;

  // Refs
  const pageRefs = useRef([]);
  const plannedGlobalCaretRef = useRef(null); // number | null
  const [focusedPageIndex, setFocusedPageIndex] = useState(0);

  // Load document
  useEffect(() => {
    if (id && id !== "new") {
      fetch(`http://localhost:3001/documents/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Not found");
          return res.json();
        })
        .then((doc) => {
          setTitle(doc.title);
          const body =
            Array.isArray(doc.content) ? doc.content.join("\n") : (doc.content || "");
          setText(body);
        })
        .catch(() => {});
    } else {
      setText("");
    }
  }, [id]);

  // Pagination helper
  const paginate = (fullText) => {
    const lines = (fullText ?? "").split("\n");
    const pages = [];
    let currentPage = [];
    let currentHeight = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isFirstPage = pages.length === 0;
      const availableHeight = isFirstPage ? CONTENT_HEIGHT - TITLE_HEIGHT : CONTENT_HEIGHT;

      const lineText = line || " ";
      const estimatedLines = Math.ceil(lineText.length / 80) || 1;
      const estimatedHeight = estimatedLines * LINE_HEIGHT;

      if (currentHeight + estimatedHeight > availableHeight && currentPage.length > 0) {
        pages.push(currentPage.join("\n"));
        currentPage = [line];
        currentHeight = estimatedHeight;
      } else {
        currentPage.push(line);
        currentHeight += estimatedHeight;
      }
    }
    if (currentPage.length > 0) pages.push(currentPage.join("\n"));
    if (pages.length === 0) pages.push(""); // keep page 1
    return pages;
  };

  // pages
  const pages = useMemo(() => paginate(text), [text]);

  // global caret offset
  const globalToPagePos = (globalOffset, slices) => {
    let acc = 0;
    for (let i = 0; i < slices.length; i++) {
      const len = slices[i].length;
      if (globalOffset <= acc + len) {
        return { pageIndex: i, pos: globalOffset - acc };
      }
      acc += len;
      // account for the newline that will be between slices when joined
      if (i < slices.length - 1) {
        if (globalOffset === acc) {
          // caret sits on the newline -> go to start of next page
          return { pageIndex: i + 1, pos: 0 };
        }
        acc += 1;
      }
    }
    // end of document
    const last = slices.length - 1;
    return { pageIndex: last, pos: slices[last].length };
  };

  // global caret offset
  const pagePosToGlobal = (pageIndex, posInPage, slices) => {
    let acc = 0;
    for (let i = 0; i < pageIndex; i++) {
      acc += slices[i].length + 1; // +1 for newline between pages
    }
    return acc + posInPage;
  };

  // Restore caret after any change
  useEffect(() => {
    const global = plannedGlobalCaretRef.current;
    if (global == null) return;

    const slices = pages;
    const { pageIndex, pos } = globalToPagePos(global, slices);
    const el = pageRefs.current[pageIndex];
    if (el) {
      el.focus();
      const clamped = Math.max(0, Math.min(el.value.length, pos));
      el.setSelectionRange(clamped, clamped);
    }
    plannedGlobalCaretRef.current = null;
  }, [pages]); 

  // Replace only the edited page slice and rebuild full text, preserving caret
  function handlePageChange(pageIndex, e) {
    const value = e.target.value;
    const selectionStart = e.target.selectionStart ?? value.length;

    // Use current slices to compute global caret after this edit
    const currentSlices = paginate(text);
    currentSlices[pageIndex] = value;

    // global caret after change = sum(prev slices + newlines) + selectionStart
    const global = pagePosToGlobal(pageIndex, selectionStart, currentSlices);
    plannedGlobalCaretRef.current = global;

    setText(currentSlices.join("\n"));
  }

  function handleKeyDown(pageIndex, e) {
    const el = pageRefs.current[pageIndex];
    if (!el) return;

    const slices = paginate(text);
    const localStart = el.selectionStart ?? 0;
    const localEnd = el.selectionEnd ?? 0;
    const atStart = localStart === 0 && localEnd === 0;
    const atEnd = localStart === el.value.length && localEnd === el.value.length;

  
    if (e.key === "Backspace" && atStart && pageIndex > 0) {
      e.preventDefault();
      const joined = slices.join("\n");
      const globalHere = pagePosToGlobal(pageIndex, 0, slices);
      if (globalHere === 0) return;

      const newText = joined.slice(0, globalHere - 1) + joined.slice(globalHere);
      plannedGlobalCaretRef.current = globalHere - 1; 
      setText(newText);
      return;
    }

    
    if (e.key === "Enter" && atEnd) {

      const globalHere = pagePosToGlobal(pageIndex, localStart, slices);
      e.preventDefault(); 

      const joined = slices.join("\n");
      const newText = joined.slice(0, globalHere) + "\n" + joined.slice(globalHere);
      plannedGlobalCaretRef.current = globalHere + 1; 
      setText(newText);
      return;
    }
  }


  function handleFocus(pageIndex) {
    setFocusedPageIndex(pageIndex);
  }

  // save doc
  async function saveDoc() {
    await fetch("http://localhost:3001/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title, content: [text] }),
    });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 1500);
  }

  async function confirmDelete() {
    const res = await fetch(`http://localhost:3001/documents/${id}`, { method: "DELETE" });
    if (res.ok) {
      setShowDeleteModal(false);
      navigate("/");
    }
  }

  function handleTitleChange(e) {
    setTitle(e.target.innerText);
  }


  function handleAIInsert(aiText, isStreaming = false) {
    const el = pageRefs.current[focusedPageIndex];
    if (!el) {
      setText(prev => prev + aiText);
      return;
    }
  
    const caretPos = el.selectionStart ?? el.value.length;
    const slices = paginate(text);
    const currentValue = el.value;
  
    // sanitize 
    const before = currentValue.slice(0, caretPos);
    const after = currentValue.slice(caretPos);
    const safeInsert = aiText.replace(/[\u0000-\u001F\u200B-\u200D\uFEFF]/g, "");
    const newPageContent = before + safeInsert + after;
  
    slices[focusedPageIndex] = newPageContent;
    setText(slices.join("\n"));
  
    if (!isStreaming) {
      plannedGlobalCaretRef.current = pagePosToGlobal(
        focusedPageIndex,
        caretPos + safeInsert.length,
        slices
      );
      setTimeout(() => {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    }
  }
  

  
  
  
  
  

  return (
    <div className="editor-layout">
      {}
      <div className="editor-sidebar">
        <h2 className="sidebar-logo">Materi</h2>
        <button className="sidebar-btn" onClick={saveDoc}>Save</button>
        <button className="sidebar-btn" onClick={() => navigate(-1)}>Exit</button>
        <button className="delete-btn" onClick={() => setShowDeleteModal(true)}>Delete</button>

        {}
        <div className="chat-box" style={{ height: "300px", marginTop: "20px" }}>
          <ChatAssistant onInsert={handleAIInsert} />
        </div>
      </div>

      {}
      <div className="editor-canvas">
        <div className="doc-container">
          {pages.map((pageContent, pageIndex) => {
            const isFirst = pageIndex === 0;
            const availableHeight = isFirst ? CONTENT_HEIGHT - TITLE_HEIGHT : CONTENT_HEIGHT;
            return (
              <div key={pageIndex} className="page-illusion">
                {}
                <div className="page-header">
                  {isFirst && (
                    <div
                      className="doc-title"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={handleTitleChange}
                    >
                      {title}
                    </div>
                  )}
                  <div className="page-number-top">
                    Page {pageIndex + 1} of {pages.length}
                  </div>
                </div>

                {}
                <div className="page-content" style={{ height: `${availableHeight}px` }}>
                  <textarea
                    ref={(el) => (pageRefs.current[pageIndex] = el)}
                    className="page-textarea"
                    value={pageContent}
                    onChange={(e) => handlePageChange(pageIndex, e)}
                    onKeyDown={(e) => handleKeyDown(pageIndex, e)}
                    onFocus={() => handleFocus(pageIndex)}
                    placeholder={isFirst ? "Start writing your document..." : ""}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {}
      {showSaved && (
        <div className="save-toast">
          <div className="checkmark">✓</div>
          <span>File Saved</span>
        </div>
      )}

      {}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Document</h3>
            <p>Are you sure you want to delete this document?</p>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
