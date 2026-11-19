import Link from "next/link";

export function VersionSwitch({ current }: { current: "v1" | "v2" }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-outline bg-surface-2/60 p-1 text-[11px] font-semibold uppercase tracking-widest">
      <Link
        href="/v1"
        className={`rounded-full px-3 py-1 transition-colors ${
          current === "v1"
            ? "bg-brand text-brand-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        V1
      </Link>
      <Link
        href="/v2"
        className={`rounded-full px-3 py-1 transition-colors ${
          current === "v2"
            ? "bg-brand text-brand-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        V2
      </Link>
    </div>
  );
}
