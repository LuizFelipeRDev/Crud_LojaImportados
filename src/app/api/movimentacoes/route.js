import { NextResponse } from "next/server";
import { getSheetData, appendRow, updateRow, deleteRow } from "../../dashboard/lib/googlesheets";

const SPREADSHEET_ID = "1Cy2LFNSrWw0O5thPjbeHfTTj0iZlSrDSVbuc-nBHi_Q";
const RANGE = "Movimentacoes!A1:H";
const PRODUTOS_RANGE = "Produtos!A1:G";

// ===========GET
export async function GET() {
  try {
    const rows = await getSheetData(RANGE, SPREADSHEET_ID);
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ==========POST
export async function POST(request) {
  try {
    const body = await request.json();
    const { NomeProduto, ValorUnitario, Quantidade, Periodo, Movimentacao } = body;

    // Validação
    const camposFaltando = [];
    if (!NomeProduto) camposFaltando.push("NomeProduto");
    if (!Quantidade) camposFaltando.push("Quantidade");
    if (ValorUnitario === undefined) camposFaltando.push("ValorUnitario");
    if (!Periodo) camposFaltando.push("Periodo");
    if (!Movimentacao) camposFaltando.push("Movimentacao");
    if (camposFaltando.length > 0) {
      return NextResponse.json(
        { error: `Campos obrigatórios ausentes: ${camposFaltando.join(", ")}` },
        { status: 400 }
      );
    }

    const formatDataBR = (isoDate) => {
      const [ano, mes, dia] = String(isoDate).split("-");
      return `${dia}/${mes}/${ano}`;
    };

    // pega produtos
    const produtos = await getSheetData(PRODUTOS_RANGE, SPREADSHEET_ID);
    const produto = produtos.find((p) => p.Nome === NomeProduto);
    if (!produto) {
      return NextResponse.json(
        { error: `Produto '${NomeProduto}' não encontrado` },
        { status: 404 }
      );
    }

    const ProdutoID = produto.ID;
    const valorUnitarioNum = Number(String(ValorUnitario).replace(",", "."));
    const quantidadeNum = Number(String(Quantidade).replace(",", "."));
    const ValorTotal = valorUnitarioNum * quantidadeNum;
    const PeriodoFormatado = formatDataBR(Periodo);

    const estoqueAtual = Number(String(produto.Unidade).replace(",", "."));
    let novoEstoque;
    if (Movimentacao === "Compra") {
      novoEstoque = estoqueAtual + quantidadeNum;
    } else if (Movimentacao === "Venda") {
      if (quantidadeNum > estoqueAtual) {
        return NextResponse.json(
          {
            error: `Estoque insuficiente para '${NomeProduto}'. Disponível: ${estoqueAtual}, solicitado: ${quantidadeNum}`,
          },
          { status: 400 }
        );
      }
      novoEstoque = estoqueAtual - quantidadeNum;
    } else {
      return NextResponse.json(
        { error: `Tipo de movimentação inválido: ${Movimentacao}` },
        { status: 400 }
      );
    }

    const linhaProduto = produtos.findIndex((p) => p.ID === ProdutoID);
    if (linhaProduto === -1) {
      return NextResponse.json(
        { error: "Linha do produto não encontrada para atualização" },
        { status: 500 }
      );
    }

    const linhaAtual = produtos[linhaProduto];

        // Monta array na ordem dos headers da aba Produtos!!!!!EVITABUG em FORNCEDORES
    const headers = ["ID", "Nome", "Fornecedores", "Categoria", "Marca", "Unidade", "Ativo"];

    // Monta array na ordem correta
    const updateArray = headers.map((h) =>
      h === "Unidade" ? String(novoEstoque) : (linhaAtual[h] ?? "")
    );

   

    try {
      await updateRow(updateArray, linhaProduto + 2, SPREADSHEET_ID, PRODUTOS_RANGE);
    } catch (err) {
      console.error("Erro ao atualizar produto:", err);
      return NextResponse.json(
        { error: "Falha ao atualizar estoque do produto." },
        { status: 500 }
      );
    }

    // Gera novo ID de movimentação
    const movimentacoes = await getSheetData(RANGE, SPREADSHEET_ID);
    const idsExistentes = movimentacoes
      .map((row) => Number(row["Mov ID"]))
      .filter((id) => !isNaN(id) && id > 0);
    const nextID = idsExistentes.length > 0 ? Math.max(...idsExistentes) + 1 : 1;

    const newRow = [
      ProdutoID,
      NomeProduto,
      quantidadeNum,
      valorUnitarioNum,
      ValorTotal,
      PeriodoFormatado,
      Movimentacao,
      nextID,
    ];

    try {
      await appendRow(newRow, SPREADSHEET_ID, RANGE);
    } catch (err) {
      console.error("Erro ao registrar movimentação:", err);
      return NextResponse.json(
        { error: "Falha ao registrar movimentação." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Movimentação registrada e estoque atualizado",
      movimentacao: newRow,
      novoEstoque,
    });
  } catch (err) {
    console.error("Erro inesperado ao adicionar movimentação:", err);
    return NextResponse.json({ error: "Erro interno: " + err.message }, { status: 500 });
  }
}




// ==========DELETE
export async function DELETE(request) {
  try {
    const body = await request.json();
    const movimentacaoId = body.ID;

    if (!movimentacaoId) {
      return NextResponse.json(
        { error: "ID da movimentação obrigatório" },
        { status: 400 }
      );
    }

    // Busca movimentações
    const movimentacoes = await getSheetData(RANGE, SPREADSHEET_ID);
    const index = movimentacoes.findIndex(
      (m) => Number(m["Mov ID"]) === Number(movimentacaoId)
    );
    if (index === -1) {
      return NextResponse.json(
        { error: "Movimentação não encontrada" },
        { status: 404 }
      );
    }

    const mov = movimentacoes[index];

    // Busca produto vinculado
    const produtos = await getSheetData(PRODUTOS_RANGE, SPREADSHEET_ID);
    const produto = produtos.find((p) => p.ID === mov["ID Produto"]);
    if (!produto) {
      return NextResponse.json(
        { error: "Produto vinculado não encontrado" },
        { status: 404 }
      );
    }

    // Ajuste do estoque
    const estoqueAtual = Number(String(produto.Unidade).replace(",", "."));
    const quantidadeMov = Number(String(mov.Quantidade).replace(",", "."));
    let novoEstoque;

    if (mov.Tipo === "Compra") {
      novoEstoque = estoqueAtual - quantidadeMov;
      if (novoEstoque < 0) {
        return NextResponse.json(
          {
            error: `Não é possível excluir. A reversão da compra deixaria o estoque negativo (${novoEstoque})`,
          },
          { status: 400 }
        );
      }
    } else if (mov.Tipo === "Venda") {
      novoEstoque = estoqueAtual + quantidadeMov;
    } else {
      return NextResponse.json(
        { error: `Tipo de movimentação inválido: ${mov.Tipo}` },
        { status: 400 }
      );
    }

    // Localiza linha do produto
    const linhaProduto = produtos.findIndex((p) => p.ID === produto.ID);
    if (linhaProduto === -1) {
      return NextResponse.json(
        { error: "Linha do produto não encontrada para reversão" },
        { status: 500 }
      );
    }

    // Atualiza unidade
    produto.Unidade = String(novoEstoque);

    // Monta array na ordem dos headers da aba Produtos!!!!!EVITABUG em FORNCEDORES
    const headers = ["ID", "Nome", "Fornecedores", "Categoria", "Marca", "Unidade", "Ativo"];
    const updateArray = headers.map((h) => produto[h] ?? "");

    // Atualiza planilha
    await updateRow(updateArray, linhaProduto + 2, SPREADSHEET_ID, PRODUTOS_RANGE);

    // Remove movimentação
    await deleteRow(RANGE, index, SPREADSHEET_ID);

    return NextResponse.json({
      message: "Movimentação removida e estoque revertido",
      estoqueAnterior: estoqueAtual,
      estoqueAtualizado: novoEstoque,
    });
  } catch (err) {
    console.error("Erro ao excluir movimentação:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
