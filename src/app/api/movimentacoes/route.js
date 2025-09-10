// src/app/api/movimentacoes/route.js
import { NextResponse } from "next/server";
import { getSheetData, appendRow, updateRow, deleteRow } from "../../dashboard/lib/googlesheets";

const SPREADSHEET_ID = "1Cy2LFNSrWw0O5thPjbeHfTTj0iZlSrDSVbuc-nBHi_Q";
const RANGE = "Movimentacoes!A1:H"; 
const PRODUTOS_RANGE = "Produtos!A1:H";

// GET
export async function GET() {
  try {
    const rows = await getSheetData(RANGE, SPREADSHEET_ID);
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST

export async function POST(request) {
  try {
    const body = await request.json();
    const { NomeProduto, ValorUnitario, Quantidade, Periodo, Movimentacao } = body;

    const camposFaltando = [];
    if (!NomeProduto) camposFaltando.push("NomeProduto");
    if (!Quantidade) camposFaltando.push("Quantidade");
    if (ValorUnitario === undefined) camposFaltando.push("ValorUnitario");
    if (!Periodo) camposFaltando.push("Periodo");
    if (!Movimentacao) camposFaltando.push("Movimentacao");

    if (camposFaltando.length > 0) {
      return NextResponse.json({
        error: `Campos obrigatórios ausentes: ${camposFaltando.join(", ")}`,
      }, { status: 400 });
    }

    const formatDataBR = (isoDate) => {
      const [ano, mes, dia] = String(isoDate).split("-");
      return `${dia}/${mes}/${ano}`;
    };

    const produtos = await getSheetData(PRODUTOS_RANGE, SPREADSHEET_ID);
    const produto = produtos.find(p => p.Nome === NomeProduto);
    if (!produto) {
      return NextResponse.json({ error: `Produto '${NomeProduto}' não encontrado` }, { status: 404 });
    }

    const ProdutoID = produto.ID;
    const valorUnitarioNum = Number(String(ValorUnitario).replace(",", "."));
    const quantidadeNum = Number(String(Quantidade).replace(",", "."));
    const ValorTotal = valorUnitarioNum * quantidadeNum;
    const PeriodoFormatado = formatDataBR(Periodo);

    // Buscar todas as movimentações existentes
    const movimentacoes = await getSheetData(RANGE, SPREADSHEET_ID);

    // Extrair IDs válidos do campo "Mov ID"
    const idsExistentes = movimentacoes
      .map(row => Number(row["Mov ID"]))
      .filter(id => !isNaN(id) && id > 0);

    const nextID = idsExistentes.length > 0
      ? Math.max(...idsExistentes) + 1
      : 1;

    // Construir nova linha como array (ordem das colunas da planilha)
    const newRow = [
      ProdutoID,
      NomeProduto,
      quantidadeNum,
      valorUnitarioNum,
      ValorTotal,
      PeriodoFormatado,
      Movimentacao,
      nextID // Mov ID na última coluna
    ];

    await appendRow(newRow, SPREADSHEET_ID, RANGE);

    return NextResponse.json({
      message: "Movimentação adicionada",
      movimentacao: newRow,
    });
  } catch (err) {
    console.error("Erro ao adicionar movimentação:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


// PUT
export async function PUT(request) {
  try {
    const body = await request.json();
    const movimentacaoId = body.ID ?? body.id;
    if (!movimentacaoId) return NextResponse.json({ error: "ID da movimentação obrigatório" }, { status: 400 });

    const movimentacoes = await getSheetData(RANGE, SPREADSHEET_ID);
    const index = movimentacoes.findIndex(m => Number(m["Mov ID"]) === Number(movimentacaoId));
    if (index === -1) return NextResponse.json({ error: "Movimentação não encontrada" }, { status: 404 });

    const original = movimentacoes[index];
    const Quantidade = body.Quantidade ?? original["Quantidade"];
    const ValorUnitario = body.ValorUnitario ?? original["ValorUnitario"];
    const ValorTotal = Number(Quantidade) * Number(ValorUnitario);

    const updatedRow = [
      original["ID Produto"],
      body.NomeProduto ?? original["Nome Produto"],
      Quantidade,
      ValorUnitario,
      ValorTotal,
      body.Periodo ?? original["Periodo"],
      body.Movimentacao ?? original["Tipo"],
      original["Mov ID"]
    ];


    const rowNumber = index + 2;
    const rangeForUpdate = `Movimentacoes!A${rowNumber}:H${rowNumber}`;
    await updateRow(SPREADSHEET_ID, rangeForUpdate, [updatedRow]);

    return NextResponse.json({ message: "Movimentação atualizada", movimentacao: updatedRow });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request) {
  try {
    const body = await request.json();
    const movimentacaoId = body.ID;
    if (!movimentacaoId) return NextResponse.json({ error: "ID da movimentação obrigatório" }, { status: 400 });

    const movimentacoes = await getSheetData(RANGE, SPREADSHEET_ID);
    const index = movimentacoes.findIndex(m => Number(m["Mov ID"]) === Number(movimentacaoId));
    await deleteRow(RANGE, index, SPREADSHEET_ID);
    return NextResponse.json({ message: "Movimentação removida" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
