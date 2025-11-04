import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [docs, setDocs] = useState([]);

  // fetch all docs from backend/data
  useEffect(() => {
    fetch("http://localhost:3001/documents")
      .then((res) => res.json())
      .then((data) => setDocs(data))
      .catch(() => setDocs([]));
  }, []);

  // create doc
  async function handleCreate() {
    if (!newTitle.trim()) return;

    const newDoc = {
      id: Date.now().toString(),
      title: newTitle,
      content: "", // start empty
    };

    try {
      const res = await fetch("http://localhost:3001/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoc),
      });

      if (!res.ok) throw new Error("Failed to create document");

      setShowModal(false);
      navigate(`/editor/${newDoc.id}?title=${encodeURIComponent(newTitle)}`);
    } catch (err) {
      console.error(err);
      alert("Error creating document. Check backend console.");
    }
  }

  return (
    <div className="home">
      {/* ===== NAVBAR ===== */}
      <nav className="navbar">
        <div className="nav-wrap">
          {/* Left */}
          <div className="nav-left">
            <span className="nav-title">Materi</span>
          </div>

          {/* Center */}
          <div className="nav-center">
            <a href="/">Home</a>
          </div>

          {/* Right */}
          <div className="nav-right">
            <a
              href="https://github.com/yoitsmeivn/MateriInterview"
              target="_blank"
              rel="noopener noreferrer"
              className="github-link-btn"
            >
              Link to GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <header className="hero">
        <h1 className="logo">Materi</h1>
        <p className="tagline">Your workspace, refined.</p>
      </header>

      {/* ===== DOCUMENTS SECTION ===== */}
      <section className="documents">
        <div className="documents-header">
          <h2>Your Documents</h2>
          <button className="new-doc-btn" onClick={() => setShowModal(true)}>
            New Document
          </button>
        </div>

        {/* Background with dots */}
        <div className="documents-bg">
          <div className="documents-content">
            <div className="file-grid">
              {docs.length === 0 ? (
                <p style={{ color: "#6b7280" }}>No documents yet.</p>
              ) : (
                docs.map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/editor/${doc.id}`}
                    className="file-card"
                  >
                    <h3>{doc.title}</h3>
                    <p>Click to open</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Document</h3>
            <input
              type="text"
              placeholder="Enter document title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="create-btn" onClick={handleCreate}>
                Create
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
