"use client";

import { Control, useWatch, Controller, useFieldArray } from "react-hook-form";
import { ProposalFormData } from "@/types/proposal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { calcularInvestimento, formatCurrency } from "@/lib/calculations";

interface Props {
  control: Control<ProposalFormData>;
}

function PartValues({ control, nestIndex, removeItem }: {
  control: Control<ProposalFormData>;
  nestIndex: number;
  removeItem: () => void;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `customInvestmentItems.${nestIndex}.values`,
  });

  return (
    <div className="rounded-sm border border-black/10 overflow-hidden mb-3 last:mb-0">
      <div className="flex items-center gap-3 bg-black/3 px-4 py-2.5">
        <Controller
          name={`customInvestmentItems.${nestIndex}.name`}
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Nome do projeto ou parte"
              className="flex-1 bg-transparent text-sm font-medium outline-none"
            />
          )}
        />
        <Controller
          name={`customInvestmentItems.${nestIndex}.directValue`}
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-1 border-b border-black/20 focus-within:border-[#375e40]">
              <span className="text-xs text-black/40 shrink-0">R$</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={field.value || ""}
                onChange={(e) => field.onChange(Number(e.target.value))}
                placeholder="0,00"
                className="w-24 bg-transparent py-1 text-sm outline-none text-right"
              />
            </div>
          )}
        />
        <button
          type="button"
          onClick={removeItem}
          className="text-black/25 hover:text-red-500 transition-colors text-base leading-none shrink-0"
        >
          ×
        </button>
      </div>

      {fields.length > 0 && (
        <div className="px-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-3 py-2 border-b border-black/6 last:border-0">
              <Controller
                name={`customInvestmentItems.${nestIndex}.values.${index}.label`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder="Descrição"
                    className="flex-1 bg-transparent text-sm outline-none border-b border-black/20 focus:border-[#375e40] py-1"
                  />
                )}
              />
              <Controller
                name={`customInvestmentItems.${nestIndex}.values.${index}.amount`}
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-1 border-b border-black/20 focus-within:border-[#375e40]">
                    <span className="text-xs text-black/40 shrink-0">R$</span>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="0,00"
                      className="w-28 bg-transparent py-1 text-sm outline-none text-right"
                    />
                  </div>
                )}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-black/25 hover:text-red-500 transition-colors text-base leading-none shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 py-2">
        <button
          type="button"
          onClick={() => append({ label: "", amount: 0 })}
          className="text-xs text-[#375e40] hover:opacity-70 transition-opacity"
        >
          + Adicionar valor
        </button>
      </div>
    </div>
  );
}

interface LineProps {
  label: string;
  value: number;
  dimmed?: boolean;
  bold?: boolean;
  large?: boolean;
}

function Line({ label, value, dimmed, bold, large }: LineProps) {
  return (
    <div
      className={`flex items-center justify-between py-2 border-b border-black/6 last:border-0 ${
        large ? "py-3" : ""
      }`}
    >
      <span className={`text-sm ${dimmed ? "text-black/50" : "text-black"} ${bold ? "font-semibold" : ""}`}>
        {label}
      </span>
      <span
        className={`${large ? "text-xl" : "text-sm"} ${bold ? "font-bold" : "font-medium"} text-black ${
          dimmed ? "opacity-60" : ""
        }`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

export function Investment({ control }: Props) {
  const team = useWatch({ control, name: "team" }) || {};
  const customTeam = useWatch({ control, name: "customTeam" }) || [];
  const logistics = useWatch({ control, name: "logistics" }) || {
    displacement: { enabled: false, ratePerKm: 0, kilometers: 0 },
    meals: { enabled: false, ratePerPerson: 0, people: 0 },
  };
  const equipment = useWatch({ control, name: "equipment" }) || [];
  const feesRate = useWatch({ control, name: "feesRate" }) ?? 25;
  const discountRate = useWatch({ control, name: "discountRate" }) ?? 0;
  const rawFootageValue = useWatch({ control, name: "deliverables.rawFootageValue" }) ?? 0;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "customInvestmentItems",
  });

  const summary = calcularInvestimento(team, logistics, equipment, feesRate, customTeam, rawFootageValue);

  return (
    <section>
      <SectionTitle number="11" title="Investimento" />
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium uppercase tracking-wider text-black/60 whitespace-nowrap">
            Honorários (%)
          </label>
          <Controller
            name="feesRate"
            control={control}
            defaultValue={25}
            render={({ field }) => (
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={field.value ?? 25}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="w-20 border-b border-black/20 bg-transparent py-1 text-sm outline-none focus:border-[#375e40] text-center"
              />
            )}
          />
          <span className="text-xs text-black/40">% sobre o subtotal</span>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-medium uppercase tracking-wider text-black/60 whitespace-nowrap">
            Desconto (%)
          </label>
          <Controller
            name="discountRate"
            control={control}
            defaultValue={0}
            render={({ field }) => (
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={field.value ?? 0}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="w-20 border-b border-black/20 bg-transparent py-1 text-sm outline-none focus:border-[#375e40] text-center"
              />
            )}
          />
          <span className="text-xs text-black/40">% sobre o valor total</span>
        </div>

        <div className="rounded-sm border border-black/10 overflow-hidden">
          <div className="bg-black/2 px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-black/40">Detalhamento por fase</p>
          </div>
          <div className="px-5">
            <Line label="Pré-produção" value={summary.preProduction} />
            <Line label="Produção" value={summary.production} />
            <Line label="Pós-produção" value={summary.postProduction} />
            {summary.equipment > 0 && <Line label="Equipamentos" value={summary.equipment} />}
            {summary.logistics > 0 && <Line label="Logística" value={summary.logistics} />}
          </div>

          <div className="border-t border-[#375e40]/30 bg-black/2 px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-black/40">Encargos</p>
          </div>
          <div className="px-5">
            <Line label={`Honorários (${feesRate ?? 25}%)`} value={summary.fees} dimmed />
            <Line label={`Impostos (8%)`} value={summary.taxes} dimmed />
          </div>

          <div className="border-t-2 border-[#375e40] bg-black/2 px-5 py-4">
            <Line label="Valor Total" value={summary.total} bold large />
          </div>

          {discountRate > 0 && (() => {
            const discountAmount = summary.total * (discountRate / 100);
            const discountedTotal = summary.total - discountAmount;
            return (
              <div className="border-t border-black/10 px-5 py-4 space-y-1">
                <Line label={`Desconto (${discountRate}%)`} value={-discountAmount} dimmed />
                <Line label="Valor com Desconto" value={discountedTotal} bold large />
              </div>
            );
          })()}
        </div>

        {/* Divisão por projetos */}
        <div className="rounded-sm border border-black/10 overflow-hidden">
          <div className="bg-black/2 px-5 py-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-black/40">Divisão por Projetos</p>
            <button
              type="button"
              onClick={() => append({ name: "", directValue: 0, values: [] })}
              className="text-xs font-medium text-[#375e40] hover:opacity-70 transition-opacity"
            >
              + Adicionar parte
            </button>
          </div>

          {fields.length === 0 ? (
            <div className="px-5 py-4">
              <p className="text-xs text-black/30 text-center">
                Clique em &quot;+ Adicionar parte&quot; para dividir o valor total entre projetos diferentes
              </p>
            </div>
          ) : (
            <div className="px-5 py-3">
              {fields.map((field, index) => (
                <PartValues
                  key={field.id}
                  control={control}
                  nestIndex={index}
                  removeItem={() => remove(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
