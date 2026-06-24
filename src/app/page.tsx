"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ProposalFormData } from "@/types/proposal";
import { FormHeader } from "@/components/form/FormHeader";
import { AboutProject } from "@/components/form/AboutProject";
import { Deliverables } from "@/components/form/Deliverables";
import { Processes } from "@/components/form/Processes";
import { Team } from "@/components/form/Team";
import { Equipment } from "@/components/form/Equipment";
import { IncludedItems } from "@/components/form/IncludedItems";
import { Schedule } from "@/components/form/Schedule";
import { ClientResponsibilities } from "@/components/form/ClientResponsibilities";
import { Logistics } from "@/components/form/Logistics";
import { GeneralConditions } from "@/components/form/GeneralConditions";
import { Investment } from "@/components/form/Investment";
import { ImportFromFile } from "@/components/form/ImportFromFile";
import { useRouter } from "next/navigation";
import { saveToHistory } from "@/lib/history";

const DEFAULT_VALUES: ProposalFormData = {
  header: {
    client: "",
    project: "",
    date: "",
    periodStart: "",
    periodEnd: "",
    contact: "contato@quadrosporsegundo.com.br",
  },
  aboutProject: "",
  deliverables: { video: { groups: [] }, photoQuantity: 0, rawFootageQuantity: 0 },
  processes: { preProduction: [], production: [], postProduction: [] },
  customProcesses: [],
  team: {},
  customTeam: [],
  equipment: [],
  includedItems: { included: [], excluded: [] },
  schedule: "",
  clientResponsibilities: "",
  logistics: {
    displacement: { enabled: false, ratePerKm: 0, kilometers: 0, customValue: 0 },
    meals: { enabled: false, ratePerPerson: 0, people: 0 },
    studio: { enabled: false, value: 0 },
  },
  generalConditions: { validityStart: "", validityEnd: "", paymentMethod: "", revisions: "" },
  feesRate: 25,
  discountRate: 0,
  customInvestmentItems: [],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge(defaults: any, overrides: any): any {
  if (overrides === null || overrides === undefined) return defaults;
  if (Array.isArray(overrides)) return overrides;
  if (typeof overrides !== "object" || typeof defaults !== "object") return overrides;
  const result = { ...defaults };
  for (const key of Object.keys(overrides)) {
    const val = overrides[key];
    if (val === undefined || val === null) continue;
    result[key] = deepMerge(defaults[key], val);
  }
  return result;
}

function loadDraft(): ProposalFormData {
  try {
    const saved = localStorage.getItem("proposalDraft");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old video format (quantity + videos[]) → groups[]
      if (parsed.deliverables?.video && !parsed.deliverables.video.groups) {
        const oldVideos: Array<{ name: string; customName?: string; format: string; duration: string }> =
          parsed.deliverables.video.videos || [];
        parsed.deliverables.video = {
          groups: oldVideos.map((v) => ({
            quantity: 1,
            name: v.name,
            customName: v.customName,
            format: v.format,
            duration: v.duration,
          })),
        };
      }
      return { ...DEFAULT_VALUES, ...parsed, header: { ...DEFAULT_VALUES.header, ...parsed.header } };
    }
  } catch {
    // ignore
  }
  return DEFAULT_VALUES;
}

export default function Home() {
  const router = useRouter();
  const { register, control, handleSubmit, watch, reset } = useForm<ProposalFormData>({
    defaultValues: DEFAULT_VALUES,
  });

  const clientVal = watch("header.client");
  const projectVal = watch("header.project");
  const canSubmit = !!clientVal?.trim() && !!projectVal?.trim();

  useEffect(() => {
    const draft = loadDraft();
    reset(draft);
    localStorage.removeItem("editingProposalId");
  }, [reset]);

  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem("proposalDraft", JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  function onSubmit(data: ProposalFormData) {
    saveToHistory(data);
    localStorage.setItem("proposalData", JSON.stringify(data));
    router.push("/preview");
  }

  function handleImport(importedData: Partial<ProposalFormData>) {
    const merged = deepMerge(DEFAULT_VALUES, importedData) as ProposalFormData;
    reset(merged);
  }

  function handleNewProposal() {
    if (!confirm("Tem certeza que quer limpar o formulário e começar do zero?")) return;
    localStorage.removeItem("proposalDraft");
    localStorage.removeItem("proposalData");
    reset(DEFAULT_VALUES);
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-base font-semibold tracking-tight text-black">Proposta Maker</h1>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleNewProposal}
                className="text-xs text-black/35 hover:text-red-500 transition-colors underline-offset-2 hover:underline"
              >
                Limpar formulário
              </button>
              <span className="text-black/15 text-xs">|</span>
              <button
                type="button"
                onClick={() => router.push("/historico")}
                className="text-xs text-black/35 hover:text-black transition-colors underline-offset-2 hover:underline"
              >
                Histórico
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!canSubmit && (
              <p className="text-xs text-black/40 hidden sm:block">Preencha Cliente e Projeto para continuar</p>
            )}
            <button
              type="button"
              onClick={canSubmit ? handleSubmit(onSubmit) : undefined}
              disabled={!canSubmit}
              className="rounded-none bg-black px-6 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-35 disabled:cursor-not-allowed hover:opacity-80"
            >
              Gerar Proposta →
            </button>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-3xl space-y-12 px-6 py-10">
        <ImportFromFile onImport={handleImport} />
        <FormHeader register={register} />
        <AboutProject register={register} />
        <Deliverables control={control} />
        <Processes control={control} />
        <Team control={control} />
        <Equipment control={control} />
        <IncludedItems control={control} />
        <Schedule register={register} />
        <ClientResponsibilities register={register} />
        <Logistics control={control} />
        <GeneralConditions register={register} control={control} />
        <Investment control={control} />

        <div className="border-t border-black/10 pt-8 pb-16 space-y-3">
          {!canSubmit && (
            <p className="text-center text-xs text-black/40">Preencha os campos Cliente e Projeto para gerar a proposta</p>
          )}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-none bg-black py-4 text-sm font-semibold text-white tracking-wide transition-opacity hover:opacity-80 disabled:opacity-35 disabled:cursor-not-allowed"
          >
            Gerar Proposta em PDF →
          </button>
        </div>
      </form>
    </main>
  );
}
