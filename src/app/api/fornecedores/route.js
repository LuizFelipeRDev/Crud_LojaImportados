import { NextResponse } from "next/server";
import {
  getSheetData,
  appendRow,
  updateRow,
  deleteRow,
} from "@/app/dashboard/lib/googlesheets";

const SPREADSHEET_ID = "1Cy2LFNSrWw0O5thPjbeHfTTj0iZlSrDSVbuc-nBHi_Q";
const RANGE = "Fornecedores!A1:D";

// Utilitário para gerar novo ID
const gerarNovoId = (dados) => {
  const ids = dados
    .map((row) => Number(row.id ?? row.ID))
    .filter((n) => Number.isInteger(n) && n > 0);
  return ids.length ? Math.max(...ids) + 1 : 1;
};

// Normaliza campos para minúsculo!!!!!
const normalizar = (rows) =>
  rows.map((row) => {
    const obj = {};
    for (const key in row) {
      obj[key.toLowerCase()] = row[key];
    }
    return obj;
  });

// GET → listar fornecedores
export async function GET() {
  try {
    const rows = await getSheetData(RANGE, SPREADSHEET_ID);
    const fornecedores = normalizar(rows);
    return NextResponse.json(fornecedores);
  } catch (err) {
    console.error("Erro ao buscar fornecedores:", err);
    return NextResponse.json([], { status: 500 });
  }
}

// POST → adicionar novo fornecedor
export async function POST(req) {
  try {
    const { nome, email, telefone } = await req.json();
    const rows = await getSheetData(RANGE, SPREADSHEET_ID);
    const fornecedores = normalizar(rows);

    const novoId = gerarNovoId(fornecedores);

    const novoFornecedor = {
      id: String(novoId),
      nome,
      email,
      telefone,
    };

    await appendRow(novoFornecedor, SPREADSHEET_ID, "Fornecedores!A:D");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao adicionar fornecedor:", err);
    return NextResponse.json({ error: "Erro ao adicionar fornecedor" }, { status: 500 });
  }
}

// PUT → atualizar fornecedor existente
export async function PUT(req) {
  try {
    const { id, nome, email, telefone } = await req.json();
    const rows = await getSheetData(RANGE, SPREADSHEET_ID);
    const fornecedores = normalizar(rows);

    const index = fornecedores.findIndex(
      (row) => String(row.id).trim() === String(id).trim()
    );

    if (index === -1) {
      return NextResponse.json({ error: "Fornecedor não encontrado" }, { status: 404 });
    }

    const fornecedorAtualizado = [id, nome, email, telefone, "", "", ""];
    await updateRow(fornecedorAtualizado, index + 2, SPREADSHEET_ID, "Fornecedores!A:D");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao atualizar fornecedor:", err);
    return NextResponse.json({ error: "Erro ao atualizar fornecedor" }, { status: 500 });
  }
}

// DELETE → remover fornecedor
export async function DELETE(req) {
  try {
    const { id } = await req.json();
    const rows = await getSheetData(RANGE, SPREADSHEET_ID);
    const fornecedores = normalizar(rows);

    const index = fornecedores.findIndex(
      (row) => String(row.id).trim() === String(id).trim()
    );

    if (index === -1) {
      return NextResponse.json({ error: "Fornecedor não encontrado" }, { status: 404 });
    }

    await deleteRow("Fornecedores!A:D", index, SPREADSHEET_ID);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao excluir fornecedor:", err);
    return NextResponse.json({ error: "Erro ao excluir fornecedor" }, { status: 500 });
  }
}


