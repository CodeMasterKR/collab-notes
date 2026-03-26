import { EditorContent, Editor } from '@tiptap/react'

export function NoteEditor({ editor }: { editor: Editor }) {
  return (
    <main className="flex-1 flex justify-center px-4 py-8 pb-16">
      <div className="w-full" style={{ maxWidth: 860 }}>
        <div
          className="bg-white rounded-lg cursor-text"
          style={{
            minHeight: 1056,
            padding: '96px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
          }}
          onClick={() => editor.commands.focus()}
        >
          <EditorContent editor={editor}/>
        </div>
      </div>
    </main>
  )
}