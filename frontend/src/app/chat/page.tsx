"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send, Bot, User, FileText, Code2,
  ChevronDown, Clock, Braces, Plus, Trash2, ChevronRight, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { ChatMessage } from "@/hooks/use-chat";

function CitationCard({ citation, defaultExpanded }: { citation: any; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);
  return (
    <div className="rounded-lg border bg-card p-3 text-sm space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <FileText className="h-3 w-3" />Source
        </span>
        <Badge variant="secondary" className={cn("text-[10px]", citation.score > 0.8 ? "text-emerald-600" : "text-amber-600")}>
          {(citation.score * 100).toFixed(0)}% match
        </Badge>
      </div>
      <p className={cn("text-xs leading-relaxed", !expanded && "line-clamp-2")}>{citation.text}</p>
      {citation.metadata && (
        <div className="flex flex-wrap gap-1">
          {Object.entries(citation.metadata).slice(0, 4).map(([k, v]) => (
            <Badge key={k} variant="outline" className="text-[9px] px-1 py-0">{k}: {v as string}</Badge>
          ))}
        </div>
      )}
      {citation.text.length > 150 && (
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary hover:underline">
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
}

export default function ChatPage() {
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("advisor_chat_threads");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse chat threads", e);
        }
      }
    }
    return [
      {
        id: "default",
        title: "Initial Assessment",
        messages: [],
        created_at: new Date().toISOString(),
      },
    ];
  });
  
  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    if (threads.length > 0) return threads[0].id;
    return "default";
  });

  const [input, setInput] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSourcesMsgId, setExpandedSourcesMsgId] = useState<string | null>(null);

  // Sync threads to localStorage
  useEffect(() => {
    localStorage.setItem("advisor_chat_threads", JSON.stringify(threads));
  }, [threads]);

  const activeThread = useMemo(() => {
    return threads.find(t => t.id === activeThreadId) || threads[0];
  }, [threads, activeThreadId]);

  const messages = activeThread?.messages || [];

  const activeMsg = useMemo(() => {
    return messages.find((m) => m.id === selectedMsgId);
  }, [messages, selectedMsgId]);

  const handleStartNewChat = () => {
    const newId = crypto.randomUUID();
    const newThread: ChatThread = {
      id: newId,
      title: `New Analysis - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      messages: [],
      created_at: new Date().toISOString(),
    };
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newId);
    setSelectedMsgId(null);
  };

  const handleDeleteThread = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (threads.length <= 1) {
      // Re-initialize if all deleted
      const defaultThread = {
        id: "default",
        title: "Initial Assessment",
        messages: [],
        created_at: new Date().toISOString(),
      };
      setThreads([defaultThread]);
      setActiveThreadId("default");
      setSelectedMsgId(null);
      return;
    }

    const filtered = threads.filter(t => t.id !== id);
    setThreads(filtered);
    if (activeThreadId === id) {
      setActiveThreadId(filtered[0].id);
      setSelectedMsgId(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userQuery = input.trim();
    setInput("");

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userQuery,
    };

    // Update active thread with user message
    setThreads(prev => prev.map(t => {
      if (t.id === activeThreadId) {
        // Automatically rename thread based on first message
        const updatedTitle = t.messages.length === 0 
          ? (userQuery.length > 25 ? userQuery.slice(0, 25) + "..." : userQuery)
          : t.title;
        return {
          ...t,
          title: updatedTitle,
          messages: [...t.messages, userMsg]
        };
      }
      return t;
    }));

    setIsLoading(true);

    try {
      const res = await apiClient.post("/api/v1/chat", {
        question: userQuery,
        top_k: 5,
        include_context: true,
        include_prompt: true,
      });

      const data = res.data;
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content || data.answer,
        citations: data.citations,
        context: data.context,
        prompt: data.prompt,
        token_usage: data.token_usage,
        latency_ms: data.latency_ms,
      };

      setThreads(prev => prev.map(t => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            messages: [...t.messages, assistantMsg]
          };
        }
        return t;
      }));

      // Automatically select the last assistant message to show its prompt/context
      setSelectedMsgId(assistantMsg.id);
    } catch (err) {
      console.error("Chat error", err);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your question.",
      };
      setThreads(prev => prev.map(t => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            messages: [...t.messages, errorMsg]
          };
        }
        return t;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6.5rem)] gap-6 overflow-hidden">
      
      {/* Persisted Chats Sidebar */}
      <div className="w-64 shrink-0 flex flex-col border-r pr-4 space-y-4">
        <Button onClick={handleStartNewChat} className="w-full justify-start gap-2" variant="default">
          <Plus className="h-4 w-4" /> Start New Chat
        </Button>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Saved Threads</label>
          <ScrollArea className="flex-1">
            <div className="space-y-1">
              {threads.map(t => (
                <div
                  key={t.id}
                  onClick={() => {
                    setActiveThreadId(t.id);
                    setSelectedMsgId(null);
                  }}
                  className={cn(
                    "flex items-center justify-between group rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors",
                    activeThreadId === t.id 
                      ? "bg-accent text-accent-foreground font-medium" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="truncate max-w-[160px]">{t.title}</span>
                  <button
                    onClick={(e) => handleDeleteThread(t.id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive p-1 rounded transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" /> AI Macroeconomic Advisor
            </h1>
            <p className="text-xs text-muted-foreground">RAG-powered answers grounded securely in your Medallion (Gold) layer data</p>
          </div>
          <div className="flex gap-2">
            <Button variant={showContext ? "secondary" : "ghost"} size="sm" onClick={() => setShowContext(!showContext)}>
              <Braces className="mr-1.5 h-3.5 w-3.5" /> Context Panel
            </Button>
            <Button variant={showPrompt ? "secondary" : "ghost"} size="sm" onClick={() => setShowPrompt(!showPrompt)}>
              <Code2 className="mr-1.5 h-3.5 w-3.5" /> Prompt Inspector
            </Button>
          </div>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden premium-shadow">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1 text-base">Ground Truth Economic Advisor</h3>
                <p className="text-xs text-muted-foreground max-w-sm mb-6">
                  Select a sample indicator query below to consult the grounding ledger and vector search databases.
                </p>
                <div className="space-y-2 text-xs text-muted-foreground max-w-md w-full text-left bg-muted/30 p-3 rounded-lg border border-dashed">
                  <button onClick={() => setInput("What was us gdp growth in 2024")} className="flex items-center justify-between w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors">
                    <span>"What was US GDP growth in 2024?"</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                  <button onClick={() => setInput("Compare inflation rates in 2024")} className="flex items-center justify-between w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors">
                    <span>"Compare inflation rates in 2024"</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                  <button onClick={() => setInput("Identify the highest unemployment country")} className="flex items-center justify-between w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors">
                    <span>"Identify the highest unemployment country"</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-6">
                {messages.map((msg) => {
                  const isAssistant = msg.role === "assistant";
                  const isSelected = selectedMsgId === msg.id;
                  const isSourcesOpen = expandedSourcesMsgId === msg.id;
                  
                  return (
                    <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[85%] space-y-2", msg.role === "user" && "order-1")}>
                        <div className="flex items-center gap-2 mb-0.5">
                          {isAssistant && (
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                              <Bot className="h-3 w-3 text-primary" />
                            </div>
                          )}
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                            {msg.role === "user" ? "You" : "Macro Advisor"}
                          </span>
                          {msg.latency_ms && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {msg.latency_ms}ms
                            </span>
                          )}
                          {msg.token_usage && (
                            <span className="text-[10px] text-muted-foreground">
                              ({msg.token_usage.total_tokens || msg.token_usage.prompt_tokens} tokens)
                            </span>
                          )}
                        </div>
                        
                        {/* Message Content Bubble */}
                        <div 
                          onClick={() => isAssistant && setSelectedMsgId(msg.id)}
                          className={cn(
                            "rounded-xl px-4 py-2.5 text-sm leading-relaxed transition-all",
                            isAssistant 
                              ? "bg-muted rounded-bl-none cursor-pointer border border-transparent hover:border-primary/20" 
                              : "bg-primary text-primary-foreground rounded-br-none",
                            isSelected && isAssistant && "ring-2 ring-primary border-transparent shadow-md"
                          )}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        
                        {/* Collapsible Sources / Citations */}
                        {isAssistant && msg.citations && msg.citations.length > 0 && (
                          <div className="pt-1">
                            <button
                              onClick={() => setExpandedSourcesMsgId(isSourcesOpen ? null : msg.id)}
                              className="flex items-center gap-1 text-[11px] text-primary font-medium hover:underline focus:outline-none"
                            >
                              <FileText className="h-3.5 w-3.5" /> 
                              {isSourcesOpen ? "Hide Sources" : `Sources (${msg.citations.length})`}
                              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isSourcesOpen && "rotate-180")} />
                            </button>
                            
                            {isSourcesOpen && (
                              <div className="grid gap-2 mt-2 pl-2 border-l-2 border-muted">
                                {msg.citations.map((c, i) => <CitationCard key={i} citation={c} />)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm pl-8 animate-pulse">
                    <Bot className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-xs">Consulting RAG vectors and synthesizing answer...</span>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Fixed Bottom Input Box */}
          <div className="border-t p-3 bg-card shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={messages.length > 0 ? "Ask a follow-up question..." : "Ask a question about your macroeconomic data..."}
                className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon" className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {messages.length > 0 && (
              <p className="text-[9px] text-muted-foreground mt-2 text-center">
                Press Enter to send. Tip: Click on any advisor message to inspect its prompt and source context in the sidebars.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Context and Prompt Sidebars */}
      {(showContext || showPrompt) && (
        <div className="w-80 shrink-0 flex flex-col space-y-4 h-full overflow-hidden">
          {showContext && (
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader className="pb-2 border-b bg-muted/20 shrink-0">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Braces className="h-4 w-4 text-primary" /> Retrieved Context
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-3">
                {activeMsg?.context && activeMsg.context.length > 0 ? (
                  <ScrollArea className="h-full pr-1">
                    <div className="space-y-2">
                      {activeMsg.context.map((ctx, i) => (
                        <div key={i} className="rounded-md border bg-muted/50 p-2.5 text-[11px] leading-relaxed font-sans">{ctx}</div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-full text-center text-xs text-muted-foreground p-4">
                    {selectedMsgId 
                      ? "This response was generated without extra context." 
                      : "Click on any response from the Macro Advisor to inspect its retrieved context."}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {showPrompt && (
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader className="pb-2 border-b bg-muted/20 shrink-0">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Code2 className="h-4 w-4 text-primary" /> Prompt to GPT-4o
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-3">
                {activeMsg?.prompt ? (
                  <ScrollArea className="h-full pr-1">
                    <pre className="text-[10px] whitespace-pre-wrap font-mono text-muted-foreground leading-relaxed p-1.5 bg-muted/30 rounded border">{activeMsg.prompt}</pre>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-full text-center text-xs text-muted-foreground p-4">
                    {selectedMsgId 
                      ? "This response does not contain public prompt logs." 
                      : "Click on any response from the Macro Advisor to inspect its grounded prompt."}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}