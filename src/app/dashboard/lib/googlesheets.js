import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: SCOPES,
});

// -----------------------------------
// GET: Ler dados da planilha
// -----------------------------------
export async function getSheetData(range, spreadsheetId) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values;

  if (!rows || rows.length === 0) return [];

  const headers = rows[0];
  return rows.slice(1).map((row) =>
    headers.reduce((acc, header, i) => {
      acc[header] = row[i] ?? "";
      return acc;
    }, {})
  );
}

// -----------------------------------
// POST: Adicionar uma nova linha
// -----------------------------------
export async function appendRow(obj, spreadsheetId, range) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const row = Object.values(obj); // transforma objeto em array

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });

  return row;
}

// -----------------------------------
// PUT: Atualizar uma linha existente
// -----------------------------------
export async function updateRow(rowData, rowIndex, spreadsheetId, rangeBase) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  // Proteção contra sobrescrever cabeçalho
  if (rowIndex < 2) {
    throw new Error("Tentativa de sobrescrever o cabeçalho da planilha");
  }

  // Define a ordem das colunas da aba Produtos
  const colunasProdutos = ["ID", "Nome", "Aliquota", "Categoria", "Marca", "Unidade", "Ativo"];

  // Se for objeto, converte para array na ordem correta
  const rowArray = Array.isArray(rowData)
    ? rowData
    : colunasProdutos.map((col) => rowData[col] ?? "");

  const range = `${rangeBase.split("!")[0]}!A${rowIndex}:G${rowIndex}`;
  const values = [rowArray];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  return values;
}

// -----------------------------------
// DELETE: Deletar uma linha
// -----------------------------------
export async function deleteRow(range, rowIndex, spreadsheetId) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = meta.data.sheets.find(
    (s) => s.properties.title === range.split("!")[0]
  );
  const sheetId = sheet.properties.sheetId;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex + 1,
              endIndex: rowIndex + 2,
            },
          },
        },
      ],
    },
  });

  return true;
}
