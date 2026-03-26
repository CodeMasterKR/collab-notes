export const COMMENT_EVENTS = {
  CREATED: 'comment.created',
  UPDATED: 'comment.updated',
  RESOLVED: 'comment.resolved',
  DELETED: 'comment.deleted',
} as const;

// ✅ Bular export qilinmagan edi — shu yerga qo'shing
export interface CommentCreatedPayload {
  noteId: string;
  comment: unknown;
}

export interface CommentUpdatedPayload {
  noteId: string;
  comment: unknown;
}

export interface CommentResolvedPayload {
  noteId: string;
  id: string;
  resolved: boolean;
}

export interface CommentDeletedPayload {
  noteId: string;
  id: string;
}