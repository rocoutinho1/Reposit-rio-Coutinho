"use client";

import { UseFormRegister } from "react-hook-form";
import { ProposalFormData } from "@/types/proposal";
import { Textarea } from "@/components/ui/Textarea";
import { SectionTitle } from "@/components/ui/SectionTitle";

interface Props {
  register: UseFormRegister<ProposalFormData>;
}

export function Schedule({ register }: Props) {
  return (
    <section>
      <SectionTitle number="7" title="Cronograma" />
      <Textarea
        label="Observações de cronograma"
        placeholder="Insira as datas e etapas previstas do projeto..."
        rows={3}
        {...register("schedule")}
      />
    </section>
  );
}
