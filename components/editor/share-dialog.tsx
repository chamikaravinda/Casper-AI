"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Copy, Check, Trash2, Mail } from "lucide-react";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
}

interface Collaborator {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

interface Owner {
  userId: string;
  email: string;
  name: string;
  avatarUrl: string;
}

export function ShareDialog({ isOpen, onClose, projectId }: ShareDialogProps) {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isOwned, setIsOwned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollaborators = async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      if (!res.ok) {
        throw new Error("Failed to load collaborators");
      }
      const data = await res.json();
      setOwner(data.owner);
      setCollaborators(data.collaborators);
      setIsOwned(data.isOwned);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching collaborators");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && projectId) {
      fetchCollaborators();
    } else {
      setOwner(null);
      setCollaborators([]);
      setIsOwned(false);
      setInviteEmail("");
      setError(null);
    }
  }, [isOpen, projectId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !inviteEmail.trim() || inviteLoading) return;

    setInviteLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to invite collaborator");
      }

      setInviteEmail("");
      await fetchCollaborators();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemove = async (email: string) => {
    if (!projectId || removingEmail) return;

    setRemovingEmail(email);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to remove collaborator");
      }

      await fetchCollaborators();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRemovingEmail(null);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      const parts = name.split(" ");
      return parts.map((p) => p[0]).join("").toUpperCase().slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md bg-bg-elevated border border-border-default rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-text-primary">
            {isOwned ? "Share Project" : "Collaborators"}
          </DialogTitle>
          <DialogDescription className="text-sm text-text-muted">
            {isOwned
              ? "Manage who can view and edit this workspace design."
              : "People who have access to this collaborative workspace."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Invite Section (Owner Only) */}
          {isOwned && (
            <form onSubmit={handleInvite} className="flex gap-2">
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={inviteLoading}
                required
                className="flex-1 bg-bg-subtle border-border-subtle focus:border-accent-primary"
              />
              <Button
                type="submit"
                disabled={inviteLoading || !inviteEmail.trim()}
                className="bg-accent-primary text-bg-base hover:bg-accent-primary/90 font-medium whitespace-nowrap"
              >
                {inviteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Invite"
                )}
              </Button>
            </form>
          )}

          {error && (
            <p className="text-xs font-medium text-state-error">{error}</p>
          )}

          {/* Collaborator List */}
          <div className="space-y-2 mt-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Current Access
            </span>

            {isLoading && collaborators.length === 0 ? (
              <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
              </div>
            ) : (
              <ScrollArea className="max-h-[220px] pr-1">
                <div className="space-y-3">
                  {/* Owner Row */}
                  {owner && (
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-3 min-w-0">
                        {owner.avatarUrl ? (
                          <img
                            src={owner.avatarUrl}
                            alt={owner.name}
                            className="h-8 w-8 rounded-full object-cover ring-1 ring-border-default bg-bg-subtle"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-bg-subtle border border-border-default text-text-primary text-xs flex items-center justify-center font-semibold">
                            {getInitials(owner.name, owner.email)}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-text-primary truncate">
                            {owner.name}
                          </span>
                          <span className="text-xs text-text-muted truncate">
                            {owner.email}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-medium text-accent-primary bg-accent-primary-dim px-2 py-0.5 rounded border border-accent-primary/10">
                        Owner
                      </span>
                    </div>
                  )}

                  {/* Collaborators Row */}
                  {collaborators.map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-1 group">
                      <div className="flex items-center gap-3 min-w-0">
                        {c.avatarUrl ? (
                          <img
                            src={c.avatarUrl}
                            alt={c.name || c.email}
                            className="h-8 w-8 rounded-full object-cover ring-1 ring-border-default bg-bg-subtle"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-bg-subtle border border-border-default text-text-primary text-xs flex items-center justify-center font-semibold">
                            {getInitials(c.name, c.email)}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-text-primary truncate">
                            {c.name || c.email}
                          </span>
                          {c.name && (
                            <span className="text-xs text-text-muted truncate">
                              {c.email}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-text-faint">
                          Collaborator
                        </span>
                        {isOwned && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleRemove(c.email)}
                            disabled={removingEmail !== null}
                            className="text-text-muted hover:text-state-error hover:bg-state-error/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                            aria-label={`Remove collaborator ${c.email}`}
                          >
                            {removingEmail === c.email ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {collaborators.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Mail className="h-6 w-6 text-text-faint mb-2" />
                      <p className="text-xs text-text-muted">No collaborators yet.</p>
                      {isOwned && (
                        <p className="text-[10px] text-text-faint">Invite teammates to work together in real-time.</p>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Copy Link Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-border-default py-4 -mx-6 -mb-6 px-6 bg-bg-surface/50 rounded-b-3xl">
          <span className="text-xs text-text-muted">
            Anyone with access can collaborate.
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="h-8 border-border-default bg-bg-surface hover:bg-bg-subtle text-text-secondary hover:text-text-primary gap-1.5 text-xs rounded-lg transition-all"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-state-success" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
