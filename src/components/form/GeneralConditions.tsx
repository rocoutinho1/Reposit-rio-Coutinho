"use client";

import { UseFormRegister, Control, Controller } from "react-hook-form";
import { ProposalFormData } from "@/types/proposal";
import { Input } from "@/components/ui/Input";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { REVISION_OPTIONS } from "@/data/items";

interface Props {
  register: UseFormRegister<ProposalFormData>;
  control: Control<ProposalFormData>;
}

export function GeneralConditions({ register, control }: Props) {
  return (
    <section>
      <SectionTitle number="10" title="Condições Gerais" />
      <div className="space-y-5">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wider text-black/60">Validade do orçamento</p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              {...register("generalConditions.validityStart")}
              className="flex-1 border-b border-black/20 bg-transparent py-2 text-sm outline-none focus:border-[#375e40]"
            />
            <span className="text-xs text-black/40">até</span>
            <input
              type="date"
              {...register("generalConditions.validityEnd")}
              className="flex-1 border-b border-black/20 bg-transparent py-2 text-sm outline-none focus:border-[#375e40]"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wider text-black/60">Forma de pagamento</p>
          <textarea
            placeholder="Ex: 50% na assinatura, 50% na entrega"
            rows={3}
            {...register("generalConditions.paymentMethod")}
            className="w-full resize-none border-b border-black/20 bg-transparent py-2 text-sm outline-none focus:border-[#375e40]"
          />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-black/60">Rodadas de alteração</p>
          <div className="flex flex-col gap-2">
            <Controller
              name="generalConditions.revisions"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <>
                  {REVISION_OPTIONS.map((opt) => (
                    <label key={opt.id} className="flex cursor-pointer items-center gap-3 group">
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          field.value === opt.id
                            ? "border-[#375e40] bg-[#375e40]"
                            : "border-black/30 group-hover:border-[#375e40]"
                        }`}
                      >
                        {field.value === opt.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                      <input
                        type="radio"
                        value={opt.id}
                        checked={field.value === opt.id}
                        onChange={() => field.onChange(opt.id)}
                        className="sr-only"
                      />
                      <span className="text-sm text-black">{opt.label}</span>
                    </label>
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
