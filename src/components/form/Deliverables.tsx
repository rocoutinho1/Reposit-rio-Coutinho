"use client";

import { Control, Controller, useFieldArray, useWatch } from "react-hook-form";
import { ProposalFormData } from "@/types/proposal";
import { VIDEO_NAMES, VIDEO_FORMATS, VIDEO_DURATIONS } from "@/data/items";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Input } from "@/components/ui/Input";

interface Props {
  control: Control<ProposalFormData>;
}

export function Deliverables({ control }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "deliverables.video.groups",
  });

  return (
    <section>
      <SectionTitle number="2" title="Entregáveis" />
      <div className="space-y-6">

        {/* Vídeos */}
        <div>
          <p className="mb-3 text-sm font-medium text-black">Vídeos</p>
          <div className="rounded-sm border border-black/8 p-4 space-y-4">
            {fields.length > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-[64px_1fr_1fr_1fr_24px] gap-3">
                  <p className="text-xs font-medium text-black/40">Qtd</p>
                  <p className="text-xs font-medium text-black/40">Categoria</p>
                  <p className="text-xs font-medium text-black/40">Formato</p>
                  <p className="text-xs font-medium text-black/40">Duração</p>
                  <span />
                </div>
                {fields.map((field, i) => (
                  <VideoGroupRow key={field.id} index={i} control={control} onRemove={() => remove(i)} />
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => append({ quantity: 1, name: "", customName: "", format: "", duration: "" })}
              className="text-sm text-[#375e40] hover:underline underline-offset-2"
            >
              + Adicionar tipo de vídeo
            </button>
          </div>
        </div>

        {/* Material Bruto */}
        <div className="rounded-sm border border-black/8 p-4">
          <p className="mb-3 text-sm font-medium text-black">Material Bruto</p>
          <div className="flex flex-wrap gap-4">
            <Controller
              name="deliverables.rawFootageQuantity"
              control={control}
              defaultValue={0}
              render={({ field }) => (
                <Input
                  label="Quantidade de vídeos brutos"
                  type="number"
                  min={0}
                  className="max-w-[220px]"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            <Controller
              name="deliverables.rawFootageValue"
              control={control}
              defaultValue={0}
              render={({ field }) => (
                <Input
                  label="Valor do material bruto (R$)"
                  type="number"
                  min={0}
                  step={0.01}
                  className="max-w-[220px]"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </div>
        </div>

        {/* Fotos */}
        <div>
          <p className="mb-3 text-sm font-medium text-black">Fotos</p>
          <div className="rounded-sm border border-black/8 p-4">
            <Controller
              name="deliverables.photoQuantity"
              control={control}
              defaultValue={0}
              render={({ field }) => (
                <Input
                  label="Quantidade de fotos"
                  type="number"
                  min={0}
                  className="max-w-[180px]"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </div>
        </div>

      </div>
    </section>
  );
}

function VideoGroupRow({
  index,
  control,
  onRemove,
}: {
  index: number;
  control: Control<ProposalFormData>;
  onRemove: () => void;
}) {
  const name = useWatch({
    control,
    name: `deliverables.video.groups.${index}.name` as never,
  }) as string || "";

  const duration = useWatch({
    control,
    name: `deliverables.video.groups.${index}.duration` as never,
  }) as string || "";

  const selectClass =
    "w-full border-b border-black/20 bg-transparent py-1.5 text-sm outline-none focus:border-[#375e40]";

  return (
    <div className="grid grid-cols-[64px_1fr_1fr_1fr_24px] gap-3 items-start">
      {/* Quantidade */}
      <Controller
        name={`deliverables.video.groups.${index}.quantity` as never}
        control={control}
        defaultValue={1 as never}
        render={({ field }) => (
          <input
            type="number"
            min={1}
            value={(field.value as number) || ""}
            onChange={(e) => field.onChange(Number(e.target.value))}
            className="w-full border-b border-black/20 bg-transparent py-1.5 text-sm outline-none focus:border-[#375e40] text-center"
          />
        )}
      />

      {/* Categoria */}
      <div>
        <Controller
          name={`deliverables.video.groups.${index}.name` as never}
          control={control}
          defaultValue={"" as never}
          render={({ field }) => (
            <select
              value={field.value as string}
              onChange={(e) => field.onChange(e.target.value)}
              className={selectClass}
            >
              <option value="">Selecione</option>
              {VIDEO_NAMES.map((n) => (
                <option key={n.id} value={n.id}>{n.label}</option>
              ))}
            </select>
          )}
        />
        {name === "outro" && (
          <Controller
            name={`deliverables.video.groups.${index}.customName` as never}
            control={control}
            defaultValue={"" as never}
            render={({ field }) => (
              <input
                type="text"
                placeholder="Nome personalizado"
                value={field.value as string}
                onChange={(e) => field.onChange(e.target.value)}
                className="mt-1.5 w-full border-b border-black/20 bg-transparent py-1.5 text-sm outline-none focus:border-[#375e40]"
              />
            )}
          />
        )}
      </div>

      {/* Formato */}
      <Controller
        name={`deliverables.video.groups.${index}.format` as never}
        control={control}
        defaultValue={"" as never}
        render={({ field }) => (
          <select
            value={field.value as string}
            onChange={(e) => field.onChange(e.target.value)}
            className={selectClass}
          >
            <option value="">Selecione</option>
            {VIDEO_FORMATS.map((fmt) => (
              <option key={fmt.id} value={fmt.id}>{fmt.label}</option>
            ))}
          </select>
        )}
      />

      {/* Duração */}
      <div>
        <Controller
          name={`deliverables.video.groups.${index}.duration` as never}
          control={control}
          defaultValue={"" as never}
          render={({ field }) => (
            <select
              value={field.value as string}
              onChange={(e) => field.onChange(e.target.value)}
              className={selectClass}
            >
              <option value="">Selecione</option>
              {VIDEO_DURATIONS.map((dur) => (
                <option key={dur.id} value={dur.id}>{dur.label}</option>
              ))}
              <option value="custom">Personalizado</option>
            </select>
          )}
        />
        {duration === "custom" && (
          <Controller
            name={`deliverables.video.groups.${index}.customDuration` as never}
            control={control}
            defaultValue={"" as never}
            render={({ field }) => (
              <input
                type="text"
                placeholder="Ex: 2 min 30s"
                value={field.value as string}
                onChange={(e) => field.onChange(e.target.value)}
                className="mt-1.5 w-full border-b border-black/20 bg-transparent py-1.5 text-sm outline-none focus:border-[#375e40]"
              />
            )}
          />
        )}
      </div>

      {/* Remover */}
      <button
        type="button"
        onClick={onRemove}
        className="mt-1.5 text-black/30 hover:text-red-500 transition-colors text-lg leading-none"
        title="Remover"
      >
        ×
      </button>
    </div>
  );
}
