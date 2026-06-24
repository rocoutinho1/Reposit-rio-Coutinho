"use client";

import { Control, Controller, useWatch, useFieldArray } from "react-hook-form";
import { ProposalFormData, CustomTeamMember } from "@/types/proposal";
import { TEAM_ITEMS, PHASE_LABELS, Phase } from "@/data/items";
import { CheckboxItem } from "@/components/ui/CheckboxItem";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatCurrency } from "@/lib/calculations";

interface Props {
  control: Control<ProposalFormData>;
}

// ── Linha de profissional padrão (da lista fixa) ─────────────────────────────

interface TeamMemberRowProps {
  itemId: string;
  label: string;
  defaultRate: number;
  phase: Phase;
  control: Control<ProposalFormData>;
}

function TeamMemberRow({ itemId, label, defaultRate, phase, control }: TeamMemberRowProps) {
  const selected = useWatch({ control, name: `team.${itemId}.selected` as never }) as unknown as boolean;
  const diarias = (useWatch({ control, name: `team.${itemId}.diarias` as never }) as unknown as number) || 0;
  const hoursPerDiaria = (useWatch({ control, name: `team.${itemId}.hoursPerDiaria` as never }) as unknown as number) || 0;
  const customRate = useWatch({ control, name: `team.${itemId}.customRate` as never }) as unknown as number | undefined;
  const effectiveRate = customRate !== undefined && customRate > 0 ? customRate : defaultRate;
  const subtotal = selected ? effectiveRate * diarias * hoursPerDiaria : 0;

  return (
    <div className="py-2 border-b border-black/5 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Controller
            name={`team.${itemId}.selected` as never}
            control={control}
            defaultValue={false as never}
            render={({ field }) => (
              <CheckboxItem
                id={`team_${itemId}`}
                label={label}
                checked={!!field.value}
                onChange={field.onChange}
              >
                {!!field.value && (
                  <div className="flex flex-wrap items-end gap-6 mt-2">
                    <Controller
                      name={`team.${itemId}.diarias` as never}
                      control={control}
                      defaultValue={0 as never}
                      render={({ field: f }) => (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-xs text-black/40">diárias</span>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            placeholder="0"
                            value={(f.value as number) || ""}
                            onChange={(e) => f.onChange(Number(e.target.value))}
                            className="w-16 border-b border-black/20 bg-transparent py-1 text-sm outline-none focus:border-[#375e40] text-center"
                          />
                        </div>
                      )}
                    />
                    <Controller
                      name={`team.${itemId}.hoursPerDiaria` as never}
                      control={control}
                      defaultValue={0 as never}
                      render={({ field: f }) => (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-xs text-black/40">horas/diária</span>
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            placeholder="0"
                            value={(f.value as number) || ""}
                            onChange={(e) => f.onChange(Number(e.target.value))}
                            className="w-16 border-b border-black/20 bg-transparent py-1 text-sm outline-none focus:border-[#375e40] text-center"
                          />
                        </div>
                      )}
                    />
                    {phase === "production" && diarias > 0 && (
                      <div className="flex flex-col gap-1.5 w-full">
                        {Array.from({ length: diarias }).map((_, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-xs text-black/35 w-10 shrink-0">dia {idx + 1}</span>
                            <Controller
                              name={`team.${itemId}.dates.${idx}` as never}
                              control={control}
                              defaultValue={"" as never}
                              render={({ field: f }) => (
                                <input
                                  type="date"
                                  value={(f.value as string) || ""}
                                  onChange={(e) => f.onChange(e.target.value)}
                                  className="border-b border-black/20 bg-transparent py-1 text-sm outline-none focus:border-[#375e40] text-black/70"
                                />
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CheckboxItem>
            )}
          />
        </div>

        <div className="text-right shrink-0">
          {selected ? (
            <Controller
              name={`team.${itemId}.customRate` as never}
              control={control}
              defaultValue={undefined as never}
              render={({ field: f }) => (
                <div className="flex items-center justify-end gap-1">
                  <span className="text-xs text-black/40">R$</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    placeholder={String(defaultRate)}
                    value={(f.value as number) ?? ""}
                    onChange={(e) =>
                      f.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                    }
                    className="w-14 border-b border-black/20 bg-transparent py-0.5 text-xs text-right outline-none focus:border-[#375e40]"
                  />
                  <span className="text-xs text-black/40">/h</span>
                </div>
              )}
            />
          ) : (
            <p className="text-xs text-black/40">{formatCurrency(defaultRate)}/h</p>
          )}
          {selected && subtotal > 0 && (
            <p className="mt-1 text-sm font-medium text-black">{formatCurrency(subtotal)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Linha de profissional customizado ────────────────────────────────────────

function CustomMemberRow({
  index,
  phase,
  control,
  onRemove,
}: {
  index: number;
  phase: Phase;
  control: Control<ProposalFormData>;
  onRemove: () => void;
}) {
  const diarias = (useWatch({ control, name: `customTeam.${index}.diarias` as never }) as unknown as number) || 0;
  const hoursPerDiaria = (useWatch({ control, name: `customTeam.${index}.hoursPerDiaria` as never }) as unknown as number) || 0;
  const rate = (useWatch({ control, name: `customTeam.${index}.ratePerHour` as never }) as unknown as number) || 0;
  const subtotal = rate * diarias * hoursPerDiaria;

  return (
    <div className="py-2 border-b border-black/5 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Controller
            name={`customTeam.${index}.label` as never}
            control={control}
            render={({ field }) => (
              <input
                {...(field as object)}
                placeholder="Nome do profissional"
                className="w-full border-b border-dashed border-black/20 bg-transparent py-1 text-sm outline-none focus:border-[#375e40]"
              />
            )}
          />
          <div className="flex flex-wrap items-end gap-6">
            <Controller
              name={`customTeam.${index}.diarias` as never}
              control={control}
              defaultValue={0 as never}
              render={({ field: f }) => (
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs text-black/40">diárias</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="0"
                    value={(f.value as number) || ""}
                    onChange={(e) => f.onChange(Number(e.target.value))}
                    className="w-16 border-b border-black/20 bg-transparent py-1 text-sm outline-none focus:border-[#375e40] text-center"
                  />
                </div>
              )}
            />
            <Controller
              name={`customTeam.${index}.hoursPerDiaria` as never}
              control={control}
              defaultValue={0 as never}
              render={({ field: f }) => (
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs text-black/40">horas/diária</span>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="0"
                    value={(f.value as number) || ""}
                    onChange={(e) => f.onChange(Number(e.target.value))}
                    className="w-16 border-b border-black/20 bg-transparent py-1 text-sm outline-none focus:border-[#375e40] text-center"
                  />
                </div>
              )}
            />
            {phase === "production" && diarias > 0 && (
              <div className="flex flex-col gap-1.5 w-full">
                {Array.from({ length: diarias }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-black/35 w-10 shrink-0">dia {idx + 1}</span>
                    <Controller
                      name={`customTeam.${index}.dates.${idx}` as never}
                      control={control}
                      defaultValue={"" as never}
                      render={({ field: f }) => (
                        <input
                          type="date"
                          value={(f.value as string) || ""}
                          onChange={(e) => f.onChange(e.target.value)}
                          className="border-b border-black/20 bg-transparent py-1 text-sm outline-none focus:border-[#375e40] text-black/70"
                        />
                      )}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-right shrink-0 space-y-1">
          <Controller
            name={`customTeam.${index}.ratePerHour` as never}
            control={control}
            defaultValue={0 as never}
            render={({ field: f }) => (
              <div className="flex items-center justify-end gap-1">
                <span className="text-xs text-black/40">R$</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  value={(f.value as number) || ""}
                  onChange={(e) => f.onChange(Number(e.target.value))}
                  className="w-14 border-b border-black/20 bg-transparent py-0.5 text-xs text-right outline-none focus:border-[#375e40]"
                />
                <span className="text-xs text-black/40">/h</span>
              </div>
            )}
          />
          {subtotal > 0 && (
            <p className="text-sm font-medium text-black">{formatCurrency(subtotal)}</p>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-black/25 hover:text-red-500 transition-colors"
          >
            remover
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Bloco por fase ────────────────────────────────────────────────────────────

interface PhaseBlockProps {
  phase: Phase;
  control: Control<ProposalFormData>;
  customFields: { field: CustomTeamMember & { id: string }; globalIndex: number }[];
  onAddCustom: () => void;
  onRemoveCustom: (globalIndex: number) => void;
}

function PhaseBlock({ phase, control, customFields, onAddCustom, onRemoveCustom }: PhaseBlockProps) {
  const items = TEAM_ITEMS.filter((i) => i.phase === phase);

  return (
    <div className="rounded-sm border border-black/8 p-4">
      <div className="mb-3 flex items-center justify-between border-b border-[#375e40]/30 pb-2">
        <p className="text-sm font-semibold text-black">{PHASE_LABELS[phase]}</p>
        <button
          type="button"
          onClick={onAddCustom}
          className="text-xs text-[#375e40] hover:opacity-70 transition-opacity"
        >
          + Adicionar profissional
        </button>
      </div>
      <div>
        {items.map((item) => (
          <TeamMemberRow
            key={item.id}
            itemId={item.id}
            label={item.label}
            defaultRate={item.ratePerHour}
            phase={phase}
            control={control}
          />
        ))}
        {customFields.map(({ field, globalIndex }) => (
          <CustomMemberRow
            key={field.id}
            index={globalIndex}
            phase={phase}
            control={control}
            onRemove={() => onRemoveCustom(globalIndex)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

export function Team({ control }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "customTeam",
  });

  const phases: Phase[] = ["pre-production", "production", "post-production"];

  return (
    <section>
      <SectionTitle number="4" title="Equipe" />
      <div className="space-y-4">
        {phases.map((phase) => {
          const phaseCustomFields = fields
            .map((field, globalIndex) => ({ field: field as CustomTeamMember & { id: string }, globalIndex }))
            .filter(({ field }) => field.phase === phase);

          return (
            <PhaseBlock
              key={phase}
              phase={phase}
              control={control}
              customFields={phaseCustomFields}
              onAddCustom={() =>
                append({ label: "", phase, ratePerHour: 0, diarias: 0, hoursPerDiaria: 0 })
              }
              onRemoveCustom={(globalIndex) => remove(globalIndex)}
            />
          );
        })}
      </div>
    </section>
  );
}
