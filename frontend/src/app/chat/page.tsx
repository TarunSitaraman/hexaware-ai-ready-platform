"use client";

import { useState, useMemo } from "react";
import { useChat } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send, Bot, User, FileText, Eye, EyeOff, Code2,
  ChevronDown, ChevronUp, Clock, Braces,
} from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

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

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<string | null>(null);
  const { messages, isLoading, sendMessage } = useChat();

  const activeMsg = useMemo(() => messages.find((m) => m.id === selectedMsg), [messages, selectedMsg]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex h-full gap-6">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Macroeconomic Advisor</h1>
            <p className="text-sm text-muted-foreground">RAG-powered answers grounded in your macroeconomic data</p>
          </div>
          <div className="flex gap-1">
            <Button variant={showContext ? "secondary" : "ghost"} size="sm" onClick={() => setShowContext(!showContext)}>
              <Eye className="mr-1 h-4 w-4" />Context
            </Button>
            <Button variant={showPrompt ? "secondary" : "ghost"} size="sm" onClick={() => setShowPrompt(!showPrompt)}>
              <Code2 className="mr-1 h-4 w-4" />Prompt
            </Button>
          </div>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Bot className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">Ask about your macroeconomic data</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  Upload a dataset and run the pipeline first, then ask questions about economic trends.
                </p>
                <div className="space-y-1.5 text-xs text-muted-foreground text-left">
                  <button onClick={() => { setInput("What was the US GDP growth trend in 2024?"); }} className="block w-full text-left px-3 py-1.5 rounded hover:bg-muted transition-colors">"What was the US GDP growth trend in 2024?"</button>
                  <button onClick={() => { setInput("Compare inflation rates between US and EU"); }} className="block w-full text-left px-3 py-1.5 rounded hover:bg-muted transition-colors">"Compare inflation rates between US and EU"</button>
                  <button onClick={() => { setInput("Which sectors showed the strongest growth?"); }} className="block w-full text-left px-3 py-1.5 rounded hover:bg-muted transition-colors">"Which sectors showed the strongest growth?"</button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[75%] space-y-2", msg.role === "user" && "order-1")}>
                      <div className="flex items-center gap-2 mb-0.5">
                        {msg.role === "assistant" && (
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-3 w-3 text-primary" />
                          </div>
                        )}
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">
                          {msg.role === "user" ? "You" : "Macro Advisor"}
                        </span>
                        {msg.latency_ms && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />{msg.latency_ms}ms
                          </span>
                        )}
                        {msg.token_usage && (
                          <span className="text-[10px] text-muted-foreground">
                            {msg.token_usage.total_tokens} tokens
                          </span>
                        )}
                      </div>
                      <div className={cn(
                        "rounded-xl px-4 py-2.5",
                        msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md"
                      )}>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                      </div>
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                            <FileText className="h-3 w-3" />Sources ({msg.citations.length})
                          </p>
                          <div className="grid gap-2">
                            {msg.citations.map((c, i) => <CitationCard key={i} citation={c} />)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm pl-8">
                    <div className="flex gap-1">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                    </div>
                    <span className="text-xs">Retrieving context...</span>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-3">
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
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Press Enter to send. Answers are grounded in your uploaded macroeconomic data via RAG.
              </p>
            )}
          </div>
        </Card>
      </div>

      {(showContext || showPrompt) && (
        <div className="w-80 shrink-0 space-y-4">
          {showContext && activeMsg?.context && activeMsg.context.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><Braces className="h-3.5 w-3.5" /> Retrieved Context</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="max-h-96">
                  <div className="space-y-2">
                    {activeMsg.context.map((ctx, i) => (
                      <div key={i} className="rounded-md border bg-muted/50 p-2 text-[11px] leading-relaxed">{ctx}</div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
          {showPrompt && activeMsg?.prompt && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><Code2 className="h-3.5 w-3.5" /> Prompt to GPT-4o</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="max-h-96">
                  <pre className="text-[10px] whitespace-pre-wrap font-mono text-muted-foreground leading-relaxed">{activeMsg.prompt}</pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
          {!activeMsg?.context && showContext && (
            <Card><CardContent className="py-8 text-center text-xs text-muted-foreground">Click a message to view its context</CardContent></Card>
          )}
          {!activeMsg?.prompt && showPrompt && (
            <Card><CardContent className="py-8 text-center text-xs text-muted-foreground">Click a message to view its prompt</CardContent></Card>
          )}
        </div>
      )}
    </div>
  );
}