export type Phase = "pre-production" | "production" | "post-production";

export interface TeamItem {
  id: string;
  label: string;
  phase: Phase;
  ratePerHour: number;
}

export const TEAM_ITEMS: TeamItem[] = [
  // Pré-produção
  { id: "pre_diretor", label: "Diretor", phase: "pre-production", ratePerHour: 250 },
  { id: "pre_roteirista", label: "Roteirista", phase: "pre-production", ratePerHour: 160 },
  { id: "pre_narrador", label: "Narrador", phase: "pre-production", ratePerHour: 60 },
  { id: "pre_assist_producao", label: "Assistente de Produção", phase: "pre-production", ratePerHour: 50 },
  { id: "pre_dir_fotografia", label: "Diretor de Fotografia", phase: "pre-production", ratePerHour: 200 },
  { id: "pre_dir_arte", label: "Diretor de Arte", phase: "pre-production", ratePerHour: 200 },
  { id: "pre_figurinista", label: "Figurinista", phase: "pre-production", ratePerHour: 125 },
  { id: "pre_maquiador", label: "Maquiador", phase: "pre-production", ratePerHour: 150 },
  { id: "pre_produtor", label: "Produtor", phase: "pre-production", ratePerHour: 125 },

  // Produção
  { id: "prod_dir_cena", label: "Diretor de Cena", phase: "production", ratePerHour: 250 },
  { id: "prod_dir_fotografia", label: "Diretor de Fotografia", phase: "production", ratePerHour: 200 },
  { id: "prod_op_camera", label: "Operador de Câmera", phase: "production", ratePerHour: 130 },
  { id: "prod_cinegrafista", label: "Cinegrafista", phase: "production", ratePerHour: 180 },
  { id: "prod_op_som", label: "Operador de Som Direto", phase: "production", ratePerHour: 150 },
  { id: "prod_op_drone", label: "Operador de Drone", phase: "production", ratePerHour: 450 },
  { id: "prod_assistente", label: "Assistente", phase: "production", ratePerHour: 50 },
  { id: "prod_fotografo", label: "Fotógrafo", phase: "production", ratePerHour: 150 },

  // Pós-produção
  { id: "pos_editor_video", label: "Editor de Vídeo", phase: "post-production", ratePerHour: 60 },
  { id: "pos_colorista", label: "Colorista", phase: "post-production", ratePerHour: 70 },
  { id: "pos_motion_designer", label: "Motion Designer", phase: "post-production", ratePerHour: 110 },
  { id: "pos_editor_sameday", label: "Editor Sameday", phase: "post-production", ratePerHour: 120 },
  { id: "pos_editor_foto", label: "Editor de Foto", phase: "post-production", ratePerHour: 45 },
];

export const PHASE_LABELS: Record<Phase, string> = {
  "pre-production": "Pré-produção",
  "production": "Produção",
  "post-production": "Pós-produção",
};

export const VIDEO_NAMES = [
  { id: "aftermovie", label: "Aftermovie" },
  { id: "video_case", label: "Vídeo Case" },
  { id: "reels", label: "Reels" },
  { id: "teaser", label: "Teaser" },
  { id: "outro", label: "Outro" },
] as const;

export const VIDEO_FORMATS = [
  { id: "vertical", label: "Vertical (1080x1920)" },
  { id: "horizontal", label: "Horizontal (1920x1080)" },
  { id: "quadrado", label: "Quadrado (1080x1080)" },
  { id: "vertical-horizontal", label: "Vertical (1080x1920) e Horizontal (1920x1080)" },
] as const;

export const VIDEO_DURATIONS = [
  { id: "15s", label: "Até 15 segundos" },
  { id: "30s", label: "Até 30 segundos" },
  { id: "45s", label: "Até 45 segundos" },
  { id: "1min", label: "Até 1 minuto" },
  { id: "1min30", label: "Até 1 minuto e 30 segundos" },
  { id: "2min", label: "Até 2 minutos" },
  { id: "2min30", label: "Até 2 minutos e 30 segundos" },
  { id: "3min", label: "Até 3 minutos" },
  { id: "3min30", label: "Até 3 minutos e 30 segundos" },
] as const;

export const PRE_PRODUCTION_PROCESSES = [
  { id: "proc_roteiro", label: "Produção de roteiro" },
  { id: "proc_moodboard", label: "Produção de moodboard" },
  { id: "proc_shootlist", label: "Produção de shootlist" },
  { id: "proc_trilhas", label: "Pesquisa e envio de trilhas sonoras" },
  { id: "proc_equipe", label: "Montagem de equipe" },
  { id: "proc_alinhamento", label: "Alinhamento de produção e conteúdo" },
  { id: "proc_ordem_dia", label: "Montagem de ordem do dia" },
] as const;

export const PRODUCTION_PROCESSES = [
  { id: "proc_cap_video", label: "Captação de vídeo" },
  { id: "proc_cap_audio", label: "Captação de áudio" },
  { id: "proc_cap_foto", label: "Captação de foto" },
] as const;

export const POST_PRODUCTION_PROCESSES = [
  { id: "proc_decupagem", label: "Decupagem" },
  { id: "proc_montagem", label: "Montagem" },
  { id: "proc_colorização", label: "Colorização" },
  { id: "proc_sonorizacao", label: "Sonorização" },
  { id: "proc_tratamento_audio", label: "Tratamento de áudio" },
  { id: "proc_finalizacao", label: "Finalização" },
] as const;

export const INCLUDED_ITEMS = [
  { id: "inc_cap_video", label: "Captação de vídeo" },
  { id: "inc_edicao_video", label: "Edição de vídeo" },
  { id: "inc_cap_foto", label: "Captação de foto" },
  { id: "inc_edicao_foto", label: "Edição de foto" },
  { id: "inc_roteiro", label: "Roteiro" },
  { id: "inc_animacao", label: "Animação" },
  { id: "inc_lettering", label: "Animação de lettering" },
  { id: "inc_material_bruto", label: "Material bruto" },
  { id: "inc_vfx", label: "VFX" },
  { id: "inc_animacoes_escopo", label: "Animações fora do escopo combinado" },
  { id: "inc_ia", label: "IA" },
] as const;

export const REVISION_OPTIONS = [
  { id: "1_rodada", label: "1 rodada por vídeo" },
  { id: "2_rodadas", label: "2 rodadas por vídeo" },
] as const;
