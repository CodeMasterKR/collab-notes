import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useAuthStore } from "../../store/auth.store";
import { useNote } from "./hooks/useNote";
import { useSocket } from "./hooks/useSocket";
import { useAutoSave } from "./hooks/useAutoSave";
import { NoteHeader } from "./components/NoteHeader";
import { NoteToolbar } from "./components/NoteToolbar";
import { NoteEditor } from "./components/NoteEditor";
import { CommentsPanel } from "./components/CommentsPanel";
import { OnlineUsersPanel } from "./components/OnlineUsersPanel";
import type { OnlineUser, SaveStatus, Role } from "./types";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { FontSize } from "./extensions/FontSize";
import TextAlign from "@tiptap/extension-text-align";
import { api } from "../../lib/axios";

export default function NotePage() {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuthStore();

  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [myRole, setMyRole] = useState<Role>("OWNER");

  const isRemote = useRef(false);

  function handleRoleChange(userId: string, newRole: Role) {
  setOnlineUsers(prev =>
    prev.map(u => u.userId === userId ? { ...u, role: newRole } : u)
  )
}

  useEffect(() => {
    if (!id) return
    api.get(`/notes/${id}/my-role`)
      .then(res => setMyRole(res.data.role))
      .catch(() => setMyRole("VIEWER"))
  }, [id])

  const editor = useEditor({
    immediatelyRender: false,
    editable: myRole !== "VIEWER",
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      Superscript,
      Subscript,
      FontSize,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: [
          "outline-none min-h-[calc(100vh-260px)] text-[#1A1A2E] leading-[1.9]",
          "text-[15.5px] font-serif selection:bg-blue-100",
          "[&_h1]:text-[2rem] [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-8 [&_h1]:text-[#0F0F23] [&_h1]:tracking-tight",
          "[&_h2]:text-[1.5rem] [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-[#1A1A2E]",
          "[&_h3]:text-[1.2rem] [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-[#2D2D44]",
          "[&_ul]:list-disc [&_ul]:ml-7 [&_ul]:my-2",
          "[&_ol]:list-decimal [&_ol]:ml-7 [&_ol]:my-2",
          "[&_li]:my-1.5",
          "[&_blockquote]:border-l-[3px] [&_blockquote]:border-[#4F6EF7] [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-[#555] [&_blockquote]:my-4 [&_blockquote]:bg-[#F7F8FF] [&_blockquote]:py-2 [&_blockquote]:rounded-r-md",
          "[&_code]:bg-[#F3F4F8] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-[#D63384]",
          "[&_pre]:bg-[#1E1E2E] [&_pre]:text-[#CDD6F4] [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:my-4 [&_pre]:font-mono [&_pre]:text-[13px] [&_pre]:overflow-x-auto",
          "[&_hr]:border-[#E8EAED] [&_hr]:my-8",
          "[&_p]:my-1.5",
          "[&_strong]:text-[#111]",
        ].join(" "),
      },
    },
    onUpdate: ({ editor }) => {
      if (isRemote.current) return;
      scheduleAutoSave(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return
    editor.setEditable(myRole !== "VIEWER")
  }, [editor, myRole])

  const { note, title, setTitle, updateTitle } = useNote(id, editor);
  const { socketRef, socket } = useSocket({
    id, token, user, editor, isRemote, setOnlineUsers, setTypingUsers,
  });
  const { scheduleAutoSave } = useAutoSave(id, socketRef, setSaveStatus);

  if (!note) return (
    <div className="min-h-screen bg-[#F1F3F4] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 border-[3px] border-[#4F6EF7]/20 rounded-full" />
          <div className="w-12 h-12 border-[3px] border-[#4F6EF7] border-t-transparent
            rounded-full animate-spin absolute inset-0" />
        </div>
        <p className="text-[#666] text-sm font-medium tracking-wide">Yuklanmoqda...</p>
      </div>
    </div>
  );

  return (
    <div
      className="h-screen bg-[#F1F3F4] flex flex-col overflow-hidden"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      <NoteHeader
        noteId={id!}
        title={title}
        saveStatus={saveStatus}
        onlineUsers={onlineUsers}
        typingUsers={typingUsers}
        onTitleChange={setTitle}
        onTitleBlur={updateTitle}
        onCommentsToggle={() => {}}
        onOnlineUsersToggle={() => {}}
      />

      {editor && myRole !== "VIEWER" && (
        <NoteToolbar editor={editor} />
      )}

      {myRole === "VIEWER" && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2
          flex items-center gap-2 text-[13px] text-amber-700 shrink-0">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943
              9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          Siz faqat ko'rish huquqiga egasiz
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">

        <div className="w-[260px] shrink-0 h-full p-3 border-r border-gray-200 bg-[#F1F3F4]">
          <OnlineUsersPanel
  users={onlineUsers}
  currentUserId={user?.id ?? ""}
  myRole={myRole}
  noteId={id!}
  onRoleChange={handleRoleChange}  
/>
        </div>

        <div className="flex-1 overflow-y-auto">
          {editor && <NoteEditor editor={editor} />}
        </div>

        <div className="w-[300px] shrink-0 h-full p-3 border-l border-gray-200 bg-[#F1F3F4]">
          <CommentsPanel
            noteId={id!}
            isOpen={true}
            onClose={() => {}}
            socket={socket}
          />
        </div>
      </div>
    </div>
  );
}