"use client";

import { Control, Controller } from "react-hook-form";
import { ProposalFormData } from "@/types/proposal";
import { INCLUDED_ITEMS } from "@/data/items";
import { CheckboxItem } from "@/components/ui/CheckboxItem";
import { SectionTitle } from "@/components/ui/SectionTitle";

interface Props {
  control: Control<ProposalFormData>;
}

function toggleValue(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

interface ColumnProps {
  title: string;
  idPrefix: string;
  fieldName: "includedItems.included" | "includedItems.excluded";
  customFieldName: "includedItems.customIncluded" | "includedItems.customExcluded";
  control: Control<ProposalFormData>;
}

function ItemsColumn({ title, idPrefix, fieldName, customFieldName, control }: ColumnProps) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-black border-b border-black/10 pb-1">{title}</p>
      <div className="space-y-2">
        <Controller
          name={fieldName}
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <>
              {INCLUDED_ITEMS.map((item) => (
                <CheckboxItem
                  key={item.id}
                  id={`${idPrefix}_${item.id}`}
                  label={item.label}
                  checked={field.value.includes(item.id)}
                  onChange={() => field.onChange(toggleValue(field.value, item.id))}
                />
              ))}
            </>
          )}
        />
      </div>

      <Controller
        name={customFieldName}
        control={control}
        defaultValue={[]}
        render={({ field }) => {
          const items = field.value ?? [];
          return (
            <div className="mt-4 space-y-2">
              {items.map((value, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    value={value}
                    onChange={(e) => field.onChange(items.map((v, i) => (i === index ? e.target.value : v)))}
                    placeholder="Item personalizado"
                    className="flex-1 border-b border-dashed border-black/20 bg-transparent py-1 text-sm outline-none focus:border-[#375e40]"
                  />
                  <button
                    type="button"
                    onClick={() => field.onChange(items.filter((_, i) => i !== index))}
                    className="text-xs text-black/25 hover:text-red-500 transition-colors shrink-0"
                  >
                    remover
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => field.onChange([...items, ""])}
                className="text-xs text-[#375e40] hover:opacity-70 transition-opacity"
              >
                + Adicionar item
              </button>
            </div>
          );
        }}
      />
    </div>
  );
}

export function IncludedItems({ control }: Props) {
  return (
    <section>
      <SectionTitle number="6" title="Itens Inclusos e Não Inclusos" />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <ItemsColumn
          title="Inclusos"
          idPrefix="inc"
          fieldName="includedItems.included"
          customFieldName="includedItems.customIncluded"
          control={control}
        />
        <ItemsColumn
          title="Não inclusos"
          idPrefix="exc"
          fieldName="includedItems.excluded"
          customFieldName="includedItems.customExcluded"
          control={control}
        />
      </div>
    </section>
  );
}
