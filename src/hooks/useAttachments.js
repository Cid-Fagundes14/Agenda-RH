import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listAttachments, uploadAttachment } from "@/api/attachments";
import { useAuth } from "@/lib/AuthContext";

export function useAttachments(kind, parentId, enabled = true) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["attachments", user?.id, kind, parentId],
    queryFn: () => listAttachments(kind, parentId),
    enabled: Boolean(enabled && user && parentId),
  });
}

export function useAttachmentDrafts(kind) {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState([]);

  async function upload(parentId) {
    if (!drafts.length) return [];
    const failures = [];
    for (const draft of drafts) {
      try {
        await uploadAttachment(kind, parentId, draft);
        setDrafts((current) => current.filter(({ id }) => id !== draft.id));
      } catch {
        failures.push(draft.file.name);
      }
    }
    await queryClient.invalidateQueries({ queryKey: ["attachments"] });
    return failures;
  }

  return { drafts, setDrafts, upload };
}
