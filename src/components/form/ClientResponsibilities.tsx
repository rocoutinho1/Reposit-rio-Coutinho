"use client";

import { UseFormRegister } from "react-hook-form";
import { ProposalFormData } from "@/types/proposal";
import { Textarea } from "@/components/ui/Textarea";
import { SectionTitle } from "@/components/ui/SectionTitle";

interface Props {
  register: UseFormRegister<ProposalFormData>;
}

export function ClientResponsibilities({ register }: Props) {
  return (
    <section>
      <SectionTitle number="8" title="Responsabilidade do Cliente" />
      <Textarea
        placeholder="Descreva as responsabilidades do cliente no projeto..."
        rows={4}
        {...register("clientResponsibilities")}
      />
    </section>
  );
}
