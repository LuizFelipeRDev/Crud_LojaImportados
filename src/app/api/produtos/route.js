import { NextResponse } from "next/server";
import { getSheetData, appendRow, updateRow, deleteRow } from "../../dashboard/lib/googlesheets";

const SPREADSHEET_ID = "1Cy2LFNSrWw0O5thPjbeHfTTj0iZlSrDSVbuc-nBHi_Q";
const RANGE = "Produtos!A1:H"; // Adicionada a coluna H para ValorUnitario

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

        if (!body.Nome || !body.Aliquota || !body.Categoria) {
            return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
        }

        const produtos = await getSheetData(RANGE, SPREADSHEET_ID);
        let nextId = produtos.length > 0 ? Math.max(...produtos.map(p => Number(p.ID))) + 1 : 1;

        const newProduct = {
            ID: nextId,
            Nome: body.Nome,
            Aliquota: body.Aliquota,
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
        if (index === -1) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

        const updatedRow = [
            produtoId,
            body.Nome || produtos[index].Nome,
            body.Aliquota || produtos[index].Aliquota,
            body.Categoria || produtos[index].Categoria,
            body.Marca !== undefined ? body.Marca : produtos[index].Marca,
            body.Unidade !== undefined ? body.Unidade : produtos[index].Unidade,
            body.Ativo !== undefined ? body.Ativo : produtos[index].Ativo,
        ];

        const rowNumber = index + 2;
        const rangeForUpdate = `Produtos!A${rowNumber}:H${rowNumber}`;
        await updateRow(SPREADSHEET_ID, rangeForUpdate, [updatedRow]);

        return NextResponse.json({ message: "Produto atualizado", produto: updatedRow });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE: Remover produto
export async function DELETE(request) {
    try {
        const body = await request.json();
        if (!body.ID) return NextResponse.json({ error: "ID do produto obrigatório" }, { status: 400 });

        const produtos = await getSheetData(RANGE, SPREADSHEET_ID);
        const index = produtos.findIndex(p => Number(p.ID) === Number(body.ID));
        if (index === -1) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

        await deleteRow(RANGE, index, SPREADSHEET_ID);
        return NextResponse.json({ message: "Produto removido" });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
