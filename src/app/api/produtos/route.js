import { NextResponse } from "next/server";
import { getSheetData, appendRow, updateRow, deleteRow } from "../../dashboard/lib/googlesheets";

const SPREADSHEET_ID = "1Cy2LFNSrWw0O5thPjbeHfTTj0iZlSrDSVbuc-nBHi_Q";
const RANGE = "Produtos!A1:H";
const MOV_RANGE = "Movimentacoes!A1:H";

// GET: Listar todos os produtos
export async function GET() {
  try {
    const rows = await getSheetData(RANGE, SPREADSHEET_ID);
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Adicionar um novo produto
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.Nome || !body.Fornecedores || !body.Categoria) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    const produtos = await getSheetData(RANGE, SPREADSHEET_ID);
    const nextId = produtos.length > 0 ? Math.max(...produtos.map(p => Number(p.ID))) + 1 : 1;

    const newProduct = {
      ID: String(nextId),
      Nome: body.Nome,
      Fornecedores: body.Fornecedores,
      Categoria: body.Categoria,
      Marca: body.Marca || "",
      Unidade: body.Unidade || "",
      Ativo: body.Ativo !== undefined ? body.Ativo : "Sim",
    };

    await appendRow(newProduct, SPREADSHEET_ID, RANGE);
    return NextResponse.json({ message: "Produto adicionado", produto: newProduct });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Atualizar produto

export async function PUT(request) {
  try {
    const body = await request.json();
    const produtoId = body.ID ?? body.id;

    if (!produtoId) {
      return NextResponse.json({ error: "ID do produto obrigatório" }, { status: 400 });
    }

    const produtos = await getSheetData(RANGE, SPREADSHEET_ID);
    const index = produtos.findIndex(p => Number(p.ID) === Number(produtoId));
    if (index === -1) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const produtoOriginal = produtos[index];

    const updatedRow = {
      ID: String(produtoId),
      Nome: body.Nome !== undefined ? body.Nome : produtoOriginal.Nome,
      Fornecedores: body.Fornecedores !== undefined ? body.Fornecedores : produtoOriginal.Fornecedores,
      Categoria: body.Categoria !== undefined ? body.Categoria : produtoOriginal.Categoria,
      Marca: body.Marca !== undefined ? body.Marca : produtoOriginal.Marca,
      Unidade: body.Unidade !== undefined ? body.Unidade : produtoOriginal.Unidade,
      Ativo: body.Ativo !== undefined ? body.Ativo : produtoOriginal.Ativo,
    };

    const rowNumber = index + 2; // +2 porque A1 é o cabeçalho

    // Converte o objeto em array na ordem correta
    const rowValues = [
      updatedRow.ID,
      updatedRow.Nome,
      updatedRow.Fornecedores,
      updatedRow.Categoria,
      updatedRow.Marca,
      updatedRow.Unidade,
      updatedRow.Ativo,
    ];

    await updateRow(rowValues, rowNumber, SPREADSHEET_ID, RANGE);

    return NextResponse.json({ message: "Produto atualizado com sucesso", produto: updatedRow });
  } catch (err) {
    console.error("Erro no PUT /api/produtos:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remover produto
export async function DELETE(request) {
  try {
    const body = await request.json();
    const produtoId = Number(body.ID);
    if (!produtoId) {
      return NextResponse.json({ error: "ID do produto obrigatório" }, { status: 400 });
    }

    const produtos = await getSheetData(RANGE, SPREADSHEET_ID);
    const index = produtos.findIndex(p => Number(p.ID) === produtoId);
    if (index === -1) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const produto = produtos[index];
    const movimentacoes = await getSheetData(MOV_RANGE, SPREADSHEET_ID);

    const temMovimentacao = movimentacoes.some(
      m => Number(m["ID Produto"]) === produtoId
    );

    if (temMovimentacao) {
      return NextResponse.json({
        error: `Produto '${produto.Nome}' possui movimentações registradas e não pode ser excluído.`
      }, { status: 400 });
    }

    await deleteRow(RANGE, index, SPREADSHEET_ID);
    return NextResponse.json({ message: "Produto removido com sucesso" });
  } catch (err) {
    console.error("Erro no DELETE /api/produtos:", err);
    return NextResponse.json({ error: "Erro interno ao excluir produto" }, { status: 500 });
  }
}
