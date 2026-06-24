"use client";

import { UseFormRegister } from "react-hook-form";
import { ProposalFormData } from "@/types/proposal";
import { Textarea } from "@/components/ui/Textarea";
import { SectionTitle } from "@/components/ui/SectionTitle";

interface Props {
  register: UseFormRegister<ProposalFormData>;
}

export function AboutProject({ register }: Props) {
  return (
    <section>
      <SectionTitle number="1" title="Sobre o Projeto" />
      <Textarea
        placeholder="Breve panorama sobre o projeto a ser desenvolvido..."
        rows={5}
        {...register("aboutProject")}
      />
    </section>
  );
}
