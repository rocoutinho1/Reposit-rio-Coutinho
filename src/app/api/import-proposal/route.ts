import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import ExcelJS from "exceljs";

const client = new Anthropic();

const SYSTEM_PROMPT = `Você é um assistente especializado em extrair informações de planilhas e formulários de propostas comerciais audiovisuais.

Dado o conteúdo de uma planilha ou imagem, extraia os campos relevantes e retorne um objeto JSON válido. Omita completamente seções que não conseguir identificar — não invente valores.

ESTRUTURA DO JSON DE SAÍDA (inclua apenas o que encontrar):
{
  "header": {
    "client": "nome do cliente",
    "project": "nome do projeto",
    "date": "YYYY-MM-DD",
    "periodStart": "YYYY-MM-DD",
    "periodEnd": "YYYY-MM-DD",
    "contact": "email ou telefone",
    "proposalNumber": "número da proposta"
  },
  "aboutProject": "descrição do projeto em texto",
  "schedule": "cronograma em texto livre",
  "clientResponsibilities": "responsabilidades do cliente em texto",
  "deliverables": {
    "video": {
      "groups": [
        {
          "quantity": 3,
          "name": "reels",
          "format": "vertical",
          "duration": "30s"
        },
        {
          "quantity": 1,
          "name": "aftermovie",
          "format": "horizontal",
          "duration": "2min"
        }
      ]
    },
    "photoQuantity": 0,
    "rawFootageQuantity": 0
  },
  "processes": {
    "preProduction": ["proc_roteiro", "proc_moodboard"],
    "production": ["proc_cap_video"],
    "postProduction": ["proc_montagem", "proc_colorização", "proc_finalizacao"]
  },
  "team": {
    "pre_diretor": { "selected": true, "diarias": 1, "hoursPerDiaria": 8 },
    "prod_dir_cena": { "selected": true, "diarias": 2, "hoursPerDiaria": 10 },
    "pos_editor_video": { "selected": true, "diarias": 3, "hoursPerDiaria": 8 }
  },
  "equipment": [
    { "id": "eq1", "name": "nome do equipamento", "quantity": 1, "unitPrice": 500 }
  ],
  "includedItems": {
    "included": ["inc_cap_video", "inc_edicao_video"],
    "excluded": ["inc_vfx", "inc_ia"]
  },
  "logistics": {
    "displacement": { "enabled": true, "ratePerKm": 1.5, "kilometers": 50, "customValue": 0 },
    "meals": { "enabled": true, "ratePerPerson": 30, "people": 5 },
    "studio": { "enabled": false, "value": 0 }
  },
  "generalConditions": {
    "validityStart": "YYYY-MM-DD",
    "validityEnd": "YYYY-MM-DD",
    "paymentMethod": "50% na aprovação, 50% na entrega",
    "revisions": "2_rodadas"
  },
  "feesRate": 25,
  "discountRate": 0
}

IDs DISPONÍVEIS PARA EQUIPE (use apenas estes):
Pré-produção: pre_diretor (R$250/h), pre_roteirista (R$160/h), pre_narrador (R$60/h), pre_assist_producao (R$50/h), pre_dir_fotografia (R$200/h), pre_dir_arte (R$200/h), pre_figurinista (R$125/h), pre_maquiador (R$150/h), pre_produtor (R$125/h)
Produção: prod_dir_cena (R$250/h), prod_dir_fotografia (R$200/h), prod_op_camera (R$130/h), prod_cinegrafista (R$180/h), prod_op_som (R$150/h), prod_op_drone (R$450/h), prod_assistente (R$50/h), prod_fotografo (R$150/h)
Pós-produção: pos_editor_video (R$60/h), pos_colorista (R$70/h), pos_motion_designer (R$110/h), pos_editor_sameday (R$120/h), pos_editor_foto (R$45/h)

IDs DISPONÍVEIS PARA PROCESSOS:
preProduction: proc_roteiro, proc_moodboard, proc_shootlist, proc_trilhas, proc_equipe, proc_alinhamento, proc_ordem_dia
production: proc_cap_video, proc_cap_audio, proc_cap_foto
postProduction: proc_decupagem, proc_montagem, proc_colorização, proc_sonorizacao, proc_tratamento_audio, proc_finalizacao

IDs DISPONÍVEIS PARA ITENS INCLUSOS/EXCLUSOS:
inc_cap_video, inc_edicao_video, inc_cap_foto, inc_edicao_foto, inc_roteiro, inc_animacao, inc_lettering, inc_material_bruto, inc_vfx, inc_animacoes_escopo, inc_ia

IDs PARA VÍDEOS:
name: aftermovie, video_case, reels, teaser, outro
format: vertical, horizontal, quadrado
duration: 15s, 30s, 45s, 1min, 1min30, 2min, 2min30, 3min, 3min30

revisions: "1_rodada" ou "2_rodadas"

REGRAS IMPORTANTES:
1. Retorne APENAS JSON puro, sem markdown, sem blocos de código, sem explicações
2. Omita campos que não encontrar — não coloque valores padrão inventados
3. Datas: formato YYYY-MM-DD obrigatório
4. Para equipe: "diarias" = número de dias trabalhados, "hoursPerDiaria" = horas por dia
5. Se a planilha mostrar total de horas, assuma hoursPerDiaria=8 e calcule diarias=totalHoras/8
6. Números: sem R$, sem %, apenas o valor numérico
7. Se não houver informação de logística, omita o campo logistics completamente`;

