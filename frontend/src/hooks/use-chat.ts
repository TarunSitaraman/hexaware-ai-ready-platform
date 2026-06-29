import { useState, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { WS_URL } from "@/lib/constants";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  context?: string[];
  prompt?: string;
  token_usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  latency_ms?: number;
}

export interface Citation {
  chunk_id: string;
  text: string;
  score: number;
  metadata: Record<string, string>;
}

export function useChat(datasetId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const sendMessage = useCallback(async (question: string) => {
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await apiClient.post("/api/v1/chat", {
        question,
        dataset_id: datasetId,
        top_k: 5,
        include_context: true,
        include_prompt: true,
      });
      const data = res.data;
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer,
        citations: data.citations,
        context: data.context,
        prompt: data.prompt,
        token_usage: data.token_usage,
        latency_ms: data.latency_ms,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your question.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [datasetId]);

  return { messages, isLoading, sendMessage };
}