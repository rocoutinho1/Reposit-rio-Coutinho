import { TEAM_ITEMS } from "@/data/items";
import type { TeamSelection, Logistics, InvestmentSummary, EquipmentItem, CustomTeamMember } from "@/types/proposal";

const TAX_RATE = 0.08;

export function calcularFase(
  team: TeamSelection,
  phase: "pre-production" | "production" | "post-production",
  customTeam: CustomTeamMember[] = []
): number {
  const regular = TEAM_ITEMS.filter((item) => item.phase === phase).reduce((sum, item) => {
    const member = team[item.id];
    if (!member?.selected) return sum;
    const totalHours = (member.diarias || 0) * (member.hoursPerDiaria || 0);
    const rate = (member.customRate !== undefined && member.customRate > 0)
      ? member.customRate
      : item.ratePerHour;
    return sum + rate * totalHours;
  }, 0);

  const custom = customTeam
    .filter((m) => m.phase === phase)
    .reduce((sum, m) => {
      const totalHours = (m.diarias || 0) * (m.hoursPerDiaria || 0);
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
  customTeam: CustomTeamMember[] = []
): InvestmentSummary {
  const preProduction = calcularFase(team, "pre-production", customTeam);
  const production = calcularFase(team, "production", customTeam);
  const postProduction = calcularFase(team, "post-production", customTeam);
  const logisticsTotal = calcularLogistica(logistics);
  const equipmentTotal = calcularEquipamentos(equipment);

  const subtotal = preProduction + production + postProduction + logisticsTotal + equipmentTotal;
  const fees = subtotal * (feesRate / 100);
  const taxBase = preProduction + production + postProduction + logisticsTotal + equipmentTotal + fees;
  const taxes = taxBase * TAX_RATE;
  const total = subtotal + fees + taxes;

  return {
    preProduction,
    production,
    postProduction,
    equipment: equipmentTotal,
    logistics: logisticsTotal,
    subtotal,
    taxes,
    fees,
    total,
  };
}

export function formatCurrency(value: number): string {
  return (value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
