"use client";

import { Controller, Control, useFieldArray } from "react-hook-form";
import { ProposalFormData } from "@/types/proposal";
import {
  PRE_PRODUCTION_PROCESSES,
  PRODUCTION_PROCESSES,
  POST_PRODUCTION_PROCESSES,
  Phase,
} from "@/data/items";
import { CheckboxItem } from "@/components/ui/CheckboxItem";
import { SectionTitle } from "@/components/ui/SectionTitle";

interface Props {
  control: Control<ProposalFormData>;
}

function toggleValue(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

interface PhaseGroupProps {
  phase: Phase;
  label: string;
  items: readonly { id: string; label: string }[];
  fieldName: "processes.preProduction" | "processes.production" | "processes.postProduction";
  control: Control<ProposalFormData>;
  customFields: { field: { label: string; phase: Phase }; globalIndex: number }[];
  onAddCustom: () => void;
  onRemoveCustom: (globalIndex: number) => void;
}

function PhaseGroup({
  phase,
  label,
  items,
  fieldName,
  control,
  customFields,
  onAddCustom,
  onRemoveCustom,
}: PhaseGroupProps) {
  return (
    <div className="rounded-sm border border-black/8 p-4">
      <div className="mb-4 flex items-center justify-between border-b border-black/10 pb-2">
        <p className="text-sm font-medium text-black">{label}</p>
        <button
          type="button"
          onClick={onAddCustom}
          className="text-xs text-[#375e40] hover:opacity-70 transition-opacity"
        >
          + Adicionar processo
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 mb-4">
        <Controller
          name={fieldName}
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <>
              {items.map((item) => (
                <CheckboxItem
                  key={item.id}
                  id={`proc_${item.id}`}
                  label={item.label}
                  checked={field.value.includes(item.id)}
                  onChange={() => field.onChange(toggleValue(field.value, item.id))}
                />
              ))}
            </>
          )}
        />
      </div>

      {customFields.length > 0 && (
        <div className="border-t border-black/8 pt-4 space-y-2">
          {customFields.map(({ field, globalIndex }) => (
            <div key={globalIndex} className="flex items-center justify-between gap-3 p-3 bg-black/2 rounded">
              <Controller
                name={`customProcesses.${globalIndex}.label` as never}
                control={control}
                render={({ field: f }) => (
                  <input
                    {...(f as object)}
                    placeholder="Nome do processo"
                    className="flex-1 border-b border-dashed border-black/20 bg-transparent py-1 text-sm outline-none focus:border-[#375e40]"
                  />
                )}
              />
              <button
                type="button"
                onClick={() => onRemoveCustom(globalIndex)}
                className="text-xs text-black/25 hover:text-red-500 transition-colors shrink-0"
              >
                remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Processes({ control }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "customProcesses",
  });

  const phases: Phase[] = ["pre-production", "production", "post-production"];
  const phaseConfig = {
    "pre-production": { label: "Pré-produção", items: PRE_PRODUCTION_PROCESSES },
    "production": { label: "Produção", items: PRODUCTION_PROCESSES },
    "post-production": { label: "Pós-produção", items: POST_PRODUCTION_PROCESSES },
  };

  return (
    <section>
      <SectionTitle number="3" title="Processos" />
      <div className="space-y-6">
        {phases.map((phase) => {
          const config = phaseConfig[phase];
          const phaseCustomFields = fields
            .map((field, globalIndex) => ({ field: field as { label: string; phase: Phase }, globalIndex }))
            .filter(({ field }) => field.phase === phase);

          return (
            <PhaseGroup
              key={phase}
              phase={phase}
              label={config.label}
              items={config.items}
              fieldName={`processes.${phase === "pre-production" ? "preProduction" : phase === "production" ? "production" : "postProduction"}` as any}
              control={control}
              customFields={phaseCustomFields}
              onAddCustom={() => append({ label: "", phase })}
              onRemoveCustom={(globalIndex) => remove(globalIndex)}
            />
          );
        })}
      </div>
    </section>
  );
}
