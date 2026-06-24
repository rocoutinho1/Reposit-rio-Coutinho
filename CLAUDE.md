# CLAUDE.md — Proposta Maker

## O que é este projeto

O **Proposta Maker** é uma aplicação web que substitui o processo manual de criação de propostas comerciais audiovisuais. O profissional de vendas preenche um formulário estruturado, o sistema calcula os valores automaticamente e gera um PDF pronto para enviar ao cliente.

---

## Stack técnica

- **Next.js** — framework principal para a aplicação web (frontend + backend juntos)
- **TypeScript** — JavaScript com tipagem, evita erros em tempo de desenvolvimento
- **Node.js** — ambiente de execução do servidor
- **Tailwind CSS** — estilização rápida e consistente
- **React Hook Form** — gerenciamento do formulário
- **Zod** — validação de dados dos formulários
- **React PDF / @react-pdf/renderer** — geração do PDF no navegador
- **JSON local / arquivo de configuração** — base de dados de itens e valores (editável)

---

## Estrutura de pastas (padrão a seguir)

```
proposta-maker/
├── src/
│   ├── app/                  # Rotas do Next.js (App Router)
│   │   ├── page.tsx          # Página principal (formulário)
│   │   ├── preview/          # Página de preview da proposta
│   │   └── api/              # Endpoints de API (geração de PDF, etc.)
│   ├── components/           # Componentes reutilizáveis de UI
│   │   ├── form/             # Seções do formulário
│   │   ├── proposal/         # Componentes da proposta (preview + PDF)
│   │   └── ui/               # Elementos básicos (botão, input, checkbox)
│   ├── data/                 # Base de dados de itens e valores
│   │   └── items.ts          # Itens de equipe com preços por hora
│   ├── lib/                  # Lógica de negócio
│   │   ├── calculations.ts   # Cálculo de valores (etapas, impostos, honorários)
│   │   └── pdf.ts            # Geração do PDF
│   └── types/                # Tipos TypeScript do projeto
│       └── proposal.ts       # Tipos da proposta comercial
├── public/                   # Arquivos estáticos (logo, etc.)
├── CLAUDE.md
└── plan.md
```

---

## Design Language

- **Visual:** Clean e minimalista — foco em produtividade
- **Cor do texto:** `#000000` (preto puro)
- **Cor das linhas divisórias:** `#375e40` (verde escuro)
- **Fundo:** `#ffffff` (branco)
- **Tipografia:** Sem serifa (sans-serif), hierarquia clara com tamanhos distintos
- **Tabelas:** Usadas para separar itens dentro de cada seção do formulário

---

## Regras de negócio — NUNCA ignorar

### Cálculo do valor final (seção Investimento)
1. Soma dos itens selecionados em **Equipe** × número de horas de cada um
2. Subtotal por fase: Pré-produção, Produção, Pós-produção
3. **Impostos:** 8% sobre o subtotal total
4. **Honorários:** 25% sobre o subtotal total
5. **Valor total = subtotal + impostos + honorários**

### Logística
- **Deslocamento:** valor por km × quantidade de km
- **Alimentação:** valor por profissional × número de profissionais

### Base de dados de equipe (src/data/items.ts)
Deve ser um arquivo editável com a lista de profissionais e seus valores por hora. Novos itens podem ser adicionados sem alterar o código principal.

#### Valores atuais:
**Pré-produção**
| Profissional | R$/hora |
|---|---|
| Diretor | 250 |
| Roteirista | 160 |
| Narrador | 60 |
| Assistente de produção | 50 |
| Diretor de fotografia | 200 |
| Diretor de arte | 200 |
| Figurinista | 125 |
| Maquiador | 150 |
| Produtor | 125 |

**Produção**
| Profissional | R$/hora |
|---|---|
| Diretor de Cena | 250 |
| Diretor de Fotografia | 200 |
| Operador de Câmera | 130 |
| Cinegrafista | 180 |
| Operador de Som Direto | 150 |
| Operador de Drone | 450 |
| Assistente | 50 |
| Fotógrafo | 150 |

**Pós-produção**
| Profissional | R$/hora |
|---|---|
| Editor de vídeo | 60 |
| Colorista | 70 |
| Motion designer | 110 |
| Editor Sameday | 120 |

---

## Seções do formulário (em ordem)

1. **Cabeçalho** — Cliente/Projeto, Data, Período, Contato (campos de texto)
2. **Sobre o projeto** — Texto livre descritivo
3. **Entregáveis** — Checkboxes: Vídeos (formato + duração) e Foto
4. **Processos** — Checkboxes: Pré-produção, Produção, Pós-produção
5. **Equipe** — Checkboxes com valor/hora e campo de quantidade de horas
6. **Itens inclusos e não inclusos** — Checkboxes de serviços
7. **Cronograma** — Texto fixo + campo editável de datas
8. **Responsabilidade do cliente** — Campo de texto editável
9. **Logística** — Deslocamento (km) e Alimentação (profissionais)
10. **Condições gerais** — Validade, forma de pagamento, rodadas de alteração
11. **Investimento** — Resumo calculado automaticamente com breakdown por fase

---

## Comportamentos esperados do formulário

- Ao marcar um checkbox de **Equipe**, exibe campo de horas ao lado
- Cálculo do valor total atualiza em tempo real conforme o usuário preenche
- O PDF gerado segue o mesmo layout visual da proposta exibida na tela
- Todos os campos de texto devem ser editáveis diretamente no formulário

---

## Padrões de código

- Todo o código em **TypeScript** — sem `any` sem motivo
- Componentes pequenos e focados — um componente = uma responsabilidade
- Lógica de cálculo isolada em `src/lib/calculations.ts`
- Dados de configuração (preços) isolados em `src/data/items.ts`
- Sem comentários óbvios — só comentar quando o "porquê" não é evidente
- Comunicação e nomes de variáveis: inglês (padrão de código); UI e textos: português
