# Plano de Implementação — Proposta Maker

## Contexto

O time de vendas perde tempo montando propostas comerciais audiovisuais manualmente. O Proposta Maker é um formulário web estruturado que calcula valores automaticamente e gera um PDF pronto para enviar ao cliente.

---

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS (estilização)
- React Hook Form + Zod (formulário e validação)
- @react-pdf/renderer (geração de PDF)
- Dados de preços em arquivo TypeScript editável (sem banco de dados externo na V1)

---

## Milestones

| # | Milestone | Status |
|---|---|---|
| 1 | Setup do projeto Next.js | ✅ Concluído |
| 2 | Tipos e base de dados | ✅ Concluído |
| 3 | Lógica de cálculo | ✅ Concluído |
| 4 | Componentes base de UI | ✅ Concluído |
| 5 | Formulário: Cabeçalho + Sobre o projeto | ✅ Concluído |
| 6 | Formulário: Entregáveis + Processos | ✅ Concluído |
| 7 | Formulário: Equipe (complexo) | ✅ Concluído |
| 8 | Formulário: Itens inclusos + Cronograma + Responsabilidades | ✅ Concluído |
| 9 | Formulário: Logística + Condições Gerais | ✅ Concluído |
| 10 | Seção Investimento | ✅ Concluído |
| 11 | Preview e geração de PDF | ✅ Concluído |
| 12 | Polish, validação e testes | 🔄 Próximo |

---

## Detalhes dos Milestones

### M1 — Setup do projeto ✅
- Next.js 16 com TypeScript e Tailwind instalados
- Estrutura de pastas criada: `src/app`, `src/components/form`, `src/components/ui`, `src/components/proposal`, `src/data`, `src/lib`, `src/types`
- Cores configuradas: texto `#000000`, linhas `#375e40`, fundo `#ffffff`

### M2 — Tipos e base de dados
- `src/types/proposal.ts` — tipos de todos os campos do formulário
- `src/data/items.ts` — profissionais com fases e valores por hora (editável)

### M3 — Lógica de cálculo
- `src/lib/calculations.ts`
- Funções: subtotal por fase, logística, impostos (8%), honorários (25%), total

### M4 — Componentes base de UI
- Checkbox, Input, Textarea, SectionTitle, Table

### M5 — Formulário: Cabeçalho + Sobre o projeto
- Header.tsx, AboutProject.tsx, page.tsx principal

### M6 — Formulário: Entregáveis + Processos
- Deliverables.tsx, Processes.tsx

### M7 — Formulário: Equipe
- Team.tsx — checkbox com campo de horas e cálculo em tempo real por profissional

### M8 — Formulário: Itens + Cronograma + Responsabilidades
- IncludedItems.tsx, Schedule.tsx, ClientResponsibilities.tsx

### M9 — Formulário: Logística + Condições Gerais
- Logistics.tsx (km + alimentação), GeneralConditions.tsx

### M10 — Seção Investimento
- Investment.tsx — resumo financeiro com breakdown por fase + impostos + honorários

### M11 — Preview e geração de PDF
- preview/page.tsx, ProposalDocument.tsx (React-PDF), pdf.ts

### M12 — Polish e testes
- Validação Zod, testes de cálculo, responsividade, refinamento visual

---

## Regras de negócio

### Cálculo do valor final
1. Soma dos itens de Equipe × horas por profissional
2. Subtotais por fase (Pré-produção, Produção, Pós-produção)
3. Impostos: 8% do subtotal total
4. Honorários: 25% do subtotal total
5. **Total = subtotal + impostos + honorários**

### Logística
- Deslocamento: R$/km × km rodados
- Alimentação: R$/profissional × nº profissionais
