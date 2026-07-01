"use client";

import { ProposalFormData } from "@/types/proposal";
import {
  TEAM_ITEMS,
  PHASE_LABELS,
  Phase,
  VIDEO_NAMES,
  VIDEO_FORMATS,
  VIDEO_DURATIONS,
  INCLUDED_ITEMS,
  REVISION_OPTIONS,
  PRE_PRODUCTION_PROCESSES,
  PRODUCTION_PROCESSES,
  POST_PRODUCTION_PROCESSES,
} from "@/data/items";
import { calcularInvestimento, calcularFase, formatCurrency } from "@/lib/calculations";

interface Props {
  data: ProposalFormData;
  darkMode?: boolean;
}

const GREEN = "#2fb34b";

const LIGHT_COLORS = {
  bg: "#ffffff",
  text: "#000000",
  textMuted: "rgba(0,0,0,0.4)",
  textFaint: "rgba(0,0,0,0.25)",
  border: "rgba(0,0,0,0.1)",
  borderFaint: "rgba(0,0,0,0.05)",
};

const DARK_COLORS = {
  bg: "#111111",
  text: "#f0f0f0",
  textMuted: "rgba(240,240,240,0.5)",
  textFaint: "rgba(240,240,240,0.28)",
  border: "rgba(255,255,255,0.12)",
  borderFaint: "rgba(255,255,255,0.06)",
};

type ColorScheme = typeof LIGHT_COLORS;

function SectionHeading({ number, title, c }: { number?: string | number; title: string; c: ColorScheme }) {
  return (
    <div className="mb-6" style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}>
      <div className="flex items-baseline gap-3 mb-4">
        {number && (
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: GREEN }}>
            {number}.
          </span>
        )}
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: c.text }}>{title}</h2>
      </div>
      <div className="h-px" style={{ backgroundColor: GREEN }} />
    </div>
  );
}

function SectionBlock({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
      {children}
    </div>
  );
}

function Row({ label, value, c }: { label: string; value: string; c: ColorScheme }) {
  if (!value) return null;
  return (
    <div className="flex gap-4 py-2.5 border-b last:border-0" style={{ borderColor: c.border }}>
      <span className="w-36 shrink-0 text-xs font-medium uppercase tracking-wide" style={{ color: c.textMuted }}>{label}</span>
      <span className="text-sm" style={{ color: c.text }}>{value}</span>
    </div>
  );
}

