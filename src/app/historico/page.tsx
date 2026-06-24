"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HistoryEntry, loadHistory, deleteFromHistory, sortedHistory } from "@/lib/history";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function getMonthKey(entry: HistoryEntry): string {
  const date = entry.data.header.date;
  if (!date || !date.includes("-")) return "sem-data";
  return date.slice(0, 7); // YYYY-MM
}

function getMonthLabel(key: string): string {
  if (key === "sem-data") return "Sem data definida";
  const [year, month] = key.split("-");
  const idx = parseInt(month, 10) - 1;
  if (idx < 0 || idx > 11) return key;
  return `${MONTH_NAMES[idx]} ${year}`;
}

function groupByMonth(entries: HistoryEntry[]) {
  const map = new Map<string, HistoryEntry[]>();
  for (const entry of entries) {
    const key = getMonthKey(entry);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(entry);
  }
  return Array.from(map.entries())
    .map(([key, items]) => ({ key, label: getMonthLabel(key), entries: items }))
    .sort((a, b) => {
      if (a.key === "sem-data") return 1;
      if (b.key === "sem-data") return -1;
      return b.key.localeCompare(a.key);
    });
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export default function HistoricoPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    const history = sortedHistory(loadHistory());
    setEntries(history);
    setOpenFolders(new Set(history.map(getMonthKey)));
  }, []);

  function toggleFolder(key: string) {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleEdit(entry: HistoryEntry) {
    localStorage.setItem("proposalDraft", JSON.stringify(entry.data));
    localStorage.setItem("editingProposalId", entry.id);
    router.push("/");
  }

  function handleDelete(id: string) {
    if (!confirm("Tem certeza que quer excluir esta proposta do histórico?")) return;
    deleteFromHistory(id);
    const history = sortedHistory(loadHistory());
    setEntries(history);
    const validKeys = new Set(history.map(getMonthKey));
    setOpenFolders((prev) => new Set([...prev].filter((k) => validKeys.has(k))));
  }

  const groups = groupByMonth(entries);

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-base font-semibold tracking-tight text-black">Histórico de Propostas</h1>
            <p className="text-xs text-black/40">Organizado pelo mês do cabeçalho</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-sm border border-black/20 text-black hover:bg-black/5 transition-colors px-4 py-2"
          >
            ← Nova Proposta
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-black/30 text-sm">Nenhuma proposta salva ainda.</p>
            <p className="text-black/20 text-xs mt-1">Gere uma proposta para ela aparecer aqui.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => {
              const isOpen = openFolders.has(group.key);
              return (
                <div key={group.key} className="border border-black/10">
                  <button
                    onClick={() => toggleFolder(group.key)}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-black/[0.02] transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-1 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: isOpen ? "#375e40" : "rgba(0,0,0,0.15)" }}
                      />
                      <span className="text-sm font-semibold text-black">{group.label}</span>
                      <span className="text-xs text-black/30">
                        {group.entries.length} {group.entries.length === 1 ? "proposta" : "propostas"}
                      </span>
                    </div>
                    <span className="text-[10px] text-black/30 tracking-widest">
                      {isOpen ? "▲" : "▼"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-black/8 divide-y divide-black/5">
                      {group.entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between px-5 py-3.5 gap-4"
                          style={{ backgroundColor: "rgba(0,0,0,0.012)" }}
                        >
                          <div className="min-w-0 pl-4">
                            <div className="flex items-center gap-2">
                              {entry.proposalNumber && (
                                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-black/40 border border-black/15 px-1.5 py-0.5">
                                  #{entry.proposalNumber}
                                </span>
                              )}
                              <p className="text-sm font-medium text-black truncate">{entry.name}</p>
                            </div>
                            <p className="text-xs text-black/35 mt-0.5">
                              Salvo em {formatDate(entry.savedAt.slice(0, 10))}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="px-4 py-1.5 text-xs border border-[#375e40] text-[#375e40] hover:bg-[#375e40]/5 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="px-4 py-1.5 text-xs border border-black/15 text-black/35 hover:border-red-300 hover:text-red-500 transition-colors"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
