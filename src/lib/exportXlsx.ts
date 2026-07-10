import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ProposalFormData } from "@/types/proposal";
import { TEAM_ITEMS } from "@/data/items";
import { calcularInvestimento } from "./calculations";

const TAX_RATE = 0.08;

// ARGB colors matching the model
const BG = {
  darkGreen:    "FF375E40",
  darkRed:      "FFC0392B",
  colHeader:    "FF70AD47",
  summaryLabel: "FFFFEB9C",
  summaryVal:   "FFA9D18E",
  feeVal:       "FFF4B942",
  totalRow:     "FFFFF2CC",
  white:        "FFFFFFFF",
};

function fill(argb: string): ExcelJS.Fill {
  return { type: "pattern", pattern: "solid", fgColor: { argb } };
}

function thinBorder(): Partial<ExcelJS.Borders> {
  const s = { style: "thin" as const, color: { argb: "FFB0B0B0" } };
  return { top: s, left: s, bottom: s, right: s };
}

type WS = ExcelJS.Worksheet;

function addSectionHeader(ws: WS, text: string) {
  const r = ws.addRow([text, "", "", ""]);
  ws.mergeCells(`A${r.number}:D${r.number}`);
  const c = r.getCell(1);
  c.value = text;
  c.style = {
    fill: fill(BG.darkGreen),
    font: { bold: true, color: { argb: "FFFFFFFF" }, size: 11, name: "Arial" },
    alignment: { horizontal: "center", vertical: "middle" },
  };
  r.height = 22;
}

function addSubHeader(ws: WS, text: string) {
  const r = ws.addRow([text, "", "", ""]);
  ws.mergeCells(`A${r.number}:D${r.number}`);
  const c = r.getCell(1);
  c.value = text;
  c.style = {
    fill: fill(BG.darkRed),
    font: { bold: true, color: { argb: "FFFFFFFF" }, size: 10, name: "Arial" },
    alignment: { horizontal: "center", vertical: "middle" },
  };
  r.height = 18;
}

function addColHeaders(ws: WS, col2 = "Quantidade") {
  const r = ws.addRow(["Descrição", col2, "Valor unitário", "Valor Total"]);
  ["A", "B", "C", "D"].forEach((col) => {
    const c = r.getCell(col);
    c.style = {
      fill: fill(BG.colHeader),
      font: { bold: true, color: { argb: "FF000000" }, size: 10, name: "Arial" },
      alignment: { horizontal: "center", vertical: "middle" },
      border: thinBorder(),
    };
  });
  r.height = 18;
}

function addDataRow(
  ws: WS,
  desc: string,
  qty: number,
  unitVal: number,
  total: number
) {
  const r = ws.addRow([desc, qty, unitVal, total]);
  r.height = 16;

  const alignments: ExcelJS.Alignment["horizontal"][] = ["left", "right", "right", "right"];
  const fmts = ["", "#,##0", 'R$#,##0.00', 'R$#,##0.00'];

  ["A", "B", "C", "D"].forEach((col, i) => {
    const c = r.getCell(col);
    c.style = {
      fill: fill(BG.white),
      font: { color: { argb: "FF000000" }, size: 10, name: "Arial" },
      alignment: { horizontal: alignments[i], vertical: "middle" },
      border: thinBorder(),
    };
    if (fmts[i]) c.numFmt = fmts[i];
  });
}

function addTotalRow(ws: WS, total: number) {
  const r = ws.addRow(["", "", "Total", total]);
  ws.mergeCells(`A${r.number}:B${r.number}`);
  r.height = 16;

  ["A", "B", "C", "D"].forEach((col) => {
    const c = r.getCell(col);
    c.style = {
      fill: fill(BG.totalRow),
      font: { bold: true, color: { argb: "FF000000" }, size: 10, name: "Arial" },
      alignment: { horizontal: "right", vertical: "middle" },
      border: thinBorder(),
    };
  });
  r.getCell("D").numFmt = 'R$#,##0.00';
}

function addEmpty(ws: WS) {
  ws.addRow(["", "", "", ""]).height = 8;
}

