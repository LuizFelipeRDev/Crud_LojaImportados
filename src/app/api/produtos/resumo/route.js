// src/app/api/produtos/resumo/route.js
import { NextResponse } from "next/server";
import { getSheetData } from "@/app/dashboard/lib/googlesheets";

const SPREADSHEET_ID = "1Cy2LFNSrWw0O5thPjbeHfTTj0iZlSrDSVbuc-nBHi_Q";
const RANGE = "Produtos!A1:I";

//ferramenta de auxilio
const parseUnidade = (val) => {
  if (val == null) return 0;
  const s = String(val).replace(/\./g, "").replace(",", ".").trim();
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

const normalizeAtivo = (val) => {
  const s = String(val ?? "").trim().toLowerCase();
  if (["não", "nao", "n", "false", "0"].includes(s)) return "nao";
  if (["sim", "s", "true", "1"].includes(s)) return "sim";
  return "sim"; 
};

const isEmptyRow = (row) => {
  if (Array.isArray(row)) {
    return row.every((c) => c == null || String(c).trim() === "");
  }
  return Object.values(row || {}).every((c) => c == null || String(c).trim() === "");
};

export async function GET() {
  try {
    const data = await getSheetData(RANGE, SPREADSHEET_ID);

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({
        produtosRegistrados: 0,
        emEstoque: 0,
        semEstoque: 0,
        foraCatalogo: 0,
      });
    }

    let produtosRegistrados = 0;
    let emEstoque = 0;
    let semEstoque = 0;
    let foraCatalogo = 0;

    
    if (Array.isArray(data[0])) {
      const headers = data[0].map((h) => String(h).trim());
      const idxUnidade = headers.findIndex((h) => h.toLowerCase() === "unidade");
      const idxAtivo = headers.findIndex((h) => h.toLowerCase() === "ativo");

  
      if (idxUnidade === -1 || idxAtivo === -1) {
        throw new Error("Colunas 'Unidade' e/ou 'Ativo' não encontradas no cabeçalho.");
      }

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (isEmptyRow(row)) continue;

        const unidade = parseUnidade(row[idxUnidade]);
        const ativo = normalizeAtivo(row[idxAtivo]);

        produtosRegistrados += 1;

        if (ativo === "nao") {
          foraCatalogo += 1;
        } else if (unidade > 0) {
          emEstoque += 1;
        } else {
          semEstoque += 1;
        }
      }
    } else if (data[0] && typeof data[0] === "object") {

      for (const row of data) {
        if (isEmptyRow(row)) continue;

        const unidade = parseUnidade(row.Unidade);
        const ativo = normalizeAtivo(row.Ativo);

        produtosRegistrados += 1;

        if (ativo === "nao") {
          foraCatalogo += 1;
        } else if (unidade > 0) {
          emEstoque += 1;
        } else {
          semEstoque += 1;
        }
      }
    } else {
      throw new Error("Formato de dados inesperado do getSheetData.");
    }

    return NextResponse.json({
      produtosRegistrados,
      emEstoque,
      semEstoque,
      foraCatalogo,
    });
  } catch (err) {
    console.error("Erro resumo produtos:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
