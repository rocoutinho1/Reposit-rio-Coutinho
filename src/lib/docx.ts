import { ProposalFormData } from "@/types/proposal";
import { TEAM_ITEMS, PHASE_LABELS, Phase, VIDEO_NAMES, VIDEO_FORMATS, VIDEO_DURATIONS, INCLUDED_ITEMS, REVISION_OPTIONS, PRE_PRODUCTION_PROCESSES, PRODUCTION_PROCESSES, POST_PRODUCTION_PROCESSES } from "@/data/items";
import { calcularInvestimento, calcularFase, formatCurrency } from "@/lib/calculations";
import { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, BorderStyle, AlignmentType, TextRun, WidthType } from "docx";
import { saveAs } from "file-saver";

const GREEN = "2fb34b";
const GRAY_TEXT = "666666";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateRange(start: string, end: string): string {
  if (!start && !end) return "";
  if (!end) return formatDate(start);
  return `${formatDate(start)} até ${formatDate(end)}`;
}

function getTodayFormatted(): string {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${today.getFullYear()}`;
}

function calcularDiasValidade(start: string, end: string): string {
  if (!start || !end) return "—";
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "—";
  return `${diff} dias`;
}

function resolveVideoName(name: string, customName?: string): string {
  if (!name) return "—";
  if (name === "outro") return customName || "Outro";
  return VIDEO_NAMES.find((n) => n.id === name)?.label || name;
}

function createSectionHeading(number: string | number | undefined, title: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${number ? number + ". " : ""}${title}`,
        color: GREEN,
        bold: true,
        size: 24,
      }),
    ],
    spacing: { before: 240, after: 120 },
    border: {
      bottom: {
        color: GREEN,
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
  });
}

function createRowTable(label: string, value: string): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        height: { value: 240, rule: "atLeast" },
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: label,
                    size: 20,
                    bold: true,
                    color: GRAY_TEXT,
                  }),
                ],
              }),
            ],
            borders: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "DDDDDD" },
            },
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: value, size: 22 })],
              }),
            ],
            borders: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "DDDDDD" },
            },
          }),
        ],
      }),
    ],
  });
}