function extractJson(text: string): string {
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlock) return codeBlock[1];
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    return text.slice(firstBrace, lastBrace + 1);
  }
  return text.trim();
}

async function extractXlsxText(base64: string): Promise<string> {
  const nodeBuffer = Buffer.from(base64, "base64");
  const workbook = new ExcelJS.Workbook();
  // @ts-expect-error -- ExcelJS types lag behind @types/node; compatible at runtime
  await workbook.xlsx.load(nodeBuffer);

  const lines: string[] = [];
  workbook.eachSheet((sheet) => {
    lines.push(`\n=== Planilha: ${sheet.name} ===`);
    sheet.eachRow((row) => {
      const cells: string[] = [];
      row.eachCell({ includeEmpty: false }, (cell) => {
        const val = cell.value;
        if (val !== null && val !== undefined && val !== "") {
          cells.push(String(val));
        }
      });
      if (cells.length > 0) lines.push(cells.join(" | "));
    });
  });

  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, content, mimeType } = body;

    if (!content) {
      return NextResponse.json({ success: false, error: "Nenhum conteúdo recebido" }, { status: 400 });
    }

    let messages: Anthropic.MessageParam[];

    if (type === "xlsx") {
      const text = await extractXlsxText(content);
      messages = [
        {
          role: "user",
          content: `Extraia as informações desta planilha orçamentária e mapeie para o formulário de proposta:\n\n${text}`,
        },
      ];
    } else {
      const validTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
      const imgType = validTypes.includes(mimeType) ? mimeType : "image/jpeg";

      messages = [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: imgType as "image/png" | "image/jpeg" | "image/gif" | "image/webp",
                data: content,
              },
            },
            {
              type: "text",
              text: "Extraia as informações desta planilha/imagem e mapeie para o formulário de proposta:",
            },
          ],
        },
      ];
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages,
    });

    const rawText = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonText = extractJson(rawText);
    const parsed = JSON.parse(jsonText);

    if (parsed.equipment && Array.isArray(parsed.equipment)) {
      parsed.equipment = parsed.equipment.map((item: Record<string, unknown>, i: number) => ({
        ...item,
        id: item.id || `imported_eq_${i}_${Date.now()}`,
      }));
    }

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error("Import error:", error);
    const message =
      error instanceof SyntaxError
        ? "Não foi possível interpretar a resposta do assistente. Tente novamente."
        : "Não foi possível processar o arquivo. Verifique o formato e tente novamente.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
