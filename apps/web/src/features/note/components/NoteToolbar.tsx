import { Editor } from '@tiptap/react'
import { useState, useRef, useEffect, useCallback } from 'react'

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void
) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onClose])
}

function TBtn({
  onClick, active, title, children, disabled,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); if (!disabled) onClick() }}
      title={title}
      disabled={disabled}
      className={`
        w-8 h-8 flex items-center justify-center rounded-md
        transition-all duration-150 select-none shrink-0
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100 active:scale-95'}
        ${active ? 'bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-200' : 'text-slate-600 hover:text-slate-900'}
      `}
    >
      {children}
    </button>
  )
}

function TDivider() {
  return <div className="w-px h-5 bg-slate-200 mx-1 shrink-0 self-center" />
}

function DropdownPortal({
  open,
  triggerRef,
  children,
  width = 200,
}: {
  open: boolean
  triggerRef: React.RefObject<HTMLElement | null>
  children: React.ReactNode
  width?: number
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      })
    }
  }, [open, triggerRef])

  if (!open) return null

  return (
    <div
      style={{ position: 'fixed', top: pos.top - window.scrollY, left: pos.left, width, zIndex: 9999 }}
      className="bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden"
    >
      {children}
    </div>
  )
}

const FONT_FAMILIES = [
  { value: 'default', label: 'Standart' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Times New Roman", serif', label: 'Times New Roman' },
  { value: '"Courier New", monospace', label: 'Courier New' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
]

const FONT_SIZES = ['10','11','12','13','14','16','18','20','24','28','32','36','48','64']

const BLOCK_TYPES = [
  { value: '0', label: 'Normal', desc: 'Oddiy matn' },
  { value: '1', label: 'Heading 1', desc: 'Katta sarlavha' },
  { value: '2', label: 'Heading 2', desc: "O'rta sarlavha" },
  { value: '3', label: 'Heading 3', desc: 'Kichik sarlavha' },
  { value: '4', label: 'Heading 4', desc: 'Eng kichik' },
]

const TEXT_COLORS = [
  '#111827','#374151','#6B7280','#EF4444','#F97316',
  '#EAB308','#22C55E','#3B82F6','#8B5CF6','#EC4899',
]

const BG_COLORS = [
  '#FEF08A','#BBF7D0','#BAE6FD','#FCA5A5','#DDD6FE',
  '#FED7AA','#FBCFE8','#E0F2FE','#F3F4F6','#FFFFFF',
]

const QUICK_HIGHLIGHTS = [
  { color: '#FEF08A', label: 'Sariq' },
  { color: '#BBF7D0', label: 'Yashil' },
  { color: '#FBCFE8', label: 'Pushti' },
]

// ─── Block Type ───────────────────────────────────────────────────────────────
function BlockTypeMenu({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  useClickOutside(ref, () => setOpen(false))

  const active = BLOCK_TYPES.find(b =>
    b.value !== '0' && editor.isActive('heading', { level: Number(b.value) })
  ) ?? BLOCK_TYPES[0]

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        ref={btnRef}
        type="button"
        title="Blok turi"
        onMouseDown={(e) => { e.preventDefault(); setOpen(o => !o) }}
        className="h-8 px-2.5 flex items-center gap-1.5 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all w-[120px]"
      >
        <span className="flex-1 text-left truncate text-slate-500">{active.label}</span>
        <svg className={`w-3 h-3 text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <DropdownPortal open={open} triggerRef={btnRef} width={220}>
        <div className="py-1">
          {BLOCK_TYPES.map((b) => (
            <button
              key={b.value}
              onMouseDown={(e) => {
                e.preventDefault()
                if (b.value === '0') editor.chain().focus().setParagraph().run()
                else editor.chain().focus().toggleHeading({ level: Number(b.value) as 1|2|3|4 }).run()
                setOpen(false)
              }}
              className={`w-full px-3 py-2 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors text-left ${active.value === b.value ? 'bg-indigo-50' : ''}`}
            >
              <div>
                <span className={`block font-medium text-slate-800 ${b.value === '1' ? 'text-xl' : b.value === '2' ? 'text-lg' : b.value === '3' ? 'text-base' : 'text-sm'}`}>
                  {b.label}
                </span>
                <span className="text-xs text-slate-400">{b.desc}</span>
              </div>
              {active.value === b.value && (
                <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </DropdownPortal>
    </div>
  )
}

// ─── Font Family ──────────────────────────────────────────────────────────────
function FontFamilySelect({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  useClickOutside(ref, () => setOpen(false))

  const current = FONT_FAMILIES.find(f =>
    f.value !== 'default' && editor.isActive('textStyle', { fontFamily: f.value })
  ) ?? FONT_FAMILIES[0]

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        ref={btnRef}
        title="Shrift"
        onMouseDown={(e) => { e.preventDefault(); setOpen(o => !o) }}
        className="h-8 px-2.5 flex items-center gap-1.5 rounded-md text-sm font-medium text-slate-500 hover:bg-slate-100 border border-slate-200 transition-all w-[105px]"
        style={{ fontFamily: current.value === 'default' ? 'inherit' : current.value }}
      >
        <span className="flex-1 text-left truncate">{current.label}</span>
        <svg className={`w-3 h-3 text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <DropdownPortal open={open} triggerRef={btnRef} width={190}>
        <div className="py-1">
          {FONT_FAMILIES.map((f) => (
            <button
              key={f.value}
              onMouseDown={(e) => {
                e.preventDefault()
                if (f.value === 'default') editor.chain().focus().unsetFontFamily().run()
                else editor.chain().focus().setFontFamily(f.value).run()
                setOpen(false)
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${current.value === f.value ? 'text-indigo-600 font-semibold bg-indigo-50' : 'text-slate-700'}`}
              style={{ fontFamily: f.value === 'default' ? 'inherit' : f.value }}
            >
              {f.label}
              {current.value === f.value && (
                <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </DropdownPortal>
    </div>
  )
}

// ─── Font Size ────────────────────────────────────────────────────────────────
function FontSizeInput({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const [val, setVal] = useState('14')
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  useClickOutside(ref, () => setOpen(false))

  const currentSize = editor.getAttributes('textStyle').fontSize?.replace('px', '') ?? '14'
  useEffect(() => setVal(currentSize), [currentSize])

  const apply = useCallback((v: string) => {
    const n = parseInt(v)
    if (!isNaN(n) && n > 0 && n <= 400) editor.chain().focus().setFontSize(`${n}px`).run()
    setOpen(false)
  }, [editor])

  return (
    <div ref={ref} className="relative shrink-0">
      <div className="flex items-center border border-slate-200 rounded-md bg-white overflow-hidden hover:border-slate-300 transition-colors">
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => apply(val)}
          onKeyDown={(e) => e.key === 'Enter' && apply(val)}
          className="w-9 h-8 text-center text-sm font-medium text-slate-600 focus:outline-none bg-transparent"
        />
        <button
          ref={btnRef}
          title="O'lcham"
          onMouseDown={(e) => { e.preventDefault(); setOpen(o => !o) }}
          className="h-8 px-1.5 border-l border-slate-200 hover:bg-slate-100 transition-colors"
        >
          <svg className={`w-3 h-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <DropdownPortal open={open} triggerRef={btnRef} width={64}>
        <div className="py-1 max-h-52 overflow-y-auto">
          {FONT_SIZES.map((s) => (
            <button
              key={s}
              onMouseDown={(e) => { e.preventDefault(); apply(s) }}
              className={`w-full px-2 py-1.5 text-center text-sm hover:bg-slate-50 transition-colors ${currentSize === s ? 'text-indigo-600 font-semibold bg-indigo-50' : 'text-slate-700'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </DropdownPortal>
    </div>
  )
}

// ─── Color Btn ──────────────────────────────────────────────────
function ColorBtn({ editor, mode }: { editor: Editor; mode: 'color' | 'highlight' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const isHL = mode === 'highlight'
  useClickOutside(ref, () => setOpen(false))

  const currentColor = isHL
    ? editor.getAttributes('highlight').color ?? null
    : editor.getAttributes('textStyle').color ?? null

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        ref={btnRef}
        title={isHL ? 'Fon rangi' : 'Matn rangi'}
        onMouseDown={(e) => { e.preventDefault(); setOpen(o => !o) }}
        className="w-8 h-8 flex flex-col items-center justify-center rounded-md hover:bg-slate-100 transition-all cursor-pointer gap-[3px] text-slate-600 hover:text-slate-900"
      >
        {isHL ? (
          <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.5 7L14 3.5a1.42 1.42 0 00-2 0L5.5 10 4 15l5-1.5 6.5-6.5a1.42 1.42 0 000-2zM4 20h16v2H4v-2z" />
          </svg>
        ) : (
          <span className="text-[14px] font-bold leading-none" style={{ color: currentColor ?? '#111827' }}>A</span>
        )}
        <div
          className="w-4 h-[3px] rounded-full"
          style={{ backgroundColor: currentColor ?? (isHL ? '#FEF08A' : '#111827') }}
        />
      </button>

      <DropdownPortal open={open} triggerRef={btnRef} width={192}>
        <div className="p-3">
          <p className="text-[10px] font-semibold text-slate-400 mb-2.5 uppercase tracking-wider">
            {isHL ? 'Fon rangi' : 'Matn rangi'}
          </p>
          <div className="grid grid-cols-5 gap-1.5 mb-3">
            {(isHL ? BG_COLORS : TEXT_COLORS).map((color) => (
              <button
                key={color}
                onMouseDown={(e) => {
                  e.preventDefault()
                  if (isHL) {
                    editor.isActive('highlight', { color })
                      ? editor.chain().focus().unsetHighlight().run()
                      : editor.chain().focus().setHighlight({ color }).run()
                  } else {
                    editor.chain().focus().setColor(color).run()
                  }
                  setOpen(false)
                }}
                className={`w-6 h-6 rounded border-2 hover:scale-110 active:scale-95 transition-transform shadow-sm ${
                  isHL
                    ? editor.isActive('highlight', { color }) ? 'border-slate-700' : 'border-slate-200'
                    : currentColor === color ? 'border-slate-700' : 'border-slate-200'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
            <input
              type="color"
              value={currentColor ?? (isHL ? '#ffffff' : '#000000')}
              onChange={(e) => {
                if (isHL) editor.chain().focus().setHighlight({ color: e.target.value }).run()
                else editor.chain().focus().setColor(e.target.value).run()
              }}
              className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0 bg-transparent"
            />
            <span className="text-[11px] text-slate-500 flex-1">Boshqa rang</span>
            <button
              onMouseDown={(e) => {
                e.preventDefault()
                if (isHL) editor.chain().focus().unsetHighlight().run()
                else editor.chain().focus().unsetColor().run()
                setOpen(false)
              }}
              className="text-[11px] text-red-500 hover:text-red-600 font-medium"
            >
              Tozalash
            </button>
          </div>
        </div>
      </DropdownPortal>
    </div>
  )
}

// ─── Main Toolbar ──────────────────────────────────────────
export function NoteToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-14 z-30">
      <div className="px-3 py-1.5 flex items-center gap-0.5 overflow-x-auto scrollbar-hide">

        <BlockTypeMenu editor={editor} />
        <TDivider />

        <FontFamilySelect editor={editor} />
        <div className="w-1 shrink-0" />
        <FontSizeInput editor={editor} />
        <TDivider />

        <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Qalin (Ctrl+B)">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.5 15.5H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5zM10 6.5h3c.83 0 1.5.67 1.5 1.5S13.83 9.5 13 9.5h-3v-3zM15.6 11.79c.97-.68 1.65-1.77 1.65-2.79C17.25 6.74 15.51 5 13.25 5H7v14h6.54c2.07 0 3.71-1.68 3.71-3.75 0-1.5-.86-2.77-2.15-3.46z"/>
          </svg>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Kursiv (Ctrl+I)">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
          </svg>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Tagiga chiziq (Ctrl+U)">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
          </svg>
        </TBtn>
        <TDivider />

        {QUICK_HIGHLIGHTS.map(({ color, label }) => (
          <button
            key={color}
            title={label}
            onMouseDown={(e) => {
              e.preventDefault()
              editor.isActive('highlight', { color })
                ? editor.chain().focus().unsetHighlight().run()
                : editor.chain().focus().setHighlight({ color }).run()
            }}
            className={`w-[22px] h-[22px] rounded border-2 transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-sm shrink-0 ${
              editor.isActive('highlight', { color }) ? 'border-slate-700 scale-110' : 'border-slate-200 hover:border-slate-400'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
        <div className="w-1 shrink-0" />
        <ColorBtn editor={editor} mode="color" />
        <ColorBtn editor={editor} mode="highlight" />
        <TDivider />

        <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Nuqtali ro'yxat">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
          </svg>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Raqamli ro'yxat">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h11M9 12h11M9 19h11M4 5v.01M4 12v.01M4 19v.01"/>
          </svg>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="Vazifalar ro'yxati">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </TBtn>
        <TDivider />

        <TBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Chapga">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12h12M3 18h15"/>
          </svg>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Markazga">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M6 12h12M4 18h16"/>
          </svg>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="O'ngga">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M9 12h12M6 18h15"/>
          </svg>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Tekislash">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12h18M3 18h18"/>
          </svg>
        </TBtn>
        <TDivider />

        <TBtn onClick={() => editor.chain().focus().sinkListItem('listItem').run()} disabled={!editor.can().sinkListItem('listItem')} title="Ichkariga (Tab)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7M3 5v14"/>
          </svg>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().liftListItem('listItem').run()} disabled={!editor.can().liftListItem('listItem')} title="Tashqariga (Shift+Tab)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5l-7 7 7 7M21 5v14"/>
          </svg>
        </TBtn>
        <TDivider />

        <TBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript">
          <span className="text-[13px] font-bold leading-none">X²</span>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript">
          <span className="text-[13px] font-bold leading-none">X₂</span>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Kod bloki">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
          </svg>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Iqtibos">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Ajratuvchi chiziq">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16M4 8h2M4 16h2M18 8h2M18 16h2"/>
          </svg>
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Formatlashni tozalash">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 20H7L3 16l10-10 7 7-2.5 2.5M6.5 17.5l5-5"/>
          </svg>
        </TBtn>

        <div className="flex-1 min-w-[8px]" />
        <div className="flex items-center gap-px bg-slate-100 border border-slate-200 rounded-lg p-0.5 shrink-0">
          <button
            type="button"
            title="Bekor qilish (Ctrl+Z)"
            disabled={!editor.can().undo()}
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().undo().run() }}
            className={`w-8 h-7 flex items-center justify-center rounded-md transition-all duration-150 text-slate-600 ${!editor.can().undo() ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white hover:shadow-sm hover:text-slate-900 active:scale-95 cursor-pointer'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
            </svg>
          </button>
          <button
            type="button"
            title="Qayta qilish (Ctrl+Y)"
            disabled={!editor.can().redo()}
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().redo().run() }}
            className={`w-8 h-7 flex items-center justify-center rounded-md transition-all duration-150 text-slate-600 ${!editor.can().redo() ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white hover:shadow-sm hover:text-slate-900 active:scale-95 cursor-pointer'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  )
}