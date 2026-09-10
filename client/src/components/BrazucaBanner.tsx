import { Flag, Search } from 'lucide-react';

interface BrazucaBannerProps {
  onClick?: () => void;
}

export default function BrazucaBanner({ onClick }: BrazucaBannerProps) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onClick?.();
      }}
      className="group mt-5 flex min-h-[160px] w-full cursor-pointer items-center justify-center gap-6 rounded-2xl border border-emerald-300/20 bg-gradient-to-r from-[#03210f] via-black to-[#1a1503] p-10 shadow-2xl transition-all duration-500 hover:border-yellow-300/40 hover:bg-[#04180c]"
    >
      <div className="flex items-center gap-6 transition-transform duration-500 group-hover:scale-105">
        <Flag className="h-12 w-12 text-yellow-300" />
        <div>
          <h2 className="text-4xl font-black uppercase tracking-[0.2em] text-white md:text-5xl">BRAZUCA</h2>
          <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-200/80">OSINT Brasil / busca de informações</p>
        </div>
        <Search className="h-10 w-10 text-emerald-300" />
      </div>
    </div>
  );
}