export async function exportarPlanilha(data: ProposalFormData): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Proposta Maker";

  const ws = wb.addWorksheet("Planilha Orçamentária");
  ws.getColumn(1).width = 34;
  ws.getColumn(2).width = 14;
  ws.getColumn(3).width = 16;
  ws.getColumn(4).width = 14;

  const { team = {}, equipment = [], logistics, feesRate = 25, deliverables } = data;
  const rawFootageValue = deliverables?.rawFootageValue || 0;
  const summary = calcularInvestimento(team, logistics, equipment, feesRate, [], rawFootageValue);

  // ── TÍTULO ──────────────────────────────────────────────────────────
  const titleRow = ws.addRow(["Planilha Orçamentária", "", "", ""]);
  ws.mergeCells(`A${titleRow.number}:D${titleRow.number}`);
  titleRow.getCell(1).style = {
    fill: fill(BG.darkGreen),
    font: { bold: true, color: { argb: "FFFFFFFF" }, size: 14, name: "Arial" },
    alignment: { horizontal: "center", vertical: "middle" },
  };
  titleRow.height = 28;
  addEmpty(ws);

  // ── RESUMO FINANCEIRO ────────────────────────────────────────────────
  const summaryData = [
    { label: "Total do projeto", value: summary.subtotal, valueBg: BG.summaryVal },
    { label: "Fee", value: summary.fees, valueBg: BG.feeVal },
    { label: "Impostos", value: summary.taxes, valueBg: BG.summaryVal },
    { label: "Preço do produto", value: summary.total, valueBg: BG.summaryVal },
  ];

  for (const item of summaryData) {
    const r = ws.addRow([item.label, "", "", item.value]);
    ws.mergeCells(`A${r.number}:C${r.number}`);
    r.height = 18;

    const labelCell = r.getCell("A");
    labelCell.value = item.label;
    labelCell.style = {
      fill: fill(BG.summaryLabel),
      font: { bold: true, color: { argb: "FF000000" }, size: 10, name: "Arial" },
      alignment: { horizontal: "left", vertical: "middle" },
      border: thinBorder(),
    };

    const valCell = r.getCell("D");
    valCell.style = {
      fill: fill(item.valueBg),
      font: { bold: true, color: { argb: "FF000000" }, size: 10, name: "Arial" },
      alignment: { horizontal: "right", vertical: "middle" },
      border: thinBorder(),
    };
    valCell.numFmt = 'R$#,##0.00';
  }

  addEmpty(ws);

  // ── PRÉ-PRODUÇÃO ─────────────────────────────────────────────────────
  addSectionHeader(ws, "Pré produção");
  addColHeaders(ws, "Quantidade");

  const preItems = TEAM_ITEMS.filter((i) => i.phase === "pre-production");
  for (const item of preItems) {
    const m = team[item.id];
    const hrs = m?.selected ? (m.diarias || 0) * (m.hoursPerDiaria || 0) : 0;
    const rate = (m?.customRate !== undefined && m.customRate > 0) ? m.customRate : item.ratePerHour;
    addDataRow(ws, item.label, hrs, rate, rate * hrs);
  }
  addTotalRow(ws, summary.preProduction);
  addEmpty(ws);

  // ── PRODUÇÃO ──────────────────────────────────────────────────────────
  addSectionHeader(ws, "Produção");

  // Equipe
  addSubHeader(ws, "Equipe");
  addColHeaders(ws, "Quantidade (H)");
  const prodItems = TEAM_ITEMS.filter((i) => i.phase === "production");
  for (const item of prodItems) {
    const m = team[item.id];
    const hrs = m?.selected ? (m.diarias || 0) * (m.hoursPerDiaria || 0) : 0;
    const rate = (m?.customRate !== undefined && m.customRate > 0) ? m.customRate : item.ratePerHour;
    addDataRow(ws, item.label, hrs, rate, rate * hrs);
  }

  // Equipamentos
  addSubHeader(ws, "Equipamentos");
  addColHeaders(ws, "Quantidade");
  const equipList = equipment.length > 0 ? equipment : Array(4).fill(null);
  for (const eq of equipList) {
    if (eq) {
      addDataRow(ws, eq.name, eq.quantity, eq.unitPrice, eq.quantity * eq.unitPrice);
    } else {
      addDataRow(ws, "", 0, 0, 0);
    }
  }

  // Locação
  addSubHeader(ws, "Locação");
  addColHeaders(ws, "Quantidade (H)");
  const studioEnabled = logistics.studio?.enabled;
  const studioVal = logistics.studio?.value || 0;
  addDataRow(ws, "Locação", studioEnabled ? 1 : 0, studioVal, studioEnabled ? studioVal : 0);

  if (rawFootageValue > 0) {
    addDataRow(ws, "Material bruto", 1, rawFootageValue, rawFootageValue);
  }

  addTotalRow(ws, summary.production + summary.equipment);
  addEmpty(ws);

  // ── PÓS-PRODUÇÃO ──────────────────────────────────────────────────────
  addSectionHeader(ws, "Pós produção");
  addColHeaders(ws, "Quantidade (H)");

  const posItems = TEAM_ITEMS.filter((i) => i.phase === "post-production");
  for (const item of posItems) {
    const m = team[item.id];
    const hrs = m?.selected ? (m.diarias || 0) * (m.hoursPerDiaria || 0) : 0;
    const rate = (m?.customRate !== undefined && m.customRate > 0) ? m.customRate : item.ratePerHour;
    addDataRow(ws, item.label, hrs, rate, rate * hrs);
  }
  addTotalRow(ws, summary.postProduction);
  addEmpty(ws);

  // ── OPERACIONAL ───────────────────────────────────────────────────────
  addSubHeader(ws, "Operacional");
  addColHeaders(ws, "Quantidade");

  const dispEnabled = logistics.displacement.enabled;
  const dispKm = logistics.displacement.kilometers || 0;
  const dispRate = logistics.displacement.ratePerKm || 0;
  const dispCustom = logistics.displacement.customValue || 0;
  const dispTotal = dispEnabled ? dispKm * dispRate + dispCustom : 0;
  addDataRow(ws, "Transporte", dispKm, dispRate, dispTotal);

  const mealsEnabled = logistics.meals.enabled;
  const mealsPeople = logistics.meals.people || 0;
  const mealsRate = logistics.meals.ratePerPerson || 0;
  addDataRow(ws, "Alimentação", mealsPeople, mealsRate, mealsEnabled ? mealsPeople * mealsRate : 0);

  addTotalRow(ws, summary.logistics);

  // ── DOWNLOAD ──────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `planilha-${data.header.project || "proposta"}.xlsx`);
}
