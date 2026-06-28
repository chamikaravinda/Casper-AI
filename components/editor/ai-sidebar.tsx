"use client";

import { useState } from "react";
import { Bot, FileCode, Send, X, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [messages, setMessages] = useState([
    {
      role: "user",
      content: "Can you help me design an e-commerce backend?",
    },
    {
      role: "assistant",
      content:
        "Of course! We can start with a microservices architecture using Next.js for the frontend, an API Gateway, and independent services for Users, Products, and Orders. How does that sound?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-3 right-3 top-[3.75rem] z-50 flex w-80 flex-col rounded-2xl border border-border-subtle bg-bg-surface/95 backdrop-blur-xl transition-transform duration-200 shadow-xl",
        isOpen ? "translate-x-0" : "translate-x-[calc(100%+1rem)]"
      )}
    >
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border-default px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-ai/10">
            <Bot className="h-4 w-4 text-accent-ai" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-text-primary">AI Workspace</span>
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
              Collaborate with Ghost AI
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-text-muted hover:text-text-primary h-8 w-8 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Body with Tabs */}
      <Tabs defaultValue="architect" className="flex flex-1 flex-col overflow-hidden">
        <div className="px-4 pt-4 shrink-0">
          <TabsList className="w-full bg-bg-subtle h-9 p-1">
            <TabsTrigger
              value="architect"
              className="flex-1 data-[state=active]:bg-bg-surface data-[state=active]:text-accent-ai-text text-text-muted"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="flex-1 data-[state=active]:bg-bg-surface data-[state=active]:text-accent-ai-text text-text-muted"
            >
              Specs
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="architect"
          className="flex flex-1 flex-col overflow-hidden m-0 data-[state=inactive]:hidden"
        >
          {/* Scrollable chat area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center text-center py-6 mt-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-subtle mb-4 ring-1 ring-border-default">
                  <Bot className="h-6 w-6 text-text-secondary" />
                </div>
                <p className="text-sm font-medium text-text-primary mb-2">How can I help?</p>
                <p className="text-xs text-text-muted max-w-[200px] mb-6">
                  I can help you design architecture, write specs, or build diagrams.
                </p>

                <div className="flex flex-col gap-2 w-full">
                  {[
                    "Design an e-commerce backend",
                    "Create a chat app architecture",
                    "Build a CI/CD pipeline",
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setInput(chip)}
                      className="text-left px-3 py-2.5 rounded-lg bg-bg-subtle text-xs text-accent-ai-text hover:bg-bg-elevated transition-colors border border-border-default/50"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Message list */
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "max-w-[85%] px-3 py-2 text-sm text-left break-words",
                    msg.role === "user"
                      ? "self-end rounded-xl rounded-tr-sm bg-accent-primary-dim border-accent-primary/50 border-2 text-text-primary"
                      : "self-start rounded-xl rounded-tl-sm bg-bg-elevated border border-border-default text-accent-ai-text"
                  )}
                >
                  {msg.content}
                </div>
              ))
            )}
          </div>

          {/* Input area */}
          <div className="p-4 shrink-0 border-t border-border-default bg-bg-surface/50">
            <div className="relative flex flex-col rounded-xl border border-border-default bg-bg-base focus-within:border-accent-ai focus-within:ring-1 focus-within:ring-accent-ai transition-all">
              <Textarea
                placeholder="Ask Ghost AI..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[72px] max-h-[160px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 py-3 text-sm placeholder:text-text-muted shadow-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <div className="flex items-center justify-between px-2 pb-2">
                <span className="text-[10px] text-text-muted pl-1 flex items-center gap-1">
                  <CornerDownLeft className="h-3 w-3" /> to send
                </span>
                <Button
                  onClick={handleSend}
                  size="icon-sm"
                  className="h-7 w-7 rounded-lg bg-accent-ai text-white hover:bg-accent-ai/90"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="specs"
          className="flex flex-1 flex-col overflow-hidden m-0 p-4 data-[state=inactive]:hidden"
        >
          <Button className="w-full bg-accent-ai text-white hover:bg-accent-ai/90 mb-6 gap-2">
            <FileCode className="h-4 w-4" />
            Generate Spec
          </Button>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Current Spec
            </span>
            <div className="flex flex-col rounded-xl border border-border-default bg-bg-elevated p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                  <FileCode className="h-4 w-4 text-accent-ai" />
                  <span>Architecture.md</span>
                </div>
              </div>
              <p className="text-xs text-text-muted line-clamp-3 mb-3 leading-relaxed">
                # E-commerce Backend
                <br />
                The system consists of a Next.js frontend, an API Gateway, and microservices for
                Users, Products, and Orders. Redis is used for caching.
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="w-full text-xs h-8 border-border-subtle bg-bg-subtle text-text-muted disabled:opacity-50"
              >
                Download Spec
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
