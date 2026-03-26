import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../../../lib/axios";
import { useAuthStore } from "../../../store/auth.store";
import { Socket } from "socket.io-client";

interface CommentUser {
  id: string;
  name: string;
  avatar: string | null;
}

interface Comment {
  id: string;
  text: string;
  resolved: boolean;
  userId: string;
  noteId: string;
  parentId: string | null;
  createdAt: string;
  user: CommentUser;
  replies: Comment[];
}

interface CommentsPanelProps {
  noteId: string;
  isOpen: boolean;
  onClose: () => void;
  socket: Socket | null;
}

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}k`;
}

const AVATAR_COLORS = [
  "#3B82F6", "#8B5CF6", "#EC4899", "#10B981",
  "#F59E0B", "#EF4444", "#06B6D4", "#84CC16",
];

function getAvatarColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ user, size = 32 }: { user: CommentUser; size?: number }) {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        backgroundColor: getAvatarColor(user.id),
      }}
    >
      {user.name.charAt(0).toUpperCase()}
    </div>
  );
}

function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
}: {
  comment: Comment;
  currentUserId: string;
  onReply: (parentId: string, text: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function submitReply() {
    if (!replyText.trim()) return;
    setLoading(true);
    await onReply(comment.id, replyText.trim());
    setReplyText("");
    setShowReply(false);
    setLoading(false);
  }

  useEffect(() => {
    if (showReply) textareaRef.current?.focus();
  }, [showReply]);

  return (
    <div className="group">
      <div className="flex gap-2.5">
        <Avatar user={comment.user} size={26} />
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[12px] font-semibold text-gray-800 truncate">
                {comment.user.name}
              </span>
              <span className="text-[10px] text-gray-400 shrink-0">
                {timeAgo(comment.createdAt)}
              </span>
            </div>
            <p className="text-[12.5px] text-gray-700 leading-relaxed break-words">
              {comment.text}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 mt-1 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowReply(o => !o)}
              className="text-[11px] text-gray-400 hover:text-blue-500 px-1.5 py-0.5 rounded hover:bg-blue-50 transition-all"
            >
              Javob
            </button>
            {comment.userId === currentUserId && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-[11px] text-gray-300 hover:text-red-400 px-1.5 py-0.5 rounded hover:bg-red-50 transition-all ml-auto"
              >
                O'chirish
              </button>
            )}
          </div>

          {/* Reply input */}
          {showReply && (
            <div className="mt-1.5 flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitReply();
                  if (e.key === "Escape") setShowReply(false);
                }}
                placeholder="Javob yozing..."
                className="flex-1 text-[12px] bg-gray-50 border border-gray-200 rounded-xl
                  px-2.5 py-1.5 resize-none focus:outline-none focus:border-blue-300 transition-all"
                rows={2}
              />
              <button
                onClick={submitReply}
                disabled={!replyText.trim() || loading}
                className="w-7 h-7 bg-blue-500 hover:bg-blue-600 disabled:opacity-30
                  text-white rounded-lg flex items-center justify-center shrink-0 transition-all mb-0.5"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          )}

          {/* Replies */}
          {comment.replies.length > 0 && (
            <div className="mt-2 space-y-1.5 border-l-2 border-gray-100 pl-3 ml-1">
              {comment.replies.map(reply => (
                <div key={reply.id} className="group/reply flex gap-2">
                  <Avatar user={reply.user} size={20} />
                  <div className="flex-1 min-w-0 bg-gray-50 rounded-xl rounded-tl-sm px-2.5 py-2 border border-gray-100">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[11px] font-semibold text-gray-700">
                        {reply.user.name}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {timeAgo(reply.createdAt)}
                      </span>
                      {reply.userId === currentUserId && (
                        <button
                          onClick={() => onDelete(reply.id)}
                          className="ml-auto text-[10px] text-gray-300 hover:text-red-400
                            opacity-0 group-hover/reply:opacity-100 transition-all"
                        >
                          O'chirish
                        </button>
                      )}
                    </div>
                    <p className="text-[11.5px] text-gray-600 break-words">{reply.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommentsPanel({ noteId, isOpen, onClose, socket }: CommentsPanelProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newText, setNewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/notes/${noteId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    if (isOpen) fetchComments();
  }, [isOpen, noteId, fetchComments]);

  useEffect(() => {
    if (!isOpen || !socket) return;

    const handleCreated = (newComment: Comment) => {
      setComments(prev => {
        if (newComment.parentId) {
          return prev.map(c =>
            c.id === newComment.parentId
              ? { ...c, replies: [...c.replies, newComment] }
              : c
          );
        }
        if (prev.find(c => c.id === newComment.id)) return prev;
        return [newComment, ...prev];
      });
    };

    const handleDeleted = ({ id }: { id: string }) => {
      setComments(prev =>
        prev
          .filter(c => c.id !== id)
          .map(c => ({ ...c, replies: c.replies.filter(r => r.id !== id) }))
      );
    };

    socket.on("comment:created", handleCreated);
    socket.on("comment:deleted", handleDeleted);

    return () => {
      socket.off("comment:created", handleCreated);
      socket.off("comment:deleted", handleDeleted);
    };
  }, [isOpen, noteId, socket]);

  async function handleCreate() {
    if (!newText.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/notes/${noteId}/comments`, { text: newText.trim() });
      setNewText("");
      setComments(prev => {
        if (prev.find(c => c.id === res.data.id)) return prev;
        return [res.data, ...prev];
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(parentId: string, text: string) {
    try {
      const res = await api.post(`/notes/${noteId}/comments`, { text, parentId });
      setComments(prev =>
        prev.map(c =>
          c.id === parentId
            ? { ...c, replies: [...c.replies.filter(r => r.id !== res.data.id), res.data] }
            : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(commentId: string) {
    try {
      await api.delete(`/notes/${noteId}/comments/${commentId}`);
    } catch (err) {
      console.error(err);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl
      border border-gray-200 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="text-[14px] font-bold text-gray-800">Izohlar</span>
        {comments.length > 0 && (
          <span className="text-[12px] font-semibold bg-gray-100 text-gray-500
            px-2 py-0.5 rounded-full ml-auto">
            {comments.length}
          </span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-[11px] text-gray-400">Yuklanmoqda...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-[13px] text-gray-400 font-medium">Hali izoh yo'q</p>
          </div>
        ) : (
          comments.map(c => (
            <CommentItem
              key={c.id}
              comment={c}
              currentUserId={user?.id || ""}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* New comment */}
      <div className="border-t border-gray-100 bg-white p-3 shrink-0">
        <div className="flex gap-2">
          <div className="shrink-0 mt-0.5">
            <Avatar user={user as any} size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <textarea
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleCreate();
              }}
              placeholder="Izoh qoldiring... "
              className="w-full text-[12px] bg-gray-50 border border-gray-200 rounded-xl
                px-2.5 py-2 resize-none focus:outline-none focus:border-blue-300
                focus:bg-white transition-all placeholder-gray-400 min-h-[56px]"
              rows={2}
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-gray-400">⌘↵ yuborish</span>
              <button
                onClick={handleCreate}
                disabled={!newText.trim() || submitting}
                className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600
                  disabled:opacity-40 disabled:cursor-not-allowed
                  text-white text-[11px] font-semibold px-2.5 py-1.5
                  rounded-lg transition-all"
              >
                {submitting ? (
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                )}
                Yuborish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}