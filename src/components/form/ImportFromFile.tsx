"use client";

import { useState, useRef } from "react";
import { ProposalFormData } from "@/types/proposal";

interface ImportFromFileProps {
  onImport: (data: Partial<ProposalFormData>) => void;
}

const ACCEPTED_TYPES = ".xlsx,.xls,.png,.jpg,.jpeg,.webp";
const MAX_SIZE_MB = 10;

export function ImportFromFile({ onImport }: ImportFromFileProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setStatus("error");
      setMessage(`Arquivo muito grande. O limite é ${MAX_SIZE_MB}MB.`);
      return;
    }

    const isXlsx = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
    const isImage = file.type.startsWith("image/");

    if (!isXlsx && !isImage) {
      setStatus("error");
      setMessage("Formato não suportado. Use XLSX, PNG ou JPG.");
      return;
    }

    setStatus("loading");
    setFileName(file.name);
    setMessage("");

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onerror = () => {
      setStatus("error");
      setMessage("Erro ao ler o arquivo.");
    };

    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(",")[1];

        const payload = isXlsx
          ? { type: "xlsx", content: base64 }
          : { type: "image", content: base64, mimeType: file.type };

        const res = await fetch("/api/import-proposal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await res.json();

        if (result.success && result.data) {
          onImport(result.data);
          setStatus("success");
          setMessage("Formulário preenchido com as informações encontradas. Você pode ajustar o que precisar.");
        } else {
          setStatus("error");
          setMessage(result.error || "Não foi possível extrair os dados. Tente novamente.");
        }
      } catch {
        setStatus("error");
        setMessage("Erro ao processar o arquivo. Tente novamente.");
      }
    };
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border border-dashed border-[#375e40]/50 p-5 transition-colors hover:border-[#375e40]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-black">Importar de planilha</p>
          <p className="mt-0.5 text-xs text-black/50">
            Envie um arquivo XLSX ou um print de planilha para preencher o formulário automaticamente
          </p>

          {status === "loading" && (
            <p className="mt-2 text-xs text-black/60">
              Analisando <span className="font-medium">{fileName}</span>...
            </p>
          )}

          {status === "success" && (
            <p className="mt-2 text-xs text-[#375e40]">{message}</p>
          )}

          {status === "error" && (
            <p className="mt-2 text-xs text-red-500">{message}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={status === "loading"}
          className="shrink-0 border border-[#375e40] px-4 py-2 text-xs font-medium text-[#375e40] transition-colors hover:bg-[#375e40] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "loading" ? "Processando..." : "Escolher arquivo"}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
