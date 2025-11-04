import { useState, useEffect, useRef } from "react";
import "./ChatAssistant.css";

export default function ChatAssistant({ onInsert }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! I'm Materi AI. Ask me to help write, edit, or summarize your document.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, streamText]);

  async function sendPrompt() {
    if (!input.trim()) return;

    const updatedMessages = [...messages, { role: "user", content: input }];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setStreamText("");

    try {
      const res = await fetch("http://localhost:3001/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      let reply = data.reply || "⚠️ Something went wrong.";

      // Clean invisible chars
      reply = reply.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();

      // Typing animation
      let text = "";
      for (let i = 0; i < reply.length; i++) {
        text += reply[i];
        setStreamText(text);
        if (i % 3 === 0) await new Promise((r) => setTimeout(r, 5));
      }

      const newMessages = [...updatedMessages, { role: "assistant", content: reply }];
      setMessages(newMessages);
      setIsLoading(false);
      setStreamText("");

      // ✅ Only insert when complete
      if (onInsert) onInsert(reply, false);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error contacting Materi AI." },
      ]);
      setIsLoading(false);
      setStreamText("");
    }
  }

  return (
    <div className="materi-chat">
      <div className="chat-header">Materi AI</div>

      <div className="chat-body">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`}>
            {m.content}
          </div>
        ))}

        {streamText && (
          <div className="chat-bubble assistant typing">
            {streamText}
            <span className="cursor">▍</span>
          </div>
        )}

        {isLoading && !streamText && (
          <div className="chat-bubble assistant loading">
            <div className="dot-loader">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input-box">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Materi AI..."
          onKeyDown={(e) =>
            e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendPrompt())
          }
        />
        <button onClick={sendPrompt}>Send</button>
      </div>
    </div>
  );
}
