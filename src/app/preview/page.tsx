"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProposalFormData } from "@/types/proposal";
import { ProposalPreview } from "@/components/proposal/ProposalPreview";
import { TEAM_ITEMS, PHASE_LABELS, Phase } from "@/data/items";
import { calcularInvestimento, calcularFase } from "@/lib/calculations";
import { exportarPlanilha } from "@/lib/exportXlsx";

export default function PreviewPage() {
  const router = useRouter();
  const [data, setData] = useState<ProposalFormData | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("proposalData") || localStorage.getItem("proposalDraft");
    if (!stored) {
      router.push("/");
      return;
    }
    setData(JSON.parse(stored));
  }, [router]);

  function handlePrint() {
    window.print();
  }

  function handleExportXlsx() {
    if (!data) return;
    exportarPlanilha(data);
  }

  const bgColor = darkMode ? "#111111" : "#ffffff";
  const canPrint = !!(data?.header?.client?.trim() && data?.header?.project?.trim());

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-black/40">Carregando proposta...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @page { margin: 0; margin-top: 60px; margin-bottom: 60px; }
        @page :first { margin-top: 0; }
        .print-page-header { display: none; }
        @media print {
          .no-print { display: none !important; }
          html {
            background: ${bgColor} !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
          body {
            background: ${bgColor};
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
          .min-h-screen {
            background: transparent !important;
            min-height: unset !important;
          }
          .print-area {
            padding: 2cm !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: ${bgColor} !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      `}</style>

      <div className={`min-h-screen ${darkMode ? "bg-zinc-900" : "bg-black/5"}`}>
        <div className="no-print sticky top-0 z-10 border-b border-black/10 bg-white">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="hidden sm:block">
                <h1 className="text-base font-semibold text-black">Preview da Proposta</h1>
                <p className="text-xs text-black/40">Revise antes de imprimir ou salvar como PDF</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => router.push("/")}
                  className="px-3 py-2 text-xs sm:px-4 sm:text-sm border border-black/20 text-black hover:bg-black/5 transition-colors"
                >
                  ← Editar
                </button>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="px-3 py-2 text-xs sm:px-4 sm:text-sm border border-black/20 text-black hover:bg-black/5 transition-colors"
                  title={darkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
                >
                  {darkMode ? "☀ Light" : "☾ Dark"}
                </button>
                <button
                  onClick={handleExportXlsx}
                  className="px-3 py-2 text-xs sm:px-4 sm:text-sm border border-[#375e40] text-[#375e40] hover:bg-[#375e40]/5 transition-colors hidden sm:inline-flex"
                >
                  Baixar Planilha
                </button>
                <button
                  onClick={canPrint ? handlePrint : undefined}
                  disabled={!canPrint}
                  title={!canPrint ? "Preencha Cliente e Projeto no formulário" : undefined}
                  className="px-4 py-2 text-xs sm:px-6 sm:text-sm bg-black text-white transition-opacity hover:opacity-80 disabled:opacity-35 disabled:cursor-not-allowed"
                >
                  Salvar PDF
                </button>
              </div>
            </div>
            {!canPrint && (
              <p className="text-xs text-black/40 mt-1">Volte ao formulário e preencha Cliente e Projeto para habilitar o PDF</p>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-3 sm:px-6 py-4 sm:py-8">
          <div
            className="print-area shadow-sm p-6 sm:p-10"
            style={{ backgroundColor: bgColor }}
          >
            <ProposalPreview data={data} darkMode={darkMode} />
          </div>
        </div>
      </div>
    </>
  );
}

function formatDate(d: string): string {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function esc(s: string | number): string {
  const str = String(s ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function row(...cols: (string | number)[]): string {
  return cols.map(esc).join(",") + "\n";
}

function gerarPlanilha(data: ProposalFormData): string {
  const { header, team, equipment, logistics, generalConditions, feesRate, discountRate } = data;
  const feesPct = feesRate ?? 25;
  const discountPct = discountRate ?? 0;
  const summary = calcularInvestimento(team || {}, logistics, equipment || [], feesPct);
  const phases: Phase[] = ["pre-production", "production", "post-production"];

  let csv = "";

  csv += row(`PLANILHA DE CONTROLE DE PRODUÇÃO`);
  csv += row(`Cliente`, header.client);
  csv += row(`Projeto`, header.project);
  csv += row(`Data`, formatDate(header.date));
  csv += row(`Período`, `${formatDate(header.periodStart)} até ${formatDate(header.periodEnd)}`);
  csv += "\n";

  // Equipe por fase
  csv += row("EQUIPE");
  csv += row("Fase", "Profissional", "Diárias", "Horas/diária", "Total horas", "R$/hora", "Subtotal");

  for (const phase of phases) {
    const items = TEAM_ITEMS.filter((i) => i.phase === phase && team?.[i.id]?.selected);
    if (!items.length) continue;
    for (const item of items) {
      const member = team[item.id];
      const diarias = member?.diarias || 0;
      const hoursPerDiaria = member?.hoursPerDiaria || 0;
      const totalHours = diarias * hoursPerDiaria;
      const subtotal = item.ratePerHour * totalHours;
      csv += row(PHASE_LABELS[phase], item.label, diarias, hoursPerDiaria, totalHours, item.ratePerHour, subtotal);
    }
    const phaseTotal = calcularFase(team || {}, phase);
    csv += row(PHASE_LABELS[phase] + " — Total", "", "", "", "", "", phaseTotal);
    csv += "\n";
  }

  // Equipamentos
  if ((equipment || []).length > 0) {
    csv += row("EQUIPAMENTOS");
    csv += row("Nome", "Quantidade", "Valor Unit. (R$)", "Subtotal");
    for (const item of equipment) {
      const subtotal = (item.quantity || 0) * (item.unitPrice || 0);
      csv += row(item.name, item.quantity, item.unitPrice, subtotal);
    }
    csv += row("Total Equipamentos", "", "", summary.equipment);
    csv += "\n";
  }

  // Logística
  const hasLogisticsCSV = logistics.displacement.enabled || logistics.meals.enabled || logistics.studio?.enabled;
  if (hasLogisticsCSV) {
    csv += row("LOGÍSTICA");
    csv += row("Item", "Valor (R$)");
    if (logistics.displacement.enabled) {
      const sub = logistics.displacement.ratePerKm * logistics.displacement.kilometers + (logistics.displacement.customValue || 0);
      csv += row("Deslocamento", sub);
    }
    if (logistics.meals.enabled) {
      const sub = logistics.meals.ratePerPerson * logistics.meals.people;
      csv += row("Alimentação", sub);
    }
    if (logistics.studio?.enabled) {
      csv += row("Estúdio de gravação", logistics.studio.value);
    }
    csv += row("Total Logística", summary.logistics);
    csv += "\n";
  }

  // Resumo financeiro
  csv += row("RESUMO FINANCEIRO");
  csv += row("Item", "Valor (R$)");
  csv += row("Pré-produção", summary.preProduction);
  csv += row("Produção", summary.production);
  csv += row("Pós-produção", summary.postProduction);
  if (summary.equipment > 0) csv += row("Equipamentos", summary.equipment);
  if (summary.logistics > 0) csv += row("Logística", summary.logistics);
  csv += row("Subtotal", summary.subtotal);
  csv += row(`Honorários (${feesPct}%)`, summary.fees);
  csv += row("Impostos (8%)", summary.taxes);
  csv += row("TOTAL", summary.total);
  if (discountPct > 0) {
    const discountAmount = summary.total * (discountPct / 100);
    csv += row(`Desconto (${discountPct}%)`, -discountAmount);
    csv += row("TOTAL COM DESCONTO", summary.total - discountAmount);
  }

  return csv;
}
