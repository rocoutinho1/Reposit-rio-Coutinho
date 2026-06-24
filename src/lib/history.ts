import { ProposalFormData } from "@/types/proposal";

export interface HistoryEntry {
  id: string;
  name: string;
  proposalNumber?: string;
  client: string;
  project: string;
  productionStart: string;
  savedAt: string;
  data: ProposalFormData;
}

const HISTORY_KEY = "proposalHistory";

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(data: ProposalFormData): HistoryEntry {
  const history = loadHistory();
  const client = data.header.client.trim();
  const project = data.header.project.trim();
  const name = [client, project].filter(Boolean).join(" — ") || "Sem título";

  const existingIndex = history.findIndex(
    (e) => e.client === client && e.project === project
  );

  const entry: HistoryEntry = {
    id: existingIndex >= 0 ? history[existingIndex].id : `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    proposalNumber: data.header.proposalNumber?.trim() || undefined,
    client,
    project,
    productionStart: data.header.periodStart || data.header.date || "",
    savedAt: new Date().toISOString(),
    data,
  };

  if (existingIndex >= 0) {
    history[existingIndex] = entry;
  } else {
    history.unshift(entry);
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return entry;
}

export function deleteFromHistory(id: string): void {
  const history = loadHistory().filter((e) => e.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function getHistoryEntry(id: string): HistoryEntry | null {
  return loadHistory().find((e) => e.id === id) ?? null;
}

export function sortedHistory(history: HistoryEntry[]): HistoryEntry[] {
  return [...history].sort((a, b) => {
    const na = a.proposalNumber;
    const nb = b.proposalNumber;

    if (!na && !nb) return 0;
    if (!na) return 1;
    if (!nb) return -1;

    const numA = parseFloat(na);
    const numB = parseFloat(nb);
    if (!isNaN(numA) && !isNaN(numB)) return numB - numA;

    return nb.localeCompare(na);
  });
}
