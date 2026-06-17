type Position = 'top' | 'bottom' | 'left' | 'right';

const TOOLTIP: Record<Position, string> = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

interface Props {
  text: string;
  position?: Position;
  width?: string;
}

export default function HelpTip({ text, position = 'top', width = 'w-56' }: Props) {
  return (
    <span className="relative group inline-flex items-center flex-shrink-0">
      <span className="w-[15px] h-[15px] rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold flex items-center justify-center cursor-help select-none hover:bg-slate-300 transition-colors leading-none">
        ?
      </span>
      <span
        className={`absolute ${TOOLTIP[position]} ${width} bg-slate-800 text-white text-xs rounded-xl p-2.5 shadow-2xl z-[100] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 leading-relaxed whitespace-normal`}
      >
        {text}
      </span>
    </span>
  );
}