export async function gerarDocx(data: ProposalFormData): Promise<void> {
  const {
    header,
    aboutProject,
    deliverables,
    processes,
    team,
    equipment,
    includedItems,
    schedule,
    clientResponsibilities,
    logistics,
    generalConditions,
    feesRate,
  } = data;

  const feesPct = feesRate ?? 25;
  const summary = calcularInvestimento(team || {}, logistics, equipment || [], feesPct);
  const phases: Phase[] = ["pre-production", "production", "post-production"];

  const labelFor = (arr: readonly { id: string; label: string }[], ids: string[]) =>
    arr.filter((i) => ids.includes(i.id)).map((i) => i.label);

  const formatLabel = (id: string) => VIDEO_FORMATS.find((f) => f.id === id)?.label || id;
  const durationLabel = (id: string) => VIDEO_DURATIONS.find((d) => d.id === id)?.label || id;

  const validityDays = calcularDiasValidade(generalConditions.validityStart, generalConditions.validityEnd);
  const todayFormatted = getTodayFormatted();

  const hasEquipment = (equipment || []).length > 0;
  const hasIncluded = includedItems.included.length > 0 || includedItems.excluded.length > 0;
  const hasLogistics = logistics.displacement.enabled || logistics.meals.enabled || logistics.studio?.enabled;
  const hasConditions = !!(generalConditions.validityStart || generalConditions.paymentMethod || generalConditions.revisions);

  // Dynamic section numbering
  const sectionNums = (() => {
    const sections: [string, boolean][] = [
      ["about", !!aboutProject],
      ["deliverables", true],
      ["processes", true],
      ["team", true],
      ["equipment", hasEquipment],
      ["included", hasIncluded],
      ["schedule", !!schedule],
      ["responsibilities", !!clientResponsibilities],
      ["logistics", hasLogistics],
      ["conditions", hasConditions],
      ["investment", true],
    ];
    const nums: Record<string, number> = {};
    let n = 1;
    for (const [key, visible] of sections) {
      if (visible) nums[key] = n++;
    }
    return nums;
  })();

  const sections: (Paragraph | Table)[] = [];

  // Cover
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: "PROPOSTA DE", bold: true, size: 80 })],
      spacing: { after: 0 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "PRODUÇÃO", bold: true, size: 80 })],
      spacing: { after: 240 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Transformamos visão em realidade através de quadros por segundo. Uma solução técnica e criativa sob medida para o seu projeto.", color: GRAY_TEXT })],
      spacing: { after: 240 },
    })
  );

  // Header info
  sections.push(createRowTable("Cliente", header.client));
  sections.push(createRowTable("Projeto", header.project));
  sections.push(createRowTable("Data", formatDate(header.date)));
  sections.push(createRowTable("Período", formatDateRange(header.periodStart, header.periodEnd)));
  sections.push(createRowTable("Contato", header.contact));

  // 1. About project
  if (!!aboutProject) {
    sections.push(createSectionHeading(sectionNums.about, "Sobre o Projeto"));
    sections.push(new Paragraph({ text: aboutProject, spacing: { after: 240 } }));
  }

  // 2. Deliverables
  sections.push(createSectionHeading(sectionNums.deliverables, "Entregáveis"));
  const videoGroups = deliverables.video.groups || [];
  const totalVideos = videoGroups.reduce((s, g) => s + (g.quantity || 0), 0);
  if (totalVideos > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Vídeos (${totalVideos} vídeo${totalVideos > 1 ? "s" : ""})`,
            bold: true,
            size: 20,
            color: GRAY_TEXT,
          }),
        ],
        spacing: { after: 120 },
      })
    );
    for (const g of videoGroups) {
      const tags = [];
      if (g.name) tags.push(resolveVideoName(g.name, g.customName));
      if (g.format) tags.push(formatLabel(g.format));
      if (g.duration) tags.push(durationLabel(g.duration));
      sections.push(new Paragraph({ text: `${g.quantity}× ${tags.join(" • ")}`, spacing: { after: 120 } }));
    }
  }
  if ((deliverables.photoQuantity ?? 0) > 0) {
    sections.push(new Paragraph({ text: `Fotos — ${deliverables.photoQuantity} fotos`, spacing: { after: 240 } }));
  }

  // 3. Processes
  sections.push(createSectionHeading(sectionNums.processes, "Processos"));
  if (processes.preProduction.length > 0) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "Pré-produção", bold: true, size: 20, color: GRAY_TEXT })],
      })
    );
    sections.push(
      new Paragraph({
        text: labelFor(PRE_PRODUCTION_PROCESSES, processes.preProduction).join(" • "),
        spacing: { after: 120 },
      })
    );
  }
  if (processes.production.length > 0) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "Produção", bold: true, size: 20, color: GRAY_TEXT })],
      })
    );
    sections.push(
      new Paragraph({
        text: labelFor(PRODUCTION_PROCESSES, processes.production).join(" • "),
        spacing: { after: 120 },
      })
    );
  }
  if (processes.postProduction.length > 0) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "Pós-produção", bold: true, size: 20, color: GRAY_TEXT })],
      })
    );
    sections.push(
      new Paragraph({
        text: labelFor(POST_PRODUCTION_PROCESSES, processes.postProduction).join(" • "),
        spacing: { after: 240 },
      })
    );
  }

  // 4. Team
  sections.push(createSectionHeading(sectionNums.team, "Equipe"));
  for (const phase of phases) {
    const items = TEAM_ITEMS.filter((i) => i.phase === phase && team?.[i.id]?.selected);
    if (!items.length) continue;
    const phaseTotal = calcularFase(team || {}, phase);

    const tableRows = [
      new TableRow({
        height: { value: 240, rule: "atLeast" },
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Profissional", bold: true, color: GREEN })] })],
            shading: { fill: "F0F0F0" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Diárias", bold: true, color: GREEN })],
                alignment: AlignmentType.RIGHT,
              }),
            ],
            shading: { fill: "F0F0F0" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Horas/Diária", bold: true, color: GREEN })],
                alignment: AlignmentType.RIGHT,
              }),
            ],
            shading: { fill: "F0F0F0" },
          }),
        ],
      }),
    ];

    for (const item of items) {
      const member = team?.[item.id];
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: item.label })],
              borders: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "DDDDDD" } },
            }),
            new TableCell({
              children: [new Paragraph({ text: String(member?.diarias || 0), alignment: AlignmentType.RIGHT })],
              borders: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "DDDDDD" } },
            }),
            new TableCell({
              children: [new Paragraph({ text: `${member?.hoursPerDiaria || 0}h`, alignment: AlignmentType.RIGHT })],
              borders: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "DDDDDD" } },
            }),
          ],
        })
      );
    }

    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            children: [
              new Paragraph({
                children: [new TextRun({ text: `Total ${PHASE_LABELS[phase]}`, bold: true, color: GRAY_TEXT })],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: formatCurrency(phaseTotal), bold: true })],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        ],
      })
    );

    sections.push(
      new Paragraph({
        children: [new TextRun({ text: PHASE_LABELS[phase], bold: true, size: 20, color: GRAY_TEXT })],
        spacing: { before: 120, after: 120 },
      })
    );
    sections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows,
      })
    );
    sections.push(new Paragraph({ text: "", spacing: { after: 120 } }));
  }

  // 5. Equipment
  if (hasEquipment) {
    sections.push(createSectionHeading(sectionNums.equipment, "Equipamentos"));
    const tableRows = [
      new TableRow({
        height: { value: 240, rule: "atLeast" },
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Equipamento", bold: true, color: GREEN })] })],
            shading: { fill: "F0F0F0" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Qtd", bold: true, color: GREEN })],
                alignment: AlignmentType.RIGHT,
              }),
            ],
            shading: { fill: "F0F0F0" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Valor Unit.", bold: true, color: GREEN })],
                alignment: AlignmentType.RIGHT,
              }),
            ],
            shading: { fill: "F0F0F0" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Subtotal", bold: true, color: GREEN })],
                alignment: AlignmentType.RIGHT,
              }),
            ],
            shading: { fill: "F0F0F0" },
          }),
        ],
      }),
    ];

    for (const item of equipment || []) {
      const subtotal = (item.quantity || 0) * (item.unitPrice || 0);
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: item.name || "—" })],
              borders: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "DDDDDD" } },
            }),
            new TableCell({
              children: [new Paragraph({ text: String(item.quantity), alignment: AlignmentType.RIGHT })],
              borders: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "DDDDDD" } },
            }),
            new TableCell({
              children: [new Paragraph({ text: formatCurrency(item.unitPrice || 0), alignment: AlignmentType.RIGHT })],
              borders: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "DDDDDD" } },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: formatCurrency(subtotal), bold: true })],
                  alignment: AlignmentType.RIGHT,
                }),
              ],
              borders: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "DDDDDD" } },
            }),
          ],
        })
      );
    }

    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 3,
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Total Equipamentos", bold: true, color: GRAY_TEXT })],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: formatCurrency(summary.equipment), bold: true })],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        ],
      })
    );

    sections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows,
      })
    );
    sections.push(new Paragraph({ text: "", spacing: { after: 240 } }));
  }

  // 6. Included/Excluded items
  if (hasIncluded) {
    sections.push(createSectionHeading(sectionNums.included, "Itens Inclusos e Não Inclusos"));
    if (includedItems.included.length > 0) {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: "Inclusos", bold: true, size: 20, color: GRAY_TEXT })],
          spacing: { after: 120 },
        })
      );
      for (const item of labelFor(INCLUDED_ITEMS, includedItems.included)) {
        sections.push(new Paragraph({ text: `✓ ${item}`, spacing: { after: 80 } }));
      }
    }
    if (includedItems.excluded.length > 0) {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: "Não inclusos", bold: true, size: 20, color: GRAY_TEXT })],
          spacing: { before: 120, after: 120 },
        })
      );
      for (const item of labelFor(INCLUDED_ITEMS, includedItems.excluded)) {
        sections.push(new Paragraph({ text: `✕ ${item}`, spacing: { after: 80 } }));
      }
    }
    sections.push(new Paragraph({ text: "", spacing: { after: 120 } }));
  }

  // 7. Schedule
  if (!!schedule) {
    sections.push(createSectionHeading(sectionNums.schedule, "Cronograma"));
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Após o fechamento do projeto será entregue um cronograma com as datas de produção e aprovação do projeto.",
            color: GRAY_TEXT,
          }),
        ],
        spacing: { after: 120 },
      })
    );
    sections.push(new Paragraph({ text: schedule, spacing: { after: 240 } }));
  }

  // 8. Client responsibilities
  if (!!clientResponsibilities) {
    sections.push(createSectionHeading(sectionNums.responsibilities, "Responsabilidade do Cliente"));
    sections.push(new Paragraph({ text: clientResponsibilities, spacing: { after: 240 } }));
  }

  // 9. Logistics
  if (hasLogistics) {
    sections.push(createSectionHeading(sectionNums.logistics, "Logística"));
    if (logistics.displacement.enabled) {
      sections.push(createRowTable("Deslocamento", formatCurrency(
        logistics.displacement.ratePerKm * logistics.displacement.kilometers +
        (logistics.displacement.customValue || 0)
      )));
    }
    if (logistics.meals.enabled) {
      sections.push(createRowTable("Alimentação", formatCurrency(logistics.meals.ratePerPerson * logistics.meals.people)));
    }
    if (logistics.studio?.enabled) {
      sections.push(createRowTable("Estúdio de gravação", formatCurrency(logistics.studio.value)));
    }
  }

  // 10. General conditions
  if (hasConditions) {
    sections.push(createSectionHeading(sectionNums.conditions, "Condições Gerais"));
    if (generalConditions.validityStart) {
      sections.push(createRowTable("Validade", formatDateRange(generalConditions.validityStart, generalConditions.validityEnd)));
    }
    if (generalConditions.paymentMethod) {
      sections.push(createRowTable("Pagamento", generalConditions.paymentMethod));
    }
    if (generalConditions.revisions) {
      sections.push(createRowTable("Alterações", REVISION_OPTIONS.find((r) => r.id === generalConditions.revisions)?.label || ""));
    }
    sections.push(new Paragraph({ text: "", spacing: { after: 120 } }));
  }

  // 11. Investment
  sections.push(createSectionHeading(sectionNums.investment, "Investimento"));

  const investmentRows = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "Pré-produção" })],
        }),
        new TableCell({
          children: [new Paragraph({ text: formatCurrency(summary.preProduction), alignment: AlignmentType.RIGHT })],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "Produção" })],
        }),
        new TableCell({
          children: [new Paragraph({ text: formatCurrency(summary.production), alignment: AlignmentType.RIGHT })],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "Pós-produção" })],
        }),
        new TableCell({
          children: [new Paragraph({ text: formatCurrency(summary.postProduction), alignment: AlignmentType.RIGHT })],
        }),
      ],
    }),
  ];

  if (summary.equipment > 0) {
    investmentRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: "Equipamentos" })],
          }),
          new TableCell({
            children: [new Paragraph({ text: formatCurrency(summary.equipment), alignment: AlignmentType.RIGHT })],
          }),
        ],
      })
    );
  }

  if (summary.logistics > 0) {
    investmentRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: "Logística" })],
          }),
          new TableCell({
            children: [new Paragraph({ text: formatCurrency(summary.logistics), alignment: AlignmentType.RIGHT })],
          }),
        ],
      })
    );
  }

  investmentRows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: `Honorários (${feesPct}%)`, color: GRAY_TEXT })],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: formatCurrency(summary.fees), color: GRAY_TEXT })],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Impostos (8%)", color: GRAY_TEXT })],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: formatCurrency(summary.taxes), color: GRAY_TEXT })],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Valor Total", bold: true, color: GREEN, size: 24 })],
            }),
          ],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 12, color: GREEN },
          },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: formatCurrency(summary.total), bold: true, color: GREEN, size: 24 })],
              alignment: AlignmentType.RIGHT,
            }),
          ],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 12, color: GREEN },
          },
        }),
      ],
    })
  );

  sections.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: investmentRows,
    })
  );

  const doc = new Document({
    sections: [{ children: sections }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `proposta-${data.header.project || "producao"}.docx`);
}
