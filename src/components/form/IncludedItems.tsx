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

export function IncludedItems({ control }: Props) {
  return (
    <section>
      <SectionTitle number="6" title="Itens Inclusos e Não Inclusos" />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-medium text-black border-b border-black/10 pb-1">Inclusos</p>
          <div className="space-y-2">
            <Controller
              name="includedItems.included"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <>
                  {INCLUDED_ITEMS.map((item) => (
                    <CheckboxItem
                      key={item.id}
                      id={`inc_${item.id}`}
                      label={item.label}
                      checked={field.value.includes(item.id)}
                      onChange={() => field.onChange(toggleValue(field.value, item.id))}
                    />
                  ))}
                </>
              )}
            />
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-black border-b border-black/10 pb-1">Não inclusos</p>
          <div className="space-y-2">
            <Controller
              name="includedItems.excluded"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <>
                  {INCLUDED_ITEMS.map((item) => (
                    <CheckboxItem
                      key={item.id}
                      id={`exc_${item.id}`}
                      label={item.label}
                      checked={field.value.includes(item.id)}
                      onChange={() => field.onChange(toggleValue(field.value, item.id))}
                    />
                  ))}
                </>
              )}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
