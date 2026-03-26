export function NotesSkeleton({ dark }: { dark: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`rounded-2xl border p-6 animate-pulse ${dark ? 'bg-[#1C1C1E] border-[#2C2C2E]' : 'bg-white border-[#EBEBEB]'}`}>
          <div className={`h-4 rounded mb-3 w-2/3 ${dark ? 'bg-[#2C2C2E]' : 'bg-[#F0F0F0]'}`}/>
          <div className={`h-3 rounded mb-1.5 ${dark ? 'bg-[#222]' : 'bg-[#F5F5F5]'}`}/>
          <div className={`h-3 rounded mb-1.5 w-5/6 ${dark ? 'bg-[#222]' : 'bg-[#F5F5F5]'}`}/>
          <div className={`h-3 rounded w-3/4 ${dark ? 'bg-[#222]' : 'bg-[#F5F5F5]'}`}/>
        </div>
      ))}
    </div>
  )
}