function TagList({ items, c }: { items: string[]; c: ColorScheme }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="border px-3 py-1.5 text-xs font-medium rounded-lg"
          style={{ borderColor: c.border, color: c.text }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function InvestmentLine({
  label, value, sub, total, c,
}: {
  label: string; value: number; sub?: boolean; total?: boolean; c: ColorScheme;
}) {
  if (value === 0 && !total) return null;
  return (
    <div
      className={`flex items-center justify-between ${total ? "py-4 mt-2 border-t-2" : "py-2.5 border-b"}`}
      style={total ? { borderColor: GREEN } : { borderColor: c.borderFaint }}
    >
      <span className={`text-sm ${total ? "font-bold" : ""}`} style={{ color: sub ? c.textMuted : c.text }}>
        {label}
      </span>
      <span
        className={`${total ? "text-xl font-bold" : "text-sm font-medium"}`}
        style={total ? { color: GREEN } : { color: sub ? c.textMuted : c.text }}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateRange(start: string, end: string): string {
  if (!start && !end) return "";
  if (!end) return formatDate(start);
  return `${formatDate(start)} até ${formatDate(end)}`;
}

function getTodayFormatted(): string {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${today.getFullYear()}`;
}

function calcularDiasValidade(start: string, end: string): string {
  if (!start || !end) return "—";
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "—";
  return `${diff} dias`;
}

function resolveVideoName(name: string, customName?: string): string {
  if (!name) return "—";
  if (name === "outro") return customName || "Outro";
  return VIDEO_NAMES.find((n) => n.id === name)?.label || name;
}

export function ProposalPreview({ data, darkMode = false }: Props) {
  const c = darkMode ? DARK_COLORS : LIGHT_COLORS;

  const {
    header, aboutProject, deliverables, processes, customProcesses,
    team, customTeam, equipment, includedItems, schedule, clientResponsibilities,
    logistics, generalConditions, feesRate, customInvestmentItems,
  } = data;

  const feesPct = feesRate ?? 25;
  const discountPct = data.discountRate ?? 0;
  const customTeamList = customTeam || [];
  const summary = calcularInvestimento(team || {}, logistics, equipment || [], feesPct, customTeamList);
  const phases: Phase[] = ["pre-production", "production", "post-production"];

  const labelFor = (arr: readonly { id: string; label: string }[], ids: string[]) =>
    arr.filter((i) => ids.includes(i.id)).map((i) => i.label);

  const formatLabel = (id: string) => VIDEO_FORMATS.find((f) => f.id === id)?.label || id;
  const durationLabel = (id: string, customDuration?: string) => {
    if (id === "custom" && customDuration) return customDuration;
    return VIDEO_DURATIONS.find((d) => d.id === id)?.label || id;
  };

  const validityDays = calcularDiasValidade(generalConditions.validityStart, generalConditions.validityEnd);
  const todayFormatted = getTodayFormatted();

  const hasEquipment = (equipment || []).length > 0;
  const hasIncluded = includedItems.included.length > 0 || includedItems.excluded.length > 0;
  const hasLogistics = logistics.displacement.enabled || logistics.meals.enabled || logistics.studio?.enabled;
  const hasConditions = !!(generalConditions.validityStart || generalConditions.paymentMethod || generalConditions.revisions);

  // Numeração dinâmica: só conta seções que realmente aparecem
  const sectionNums = (() => {
    const sections: [string, boolean][] = [
      ["about", !!aboutProject],
      ["deliverables", true],
      ["processes", true],
      ["team", true],
      ["equipment", hasEquipment],
      ["included", hasIncluded],
      ["schedule", !!schedule],
      ["responsibilities", !!clientResponsibilities],
      ["logistics", hasLogistics],
      ["conditions", hasConditions],
      ["investment", true],
    ];
    const nums: Record<string, number> = {};
    let n = 1;
    for (const [key, visible] of sections) {
      if (visible) nums[key] = n++;
    }
    return nums;
  })();

  return (
    <div style={{ backgroundColor: c.bg, color: c.text }} className="font-sans">

      {/* Capa */}
      <div className="mb-12" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>

        {/* Logo + Metadados */}
        <div className="flex items-start justify-between mb-12">
          <img src="/logo.svg" alt="QPS" style={{ height: "36px" }} />
          <div className="text-right space-y-2">
            {header.proposalNumber && (
              <div className="flex items-center justify-end gap-3">
                <span className="text-xs uppercase tracking-widest" style={{ color: c.textMuted }}>Nº do Orçamento</span>
                <span className="text-xs font-semibold" style={{ color: c.text }}>{header.proposalNumber}</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-3">
              <span className="text-xs uppercase tracking-widest" style={{ color: c.textMuted }}>Data</span>
              <span className="text-xs font-semibold" style={{ color: c.text }}>{header.date ? formatDate(header.date) : todayFormatted}</span>
            </div>
            <div className="flex items-center justify-end gap-3">
              <span className="text-xs uppercase tracking-widest" style={{ color: c.textMuted }}>Validade</span>
              <span className="text-xs font-semibold" style={{ color: c.text }}>{validityDays}</span>
            </div>
          </div>
        </div>

        {/* Título principal */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold leading-none tracking-tight mb-4" style={{ color: c.text }}>
            PROPOSTA DE<br />PRODUÇÃO
          </h1>
          <h3 className="text-sm font-light leading-relaxed max-w-md" style={{ color: c.textMuted }}>
            Transformamos visão em realidade através de quadros por segundo. Uma solução técnica e criativa sob medida para o seu projeto.
          </h3>
        </div>

        {/* Linha verde */}
        <div className="h-0.5" style={{ backgroundColor: GREEN }} />
      </div>

      {/* Dados do projeto */}
      <div className="mb-10" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
        <Row label="Cliente" value={header.client} c={c} />
        <Row label="Projeto" value={header.project} c={c} />
        <Row label="Data" value={formatDate(header.date)} c={c} />
        <Row label="Período" value={formatDateRange(header.periodStart, header.periodEnd)} c={c} />
        <Row label="Contato" value={header.contact} c={c} />
      </div>

      {/* Seções numeradas */}
      <div className="space-y-14">

        {/* 1. Sobre o projeto */}
        {!!aboutProject && (
          <SectionBlock>
            <SectionHeading number={sectionNums.about} title="Sobre o Projeto" c={c} />
            <p className="text-sm leading-relaxed" style={{ color: c.textMuted }}>{aboutProject}</p>
          </SectionBlock>
        )}

        {/* 2. Entregáveis */}
        <SectionBlock>
          <SectionHeading number={sectionNums.deliverables} title="Entregáveis" c={c} />
          <div className="space-y-5">
            {(() => {
              const groups = deliverables.video.groups || [];
              const totalVideos = groups.reduce((s, g) => s + (g.quantity || 0), 0);
              if (totalVideos === 0) return null;
              return (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>
                    Vídeos ({totalVideos} vídeo{totalVideos > 1 ? "s" : ""})
                  </p>
                  <div className="space-y-2">
                    {groups.map((g, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: c.borderFaint }}>
                        <span className="text-xs font-semibold w-8 shrink-0 text-right" style={{ color: c.textMuted }}>
                          {g.quantity}×
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {g.name && (
                            <span className="border px-2.5 py-1 text-xs font-medium rounded-md" style={{ borderColor: c.border, color: c.text }}>
                              {resolveVideoName(g.name, g.customName)}
                            </span>
                          )}
                          {g.format && (
                            <span className="border px-2.5 py-1 text-xs rounded-md" style={{ borderColor: c.border, color: c.text }}>
                              {formatLabel(g.format)}
                            </span>
                          )}
                          {g.duration && (
                            <span className="border px-2.5 py-1 text-xs rounded-md" style={{ borderColor: c.border, color: c.text }}>
                              {durationLabel(g.duration, g.customDuration)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            {(deliverables.rawFootageQuantity ?? 0) > 0 && (
              <p className="text-sm" style={{ color: c.text }}>
                Material bruto — {deliverables.rawFootageQuantity} vídeo{deliverables.rawFootageQuantity > 1 ? "s" : ""}
              </p>
            )}
          {(deliverables.photoQuantity ?? 0) > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>
                  Fotos
                </p>
                <div className="flex items-center gap-3 py-2 border-b" style={{ borderColor: c.borderFaint }}>
                  <span className="border px-2.5 py-1 text-xs font-medium rounded-md" style={{ borderColor: c.border, color: c.text }}>
                    {deliverables.photoQuantity} foto{deliverables.photoQuantity > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )}
          </div>
        </SectionBlock>

        {/* 3. Processos */}
        <SectionBlock>
          <SectionHeading number={sectionNums.processes} title="Processos" c={c} />
          <div className="space-y-5">
            {(processes.preProduction.length > 0 || customProcesses.some(p => p.phase === "pre-production")) && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>Pré-produção</p>
                <div className="space-y-2">
                  <TagList items={labelFor(PRE_PRODUCTION_PROCESSES, processes.preProduction)} c={c} />
                  {customProcesses.filter(p => p.phase === "pre-production").map(p => (
                    <span key={p.label} className="border px-2.5 py-1 text-xs font-medium rounded-md inline-block" style={{ borderColor: c.border, color: c.text }}>
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(processes.production.length > 0 || customProcesses.some(p => p.phase === "production")) && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>Produção</p>
                <div className="space-y-2">
                  <TagList items={labelFor(PRODUCTION_PROCESSES, processes.production)} c={c} />
                  {customProcesses.filter(p => p.phase === "production").map(p => (
                    <span key={p.label} className="border px-2.5 py-1 text-xs font-medium rounded-md inline-block" style={{ borderColor: c.border, color: c.text }}>
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(processes.postProduction.length > 0 || customProcesses.some(p => p.phase === "post-production")) && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>Pós-produção</p>
                <div className="space-y-2">
                  <TagList items={labelFor(POST_PRODUCTION_PROCESSES, processes.postProduction)} c={c} />
                  {customProcesses.filter(p => p.phase === "post-production").map(p => (
                    <span key={p.label} className="border px-2.5 py-1 text-xs font-medium rounded-md inline-block" style={{ borderColor: c.border, color: c.text }}>
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionBlock>

        {/* 4. Equipe */}
        <div>
          <SectionHeading number={sectionNums.team} title="Equipe" c={c} />
          <div className="space-y-8">
            {phases.map((phase) => {
              const items = TEAM_ITEMS.filter((i) => i.phase === phase && team?.[i.id]?.selected);
              const customItems = customTeamList.filter((m) => m.phase === phase);
              if (!items.length && !customItems.length) return null;
              const phaseTotal = calcularFase(team || {}, phase, customTeamList);
              return (
                <div key={phase} style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>{PHASE_LABELS[phase]}</p>
                  {phase === "post-production" ? (
                    <table className="w-full text-sm">
                      <colgroup>
                        <col style={{ width: "50%" }} />
                        <col style={{ width: "25%" }} />
                        <col style={{ width: "25%" }} />
                      </colgroup>
                      <thead>
                        <tr className="border-b" style={{ borderColor: c.border }}>
                          <th className="text-left pb-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Profissional</th>
                          <th className="text-right pb-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Horas</th>
                          <th className="text-right pb-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Valor Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => {
                          const member = team?.[item.id];
                          const rate = (member?.customRate !== undefined && member.customRate > 0) ? member.customRate : item.ratePerHour;
                          const totalHours = (member?.diarias || 0) * (member?.hoursPerDiaria || 0);
                          const totalValue = rate * totalHours;
                          return (
                            <tr key={item.id} className="border-b" style={{ borderColor: c.borderFaint }}>
                              <td className="py-2.5 text-sm align-middle" style={{ color: c.text }}>{item.label}</td>
                              <td className="py-2.5 text-right text-sm align-middle" style={{ color: c.text }}>{totalHours}h</td>
                              <td className="py-2.5 text-right text-sm align-middle" style={{ color: c.text }}>{formatCurrency(totalValue)}</td>
                            </tr>
                          );
                        })}
                        {customItems.map((m, i) => {
                          const totalHours = (m.diarias || 0) * (m.hoursPerDiaria || 0);
                          return (
                            <tr key={`custom-${i}`} className="border-b" style={{ borderColor: c.borderFaint }}>
                              <td className="py-2.5 text-sm align-middle" style={{ color: c.text }}>{m.label || "—"}</td>
                              <td className="py-2.5 text-right text-sm align-middle" style={{ color: c.text }}>{totalHours}h</td>
                              <td className="py-2.5 text-right text-sm align-middle" style={{ color: c.text }}>{formatCurrency((m.ratePerHour || 0) * totalHours)}</td>
                            </tr>
                          );
                        })}
                        <tr>
                          <td colSpan={2} className="pt-4 pb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: c.textMuted }}>
                            Total {PHASE_LABELS[phase]}
                          </td>
                          <td className="pt-4 pb-1 text-right text-sm font-bold" style={{ color: c.text }}>{formatCurrency(phaseTotal)}</td>
                        </tr>
                      </tbody>
                    </table>
                  ) : phase === "production" ? (
                    <table className="w-full text-sm">
                      <colgroup>
                        <col style={{ width: "26%" }} />
                        <col style={{ width: "18%" }} />
                        <col style={{ width: "14%" }} />
                        <col style={{ width: "22%" }} />
                        <col style={{ width: "20%" }} />
                      </colgroup>
                      <thead>
                        <tr className="border-b" style={{ borderColor: c.border }}>
                          <th className="text-left pb-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Profissional</th>
                          <th className="text-right pb-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Data</th>
                          <th className="text-right pb-2.5 text-xs font-semibold uppercase tracking-wider pr-4" style={{ color: GREEN }}>Diárias</th>
                          <th className="text-right pb-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Horas/Diária</th>
                          <th className="text-right pb-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Valor Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => {
                          const member = team?.[item.id];
                          const rate = (member?.customRate !== undefined && member.customRate > 0) ? member.customRate : item.ratePerHour;
                          const diarias = member?.diarias || 0;
                          const totalHours = diarias * (member?.hoursPerDiaria || 0);
                          const totalValue = rate * totalHours;
                          const dates = (member?.dates || []).slice(0, diarias).filter(Boolean);
                          const hasDates = dates.length > 0;
                          return (
                            <tr key={item.id} className="border-b" style={{ borderColor: c.borderFaint }}>
                              <td className="py-2.5 text-sm align-middle" style={{ color: c.text }}>{item.label}</td>
                              <td className="py-2.5 text-right text-sm align-top pt-3" style={{ color: hasDates ? c.text : c.textFaint }}>
                                {hasDates ? dates.map((d, i) => <div key={i}>{formatDate(d)}</div>) : "—"}
                              </td>
                              <td className="py-2.5 text-right text-sm align-middle pr-4" style={{ color: c.text }}>{diarias}</td>
                              <td className="py-2.5 text-right text-sm align-middle" style={{ color: c.text }}>{member?.hoursPerDiaria || 0}h</td>
                              <td className="py-2.5 text-right text-sm align-middle" style={{ color: c.text }}>{formatCurrency(totalValue)}</td>
                            </tr>
                          );
                        })}
                        {customItems.map((m, i) => {
                          const diarias = m.diarias || 0;
                          const totalHours = diarias * (m.hoursPerDiaria || 0);
                          const dates = (m.dates || []).slice(0, diarias).filter(Boolean);
                          return (
                            <tr key={`custom-${i}`} className="border-b" style={{ borderColor: c.borderFaint }}>
                              <td className="py-2.5 text-sm align-middle" style={{ color: c.text }}>{m.label || "—"}</td>
                              <td className="py-2.5 text-right text-sm align-top pt-3" style={{ color: dates.length > 0 ? c.text : c.textFaint }}>
                                {dates.length > 0 ? dates.map((d, j) => <div key={j}>{formatDate(d)}</div>) : "—"}
                              </td>
                              <td className="py-2.5 text-right text-sm align-middle pr-4" style={{ color: c.text }}>{diarias}</td>
                              <td className="py-2.5 text-right text-sm align-middle" style={{ color: c.text }}>{m.hoursPerDiaria || 0}h</td>
                              <td className="py-2.5 text-right text-sm align-middle" style={{ color: c.text }}>{formatCurrency((m.ratePerHour || 0) * totalHours)}</td>
                            </tr>
                          );
                        })}
                        <tr>
                          <td colSpan={4} className="pt-4 pb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: c.textMuted }}>
                            Total {PHASE_LABELS[phase]}
                          </td>
                          <td className="pt-4 pb-1 text-right text-sm font-bold" style={{ color: c.text }}>{formatCurrency(phaseTotal)}</td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-sm">
                      <colgroup>
                        <col style={{ width: "40%" }} />
                        <col style={{ width: "15%" }} />
                        <col style={{ width: "20%" }} />
                        <col style={{ width: "25%" }} />
                      </colgroup>
                      <thead>
                        <tr className="border-b" style={{ borderColor: c.border }}>
                          <th className="text-left pb-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Profissional</th>
                          <th className="text-right pb-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Diárias</th>
                          <th className="text-right pb-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Horas/Diária</th>
                          <th className="text-right pb-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Valor Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => {
                          const member = team?.[item.id];
                          const rate = (member?.customRate !== undefined && member.customRate > 0) ? member.customRate : item.ratePerHour;
                          const totalHours = (member?.diarias || 0) * (member?.hoursPerDiaria || 0);
                          const totalValue = rate * totalHours;
                          return (
                            <tr key={item.id} className="border-b" style={{ borderColor: c.borderFaint }}>
                              <td className="py-2.5 text-sm align-middle" style={{ color: c.text }}>{item.label}</td>
                              <td className="py-2.5 text-right text-sm align-middle" style={{ color: c.text }}>{member?.diarias || 0}</td>
                              <td className="py-2.5 text-right text-sm align-middle" style={{ color: c.text }}>{member?.hoursPerDiaria || 0}h</td>
                              <td className="py-2.5 text-right text-sm align-middle" style={{ color: c.text }}>{formatCurrency(totalValue)}</td>
                            </tr>
                          );
                        })}
                        {customItems.map((m, i) => {
                          const totalHours = (m.diarias || 0) * (m.hoursPerDiaria || 0);
                          return (
                            <tr key={`custom-${i}`} className="border-b" style={{ borderColor: c.borderFaint }}>
                              <td className="py-2.5 text-sm align-middle" style={{ color: c.text }}>{m.label || "—"}</td>
                              <td className="py-2.5 text-right text-sm align-middle" style={{ color: c.text }}>{m.diarias || 0}</td>
                              <td className="py-2.5 text-right text-sm align-middle" style={{ color: c.text }}>{m.hoursPerDiaria || 0}h</td>
                              <td className="py-2.5 text-right text-sm align-middle" style={{ color: c.text }}>{formatCurrency((m.ratePerHour || 0) * totalHours)}</td>
                            </tr>
                          );
                        })}
                        <tr>
                          <td colSpan={3} className="pt-4 pb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: c.textMuted }}>
                            Total {PHASE_LABELS[phase]}
                          </td>
                          <td className="pt-4 pb-1 text-right text-sm font-bold" style={{ color: c.text }}>{formatCurrency(phaseTotal)}</td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Equipamentos */}
        {hasEquipment && (
          <SectionBlock>
            <SectionHeading number={sectionNums.equipment} title="Equipamentos" c={c} />
            <table className="w-full text-sm">
              <colgroup>
                <col style={{ width: "45%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "23%" }} />
              </colgroup>
              <thead>
                <tr className="border-b" style={{ borderColor: c.border }}>
                  <th className="text-left pb-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Equipamento</th>
                  <th className="text-right pb-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Qtd</th>
                  <th className="text-right pb-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Valor Unit.</th>
                  <th className="text-right pb-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(equipment || []).map((item, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: c.borderFaint }}>
                    <td className="py-2.5 align-middle" style={{ color: c.text }}>{item.name || "—"}</td>
                    <td className="py-2.5 text-right align-middle" style={{ color: c.text }}>{item.quantity}</td>
                    <td className="py-2.5 text-right align-middle" style={{ color: c.textMuted }}>{formatCurrency(item.unitPrice)}</td>
                    <td className="py-2.5 text-right font-medium align-middle" style={{ color: c.text }}>
                      {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} className="pt-4 pb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: c.textMuted }}>
                    Total Equipamentos
                  </td>
                  <td className="pt-4 pb-1 text-right font-bold" style={{ color: c.text }}>{formatCurrency(summary.equipment)}</td>
                </tr>
              </tbody>
            </table>
          </SectionBlock>
        )}

        {/* 6. Itens inclusos e não inclusos */}
        {hasIncluded && (
          <SectionBlock>
            <SectionHeading number={sectionNums.included} title="Itens Inclusos e Não Inclusos" c={c} />
            <div className="grid grid-cols-2 gap-8">
              {includedItems.included.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>Inclusos</p>
                  <ul className="space-y-2.5">
                    {labelFor(INCLUDED_ITEMS, includedItems.included).map((l) => (
                      <li key={l} className="text-sm flex items-center gap-2" style={{ color: c.text }}>
                        <span className="font-bold" style={{ color: GREEN }}>✓</span> {l}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {includedItems.excluded.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>Não inclusos</p>
                  <ul className="space-y-2.5">
                    {labelFor(INCLUDED_ITEMS, includedItems.excluded).map((l) => (
                      <li key={l} className="text-sm flex items-center gap-2" style={{ color: c.text }}>
                        <span className="font-bold" style={{ color: c.textFaint }}>✕</span> {l}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </SectionBlock>
        )}

        {/* 7. Cronograma */}
        {!!schedule && (
          <SectionBlock>
            <SectionHeading number={sectionNums.schedule} title="Cronograma" c={c} />
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: c.text }}>{schedule}</p>
          </SectionBlock>
        )}

        {/* 8. Responsabilidade do cliente */}
        {!!clientResponsibilities && (
          <SectionBlock>
            <SectionHeading number={sectionNums.responsibilities} title="Responsabilidade do Cliente" c={c} />
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: c.text }}>{clientResponsibilities}</p>
          </SectionBlock>
        )}

        {/* 9. Logística */}
        {hasLogistics && (
          <SectionBlock>
            <SectionHeading number={sectionNums.logistics} title="Logística" c={c} />
            <div className="space-y-1">
              {logistics.displacement.enabled && (
                <Row
                  label="Deslocamento"
                  value={formatCurrency(
                    logistics.displacement.ratePerKm * logistics.displacement.kilometers +
                    (logistics.displacement.customValue || 0)
                  )}
                  c={c}
                />
              )}
              {logistics.meals.enabled && (
                <Row
                  label="Alimentação"
                  value={formatCurrency(logistics.meals.ratePerPerson * logistics.meals.people)}
                  c={c}
                />
              )}
              {logistics.studio?.enabled && (
                <Row
                  label="Estúdio de gravação"
                  value={formatCurrency(logistics.studio.value)}
                  c={c}
                />
              )}
            </div>
          </SectionBlock>
        )}

        {/* 10. Condições gerais */}
        {hasConditions && (
          <SectionBlock>
            <SectionHeading number={sectionNums.conditions} title="Condições Gerais" c={c} />
            <div className="space-y-1">
              <Row
                label="Validade"
                value={formatDateRange(generalConditions.validityStart, generalConditions.validityEnd)}
                c={c}
              />
              <div className="flex gap-4 py-2.5 border-b last:border-0" style={{ borderColor: c.border }}>
                <span className="w-36 shrink-0 text-xs font-medium uppercase tracking-wide" style={{ color: c.textMuted }}>Pagamento</span>
                <span className="text-sm whitespace-pre-wrap" style={{ color: c.text }}>{generalConditions.paymentMethod}</span>
              </div>
              <Row
                label="Alterações"
                value={REVISION_OPTIONS.find((r) => r.id === generalConditions.revisions)?.label || ""}
                c={c}
              />
            </div>
          </SectionBlock>
        )}

        {/* 11. Investimento */}
        <SectionBlock>
          <SectionHeading number={sectionNums.investment} title="Investimento" c={c} />
          <div className="border px-6 py-5" style={{ borderColor: c.border }}>
            <InvestmentLine label="Pré-produção" value={summary.preProduction} c={c} />
            <InvestmentLine label="Produção" value={summary.production} c={c} />
            <InvestmentLine label="Pós-produção" value={summary.postProduction} c={c} />
            {summary.equipment > 0 && <InvestmentLine label="Equipamentos" value={summary.equipment} c={c} />}
            {summary.logistics > 0 && <InvestmentLine label="Logística" value={summary.logistics} c={c} />}
            <InvestmentLine label={`Honorários (${feesPct}%)`} value={summary.fees} sub c={c} />
            <InvestmentLine label="Impostos (8%)" value={summary.taxes} sub c={c} />
            <InvestmentLine label="Valor Total" value={summary.total} total c={c} />

            {discountPct > 0 && (() => {
              const discountAmount = summary.total * (discountPct / 100);
              const discountedTotal = summary.total - discountAmount;
              return (
                <>
                  <InvestmentLine label={`Desconto (${discountPct}%)`} value={-discountAmount} sub c={c} />
                  <InvestmentLine label="Valor com Desconto" value={discountedTotal} total c={c} />
                </>
              );
            })()}

            {(customInvestmentItems || []).filter((item) => item.name || item.directValue > 0 || item.values?.length > 0).length > 0 && (
              <div className="mt-6 pt-4 border-t" style={{ borderColor: c.border }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>
                  Divisão por Projetos
                </p>
                {(customInvestmentItems || []).map((item, i) => {
                  const hasSubValues = (item.values || []).length > 0;
                  return (
                    <div key={i} className="mb-3 last:mb-0">
                      {hasSubValues ? (
                        <>
                          <div className="py-2 border-b" style={{ borderColor: c.border }}>
                            <span className="text-sm font-semibold" style={{ color: c.text }}>{item.name || "—"}</span>
                          </div>
                          {(item.values || []).map((v, j) => (
                            <div key={j} className="flex items-center justify-between py-1.5 pl-4 border-b last:border-0" style={{ borderColor: c.borderFaint }}>
                              <span className="text-sm" style={{ color: c.text }}>{v.label || "—"}</span>
                              <span className="text-sm font-medium" style={{ color: c.text }}>{formatCurrency(v.amount || 0)}</span>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: c.borderFaint }}>
                          <span className="text-sm" style={{ color: c.text }}>{item.name || "—"}</span>
                          <span className="text-sm font-medium" style={{ color: c.text }}>{formatCurrency(item.directValue || 0)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </SectionBlock>

      </div>

    </div>
  );
}
