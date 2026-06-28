"use client";

import { useOthers } from "@liveblocks/react";
import { UserButton, useUser } from "@clerk/nextjs";

const MAX_AVATARS = 5;

export function PresenceAvatars() {
  const { user } = useUser();
  const others = useOthers();

  if (!user || !others) return null;

  // Filter the Liveblocks presence list to exclude any entry whose user ID matches the current Clerk user ID
  // (e.g. if the user has multiple tabs open)
  const collaborators = others.filter((other) => other.info?.id !== user.id);

  const visibleCollaborators = collaborators.slice(0, MAX_AVATARS);
  const overflowCount = collaborators.length - MAX_AVATARS;

  return (
    <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-bg-surface/80 backdrop-blur-sm p-1.5 rounded-full border border-border-default shadow-sm animate-fade-in">
      {collaborators.length > 0 && (
        <div className="flex items-center">
          {visibleCollaborators.map((collaborator, index) => {
            const info = collaborator.info;
            if (!info) return null;

            return (
              <div
                key={collaborator.connectionId}
                className="relative -ml-2 first:ml-0 flex items-center justify-center h-8 w-8 rounded-full border-2 border-bg-surface bg-bg-subtle overflow-hidden ring-1 ring-border-default/50"
                style={{ zIndex: visibleCollaborators.length - index }}
                title={info.name}
              >
                {info.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={info.avatar}
                    alt={info.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-text-primary">
                    {info.name?.charAt(0) || "?"}
                  </span>
                )}
              </div>
            );
          })}

          {overflowCount > 0 && (
            <div
              className="relative -ml-2 flex items-center justify-center h-8 w-8 rounded-full border-2 border-bg-surface bg-bg-muted overflow-hidden ring-1 ring-border-default/50"
              style={{ zIndex: 0 }}
            >
              <span className="text-xs font-medium text-text-secondary">
                +{overflowCount}
              </span>
            </div>
          )}
        </div>
      )}

      {collaborators.length > 0 && (
        <div className="h-5 w-[1px] bg-border-default mx-1" />
      )}

      <div className="h-8 w-8 flex items-center justify-center rounded-full shrink-0">
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            }
          }}
        />
      </div>
    </div>
  );
}
