export function NotesEmpty({ dark, search }: { dark: boolean; search: string }) {
  const sub = dark ? 'text-[#666]' : 'text-[#999]'

  return (
    <div className="flex flex-col items-center justify-center py-28 text-center">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-3xl ${dark ? 'bg-[#1C1C1E]' : 'bg-[#F0F0F0]'}`}>
        {search ? '🔍' : '📝'}
      </div>
      <h3 className="text-[15px] font-semibold mb-1">
        {search ? 'Hech narsa topilmadi' : "Notlar yo'q"}
      </h3>
      <p className={`text-[13px] ${sub}`}>
        {search ? "Boshqa so'z bilan qidiring" : 'Yuqoridagi maydonga nom kiriting'}
      </p>
    </div>
  )
}