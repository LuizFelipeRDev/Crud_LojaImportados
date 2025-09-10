// src/app/api/movimentacoes/route.js
import { NextResponse } from "next/server";
import { getSheetData, appendRow, updateRow, deleteRow } from "../../dashboard/lib/googlesheets";

const SPREADSHEET_ID = "1Cy2LFNSrWw0O5thPjbeHfTTj0iZlSrDSVbuc-nBHi_Q";
const RANGE = "Movimentacoes!A1:G"; // Colunas: ID, ProdutoID, NomeProduto, Quantidade, ValorUnitario, ValorTotal, Periodo, Movimentacao
const PRODUTOS_RANGE = "Produtos!A1:H"; // Para pegar ProdutoID pelo NomeProduto

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

    // Validação detalhada
    const camposFaltando = [];
    if (!NomeProduto) camposFaltando.push("NomeProduto");
    if (!Quantidade) camposFaltando.push("Quantidade");
    if (ValorUnitario === undefined) camposFaltando.push("ValorUnitario");
    if (!Periodo) camposFaltando.push("Periodo");
    if (!Movimentacao) camposFaltando.push("Movimentacao");

    const formatDataBR = (isoDate) => {
      const [ano, mes, dia] = String(isoDate).split("-");
      return `${dia}/${mes}/${ano}`;
    };

    if (camposFaltando.length > 0) {
      return NextResponse.json({
        error: `Campos obrigatórios ausentes: ${camposFaltando.join(", ")}`,
      }, { status: 400 });
    }

    // Buscar ProdutoID pelo nome
    const produtos = await getSheetData(PRODUTOS_RANGE, SPREADSHEET_ID);
    const produto = produtos.find(p => p.Nome === NomeProduto);
    if (!produto) {
      return NextResponse.json({ error: `Produto '${NomeProduto}' não encontrado` }, { status: 404 });
    }

    const ProdutoID = produto.ID;
    const ValorTotal = Number(Quantidade) * Number(ValorUnitario);

const PeriodoFormatado = formatDataBR(Periodo);


    // Gerar próximo ID
    const movimentacoes = await getSheetData(RANGE, SPREADSHEET_ID);
    const nextID = movimentacoes.length > 0
      ? Math.max(...movimentacoes.map(m => Number(m.ID))) + 1
      : 1;

    const newMovimentacao = {
      ProdutoID,
      NomeProduto,
      Quantidade,
      ValorUnitario,
      ValorTotal,
      PeriodoFormatado,
      Movimentacao,
    };

    await appendRow(newMovimentacao, SPREADSHEET_ID, RANGE);
    return NextResponse.json({
      message: "Movimentação adicionada",
      movimentacao: newMovimentacao,
    });
  } catch (err) {
    console.error("Erro no POST movimentações:", err);
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
    const index = movimentacoes.findIndex(m => Number(m.ID) === Number(movimentacaoId));
    if (index === -1) return NextResponse.json({ error: "Movimentação não encontrada" }, { status: 404 });

    // Atualizar campos
    const Quantidade = body.Quantidade !== undefined ? body.Quantidade : movimentacoes[index].Quantidade;
    const ValorUnitario = body.ValorUnitario !== undefined ? body.ValorUnitario : movimentacoes[index].ValorUnitario;
    const ValorTotal = Number(Quantidade) * Number(ValorUnitario);

    const updatedRow = [
      movimentacoes[index].ProdutoID, // ProdutoID não muda
      body.NomeProduto || movimentacoes[index].NomeProduto,
      Quantidade,
      ValorUnitario,
      ValorTotal,
      body.Periodo || movimentacoes[index].Periodo,
      body.Movimentacao || movimentacoes[index].Movimentacao,
    ];

    const rowNumber = index + 2;
    const rangeForUpdate = `Movimentacoes!A${rowNumber}:I${rowNumber}`;
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
    if (!body.ID) return NextResponse.json({ error: "ID da movimentação obrigatório" }, { status: 400 });

    const movimentacoes = await getSheetData(RANGE, SPREADSHEET_ID);
    const index = movimentacoes.findIndex(m => Number(m.ID) === Number(body.ID));
    if (index === -1) return NextResponse.json({ error: "Movimentação não encontrada" }, { status: 404 });

    await deleteRow(RANGE, index, SPREADSHEET_ID);
    return NextResponse.json({ message: "Movimentação removida" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
