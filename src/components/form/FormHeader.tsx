"use client";

import { UseFormRegister } from "react-hook-form";
import { ProposalFormData } from "@/types/proposal";
import { Input } from "@/components/ui/Input";
import { SectionTitle } from "@/components/ui/SectionTitle";

interface Props {
  register: UseFormRegister<ProposalFormData>;
}

export function FormHeader({ register }: Props) {
  return (
    <section>
      <SectionTitle title="Cabeçalho" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input label="Número do Orçamento" placeholder="Ex: QPS-001" {...register("header.proposalNumber")} />
        <Input label="Cliente" placeholder="Nome do cliente" {...register("header.client")} />
        <Input label="Projeto" placeholder="Nome do projeto" {...register("header.project")} />
        <Input label="Data" type="date" {...register("header.date")} />
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wider text-black/60">Período do projeto</p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              {...register("header.periodStart")}
              className="flex-1 border-b border-black/20 bg-transparent py-2 text-sm outline-none focus:border-[#375e40]"
            />
            <span className="text-xs text-black/40">até</span>
            <input
              type="date"
              {...register("header.periodEnd")}
              className="flex-1 border-b border-black/20 bg-transparent py-2 text-sm outline-none focus:border-[#375e40]"
            />
          </div>
        </div>
        <Input
          label="Contato"
          className="sm:col-span-2"
          defaultValue="contato@quadrosporsegundo.com.br"
          {...register("header.contact")}
        />
      </div>
    </section>
  );
}
