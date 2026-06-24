"use client";

import { Control, useFieldArray, useWatch } from "react-hook-form";
import { ProposalFormData } from "@/types/proposal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatCurrency } from "@/lib/calculations";

interface Props {
  control: Control<ProposalFormData>;
}

function EquipmentRow({
  index,
  control,
  onRemove,
}: {
  index: number;
  control: Control<ProposalFormData>;
  onRemove: () => void;
}) {
  const qty = useWatch({ control, name: `equipment.${index}.quantity` as never }) as number || 0;
  const price = useWatch({ control, name: `equipment.${index}.unitPrice` as never }) as number || 0;
  const subtotal = qty * price;

  return (
    <tr className="border-b border-black/5">
      <td className="py-2 px-3">
        <input
          {...(control.register(`equipment.${index}.name` as never))}
          placeholder="Nome do equipamento"
          className="w-full border-b border-black/20 bg-transparent py-1 text-sm outline-none focus:border-[#375e40]"
        />
      </td>
      <td className="py-2 px-3 w-20">
        <input
          type="number"
          min={0}
          {...(control.register(`equipment.${index}.quantity` as never, { valueAsNumber: true }))}
          placeholder="0"
          className="w-full border-b border-black/20 bg-transparent py-1 text-sm outline-none focus:border-[#375e40] text-center"
        />
      </td>
      <td className="py-2 px-3 w-36">
        <input
          type="number"
          min={0}
          step={0.01}
          {...(control.register(`equipment.${index}.unitPrice` as never, { valueAsNumber: true }))}
          placeholder="0,00"
          className="w-full border-b border-black/20 bg-transparent py-1 text-sm outline-none focus:border-[#375e40] text-right"
        />
      </td>
      <td className="py-2 px-3 text-right text-sm font-medium text-black w-28">
        {subtotal > 0 ? formatCurrency(subtotal) : "—"}
      </td>
      <td className="py-2 px-3 w-8">
        <button
          type="button"
          onClick={onRemove}
          className="text-black/30 hover:text-black transition-colors text-lg leading-none"
          title="Remover"
        >
          ×
        </button>
      </td>
    </tr>
  );
}

export function Equipment({ control }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "equipment",
  });

  const items = useWatch({ control, name: "equipment" }) || [];
  const total = (items as { quantity?: number; unitPrice?: number }[]).reduce(
    (sum, item) => sum + (item?.quantity || 0) * (item?.unitPrice || 0),
    0
  );

  return (
    <section>
      <SectionTitle number="5" title="Equipamentos" />
      <div className="space-y-3">
        {fields.length > 0 && (
          <div className="rounded-sm border border-black/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#375e40]/30 bg-black/2">
                  <th className="text-left py-2 px-3 font-medium text-black/60 text-xs">Equipamento</th>
                  <th className="text-center py-2 px-3 font-medium text-black/60 text-xs">Qtd</th>
                  <th className="text-right py-2 px-3 font-medium text-black/60 text-xs">Valor unit. (R$)</th>
                  <th className="text-right py-2 px-3 font-medium text-black/60 text-xs">Subtotal</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <EquipmentRow
                    key={field.id}
                    index={index}
                    control={control}
                    onRemove={() => remove(index)}
                  />
                ))}
              </tbody>
              {total > 0 && (
                <tfoot>
                  <tr className="border-t border-[#375e40]/30 bg-black/2">
                    <td colSpan={3} className="py-2 px-3 text-xs font-semibold uppercase tracking-wide text-black/40">
                      Total Equipamentos
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-black">{formatCurrency(total)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
        <button
          type="button"
          onClick={() => append({ id: crypto.randomUUID(), name: "", quantity: 1, unitPrice: 0 })}
          className="text-sm border border-black/20 px-4 py-2 hover:bg-black/5 transition-colors"
        >
          + Adicionar equipamento
        </button>
      </div>
    </section>
  );
}
