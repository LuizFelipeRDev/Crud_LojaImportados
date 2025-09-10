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

  // Transforma objeto em array de valores
  const row = Object.values(obj);

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
export async function updateRow(spreadsheetId, range, row) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  // Garantir que 'row' é um array de arrays
  const values = Array.isArray(row[0]) ? row : [row];

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

  // Buscar sheetId da aba
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
              startIndex: rowIndex + 1, // pula header
              endIndex: rowIndex + 2,
            },
          },
        },
      ],
    },
  });

  return true;
}
