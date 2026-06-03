type Props = {
  page: number;
  total: number;
  perPage: number;
  onChange: (p: number) => void;
};

export default function Pagination({ page, total, perPage, onChange }: Props) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  // Build page list with ellipsis
  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (i === page - 2 || i === page + 2) {
      pages.push("…");
    }
  }

  const btn = "flex items-center justify-center h-9 rounded-xl text-sm font-semibold transition-colors border";
  const inactive = "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-600";
  const active = "bg-blue-500 border-blue-500 text-white shadow shadow-blue-500/20";
  const disabled = "bg-zinc-800 border-zinc-700 text-zinc-600 cursor-not-allowed";

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={`px-3 ${btn} ${page === 1 ? disabled : inactive}`}
      >
        ← Prev
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-zinc-600 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`w-9 ${btn} ${p === page ? active : inactive}`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className={`px-3 ${btn} ${page === totalPages ? disabled : inactive}`}
      >
        Next →
      </button>
    </div>
  );
}
