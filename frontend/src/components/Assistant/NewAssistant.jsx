
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  ChevronDown,
  MessageCircle,
  Send,
  User,
  LoaderCircle,
} from "lucide-react";
import API from "../../services/api";
import "./NewAssistant.css";

export default function NewsAssistant({
  article = "",
  prediction = "",
  score = null,
}) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI News Assistant. Ask me about a prediction, a suspicious claim, or how to verify a news story.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = async (event) => {
    event.preventDefault();

    const question = input.trim();

    if (!question || loading) return;

    const previousMessages = messages;
    const userMessage = {
      role: "user",
      content: question,
    };

    setMessages([...previousMessages, userMessage]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await API.post("assistant/chat/", {
        message: question,
        article,
        prediction,
        score,
        history: previousMessages
          .filter((item) =>
            ["user", "assistant"].includes(item.role)
          )
          .slice(-8),
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.data.reply,
        },
      ]);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        (err.response?.status === 401
          ? "Please log in again to use the assistant."
          : "Unable to contact the AI assistant. Please try again.");

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assistant-widget">
      {isOpen ? (
        <section
          className="news-assistant"
          aria-label="AI News Assistant chat"
        >
          <header className="assistant-header">
            <div className="assistant-icon">
              <Bot size={24} />
            </div>

            <div className="assistant-heading">
              <h2>AI News Assistant</h2>
              <p>Understand predictions. Verify claims.</p>
            </div>

            <button
              className="assistant-toggle"
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Minimize AI News Assistant"
              title="Minimize chat"
            >
              <ChevronDown size={20} />
            </button>
          </header>

          {article && (
            <div className="assistant-context">
              <strong>Article context attached</strong>
              <span>
                {prediction
                  ? `Current prediction: ${prediction}`
                  : "No prediction supplied"}
              </span>
            </div>
          )}

          <div className="assistant-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div
                className={`assistant-message ${
                  message.role === "user" ? "user-message" : "bot-message"
                }`}
                key={`${index}-${message.role}`}
              >
                <div className="message-icon">
                  {message.role === "user" ? (
                    <User size={18} />
                  ) : (
                    <Bot size={18} />
                  )}
                </div>

                <div className="message-content">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            ))}

            {loading && (
              <div className="assistant-loading">
                <LoaderCircle size={18} className="assistant-spinner" />
                <span>Analyzing your question...</span>
              </div>
            )}
          </div>

          {error && (
            <p className="assistant-error" role="alert">
              {error}
            </p>
          )}

          <form className="assistant-input-form" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about a news claim..."
              maxLength={4000}
              disabled={loading}
              aria-label="Message the AI News Assistant"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              {loading ? (
                <LoaderCircle size={19} className="assistant-spinner" />
              ) : (
                <Send size={19} />
              )}
            </button>
          </form>

          <p className="assistant-disclaimer">
            AI-generated explanations can be wrong. Verify important claims
            with credible sources.
          </p>
        </section>
      ) : (
        <button
          className="assistant-launcher"
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI News Assistant"
          aria-expanded={false}
        >
          <MessageCircle size={23} />
          <span>Ask AI</span>
        </button>
      )}
    </div>
  );
}
