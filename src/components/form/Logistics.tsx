"use client";

import { Control, Controller, useWatch } from "react-hook-form";
import { ProposalFormData } from "@/types/proposal";
import { CheckboxItem } from "@/components/ui/CheckboxItem";
import { Input } from "@/components/ui/Input";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatCurrency } from "@/lib/calculations";

interface Props {
  control: Control<ProposalFormData>;
}

export function Logistics({ control }: Props) {
  const displacementEnabled = useWatch({ control, name: "logistics.displacement.enabled" });
  const mealsEnabled = useWatch({ control, name: "logistics.meals.enabled" });
  const studioEnabled = useWatch({ control, name: "logistics.studio.enabled" });
  const ratePerKm = useWatch({ control, name: "logistics.displacement.ratePerKm" }) || 0;
  const kilometers = useWatch({ control, name: "logistics.displacement.kilometers" }) || 0;
  const displacementCustomValue = useWatch({ control, name: "logistics.displacement.customValue" }) || 0;
  const ratePerPerson = useWatch({ control, name: "logistics.meals.ratePerPerson" }) || 0;
  const people = useWatch({ control, name: "logistics.meals.people" }) || 0;
  const studioValue = useWatch({ control, name: "logistics.studio.value" }) || 0;

  return (
    <section>
      <SectionTitle number="9" title="Logística" />
      <div className="space-y-6">

        <div className="rounded-sm border border-black/8 p-4">
          <Controller
            name="logistics.displacement.enabled"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <CheckboxItem
                id="logistics_displacement"
                label="Deslocamento"
                checked={!!field.value}
                onChange={field.onChange}
              />
            )}
          />
          {displacementEnabled && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Controller
                name="logistics.displacement.ratePerKm"
                control={control}
                defaultValue={0}
                render={({ field }) => (
                  <Input
                    label="Valor por km (R$)"
                    type="number"
                    min={0}
                    step={0.01}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              <Controller
                name="logistics.displacement.kilometers"
                control={control}
                defaultValue={0}
                render={({ field }) => (
                  <Input
                    label="Quilômetros rodados"
                    type="number"
                    min={0}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              <Controller
                name="logistics.displacement.customValue"
                control={control}
                defaultValue={0}
                render={({ field }) => (
                  <Input
                    label="Valor personalizado (R$)"
                    type="number"
                    min={0}
                    step={0.01}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              <div className="col-span-2 text-right">
                <p className="text-sm text-black/50">Subtotal deslocamento:</p>
                <p className="text-base font-semibold text-black">{formatCurrency(ratePerKm * kilometers + displacementCustomValue)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-sm border border-black/8 p-4">
          <Controller
            name="logistics.meals.enabled"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <CheckboxItem
                id="logistics_meals"
                label="Alimentação"
                checked={!!field.value}
                onChange={field.onChange}
              />
            )}
          />
          {mealsEnabled && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Controller
                name="logistics.meals.ratePerPerson"
                control={control}
                defaultValue={0}
                render={({ field }) => (
                  <Input
                    label="Valor por profissional (R$)"
                    type="number"
                    min={0}
                    step={0.01}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              <Controller
                name="logistics.meals.people"
                control={control}
                defaultValue={0}
                render={({ field }) => (
                  <Input
                    label="Número de profissionais"
                    type="number"
                    min={0}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              <div className="col-span-2 text-right">
                <p className="text-sm text-black/50">Subtotal alimentação:</p>
                <p className="text-base font-semibold text-black">{formatCurrency(ratePerPerson * people)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-sm border border-black/8 p-4">
          <Controller
            name="logistics.studio.enabled"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <CheckboxItem
                id="logistics_studio"
                label="Estúdio de gravação"
                checked={!!field.value}
                onChange={field.onChange}
              />
            )}
          />
          {studioEnabled && (
            <div className="mt-4">
              <Controller
                name="logistics.studio.value"
                control={control}
                defaultValue={0}
                render={({ field }) => (
                  <Input
                    label="Valor do estúdio (R$)"
                    type="number"
                    min={0}
                    step={0.01}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              <div className="mt-2 text-right">
                <p className="text-sm text-black/50">Subtotal estúdio:</p>
                <p className="text-base font-semibold text-black">{formatCurrency(studioValue)}</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
