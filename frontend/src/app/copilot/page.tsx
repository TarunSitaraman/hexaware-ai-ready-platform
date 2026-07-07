"use client";

import { useState } from "react";
import styles from "./copilot.module.css";
import { Bot, Send } from "lucide-react";

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hello! I am the Databricks Retail Copilot. I'm connected to the Gold Medallion tables. How can I help you analyze our retail data today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formatMessageContent = (content: string) => {
    if (!content.includes("```")) return <p>{content}</p>;
    
    const parts = content.split("```");
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const code = part.replace(/^sql\n/, "");
        return <pre key={index} className={styles.codeBlock}>{code}</pre>;
      }
      return <p key={index} style={{ whiteSpace: "pre-wrap" }}>{part}</p>;
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: "bot", content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "bot", content: "Error connecting to Databricks Model Serving." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Retail Copilot</h1>
        <p className="page-subtitle">Powered by Graph Neural Networks (GNN) & Enterprise Knowledge Graphs</p>
      </header>

      <div className={`glass-panel`} style={{ padding: 0 }}>
        <div className={styles.chatContainer}>
          <div className={styles.messagesArea}>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.botMessage}`}>
                {msg.role === 'bot' && <Bot size={16} style={{ marginBottom: 8, color: "var(--accent-primary)" }} />}
                {formatMessageContent(msg.content)}
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.message} ${styles.botMessage}`}>
                <div className={styles.typingIndicator}>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.inputArea}>
            <form onSubmit={handleSend} className={styles.inputForm}>
              <input 
                type="text" 
                className={styles.inputField} 
                placeholder="Ask a question about the retail data (e.g. Total revenue for Electronics)..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button type="submit" className={styles.sendButton} disabled={isLoading || !input.trim()}>
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
