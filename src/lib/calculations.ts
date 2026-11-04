import { TEAM_ITEMS } from "@/data/items";
import type { TeamMember, TeamSelection, Logistics, InvestmentSummary, EquipmentItem, CustomTeamMember, ProposalFormData } from "@/types/proposal";

export const DEFAULT_TAX_RATE = 8;

type DiariaHours = Pick<TeamMember, "diarias" | "hoursPerDiaria" | "hoursByDiaria">;

// cada diária pode ter duração própria; diária sem valor usa o padrão de horas/diária
export function horasDaDiaria(m: DiariaHours, idx: number): number {
  const own = m.hoursByDiaria?.[idx];
  return own && own > 0 ? own : m.hoursPerDiaria || 0;
}

export function totalHorasMembro(m: DiariaHours | undefined): number {
  if (!m) return 0;
  let total = 0;
  for (let i = 0; i < (m.diarias || 0); i++) total += horasDaDiaria(m, i);
  return total;
}

export function formatHorasDiarias(m: DiariaHours | undefined): string {
  if (!m || !m.diarias) return `${m?.hoursPerDiaria || 0}h`;
  const hours = Array.from({ length: m.diarias }, (_, i) => horasDaDiaria(m, i));
  return hours.every((h) => h === hours[0]) ? `${hours[0]}h` : hours.map((h) => `${h}h`).join(" + ");
}

export function calcularFase(
  team: TeamSelection,
  phase: "pre-production" | "production" | "post-production",
  customTeam: CustomTeamMember[] = []
): number {
  const regular = TEAM_ITEMS.filter((item) => item.phase === phase).reduce((sum, item) => {
    const member = team[item.id];
    if (!member?.selected) return sum;
    const totalHours = totalHorasMembro(member);
    const rate = (member.customRate !== undefined && member.customRate > 0)
      ? member.customRate
      : item.ratePerHour;
    return sum + rate * totalHours;
  }, 0);

  const custom = customTeam
    .filter((m) => m.phase === phase)
    .reduce((sum, m) => {
      const totalHours = totalHorasMembro(m);
      return sum + (m.ratePerHour || 0) * totalHours;
    }, 0);

  return regular + custom;
}

export function calcularLogistica(logistics: Logistics): number {
  let total = 0;
  if (logistics.displacement.enabled) {
    total += logistics.displacement.ratePerKm * logistics.displacement.kilometers;
    total += logistics.displacement.customValue || 0;
  }
  if (logistics.meals.enabled) {
    total += logistics.meals.ratePerPerson * logistics.meals.people;
  }
  if (logistics.studio?.enabled) {
    total += logistics.studio.value;
  }
  if (logistics.hosting?.enabled) {
    total += logistics.hosting.value;
  }
  return total;
}

export function calcularEquipamentos(equipment: EquipmentItem[]): number {
  return (equipment || []).reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
}

export function calcularInvestimento(
  team: TeamSelection,
  logistics: Logistics,
  equipment: EquipmentItem[] = [],
  feesRate: number = 25,
  customTeam: CustomTeamMember[] = [],
  rawFootageValue: number = 0,
  taxRate: number = DEFAULT_TAX_RATE
): InvestmentSummary {
  const preProduction = calcularFase(team, "pre-production", customTeam);
  const equipmentTotal = calcularEquipamentos(equipment);
  // equipamentos entram no valor de produção; `equipment` no retorno é só informativo
  const production = calcularFase(team, "production", customTeam) + equipmentTotal;
  const postProduction = calcularFase(team, "post-production", customTeam);
  const rawFootage = rawFootageValue || 0;
  const logisticsTotal = calcularLogistica(logistics);

  const subtotal = preProduction + production + postProduction + rawFootage + logisticsTotal;
  const fees = subtotal * (feesRate / 100);
  const taxBase = subtotal + fees;
  const taxes = taxBase * (taxRate / 100);
  const total = subtotal + fees + taxes;

  return {
    preProduction,
    production,
    postProduction,
    rawFootage,
    equipment: equipmentTotal,
    logistics: logisticsTotal,
    subtotal,
    taxes,
    fees,
    total,
  };
}

export function calcularInvestimentoFromData(data: ProposalFormData): InvestmentSummary {
  return calcularInvestimento(
    data.team || {},
    data.logistics,
    data.equipment || [],
    data.feesRate ?? 25,
    data.customTeam || [],
    data.deliverables?.rawFootageValue || 0,
    data.taxRate ?? DEFAULT_TAX_RATE
  );
}

export function formatCurrency(value: number): string {
  return (value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
