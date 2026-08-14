/**
 * Backend for the Routines site. Paste this into Extensions > Apps Script on the
 * "Routines" spreadsheet, then deploy as a Web App (see SETUP.md).
 *
 * Endpoints (all on the same Web App URL):
 *   GET  ?action=observations   -> [{id, date, category, routine, observation, action}]
 *   GET  ?action=reviews        -> [{date, category, routine, serving, notes, why}]
 *   POST {action:'addObservation', observation, practice, category, routine} -> the new row
 *   POST {action:'deleteObservation', id}
 *   POST {action:'addReviewBatch', rows:[{date, category, routine, serving, notes, why}, ...]}
 */

var REVIEWS_SHEET_NAME = 'Reviews';

function doGet(e) {
  var action = e.parameter.action;
  if (action === 'observations') return jsonOut(getObservations());
  if (action === 'reviews') return jsonOut(getReviews());
  return jsonOut({ error: 'unknown action' });
}

function doPost(e) {
  var body = JSON.parse(e.postData.contents);
  var action = body.action;

  if (action === 'addObservation') return jsonOut(addObservation(body));
  if (action === 'deleteObservation') return jsonOut(deleteObservation(body.id));
  if (action === 'addReviewBatch') return jsonOut(addReviewBatch(body.rows || []));

  return jsonOut({ error: 'unknown action' });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------
// Observations — reuses your existing "Observation"/"Action" columns
// (wherever they are) and adds Date/Category/Routine columns next to
// them the first time it runs, if they don't already exist. Existing
// rows are left untouched; new columns are blank for old entries.
// ---------------------------------------------------------------------

function findObservationsLayout() {
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  for (var s = 0; s < sheets.length; s++) {
    var sheet = sheets[s];
    var data = sheet.getDataRange().getValues();
    for (var r = 0; r < data.length; r++) {
      for (var c = 0; c < data[r].length; c++) {
        var val = String(data[r][c]).trim().toLowerCase();
        if (val === 'observation') {
          var obsCol = c;
          var idCol = c - 1 >= 0 ? c - 1 : c;
          var actionCol = -1;
          for (var c2 = c + 1; c2 < data[r].length; c2++) {
            if (String(data[r][c2]).trim().toLowerCase().indexOf('action') === 0) { actionCol = c2; break; }
          }
          if (actionCol === -1) actionCol = c + 1;

          var headerRowVals = data[r];
          var nextFree = Math.max(obsCol, actionCol) + 1;
          var dateCol = findOrCreateCol(sheet, headerRowVals, r, 'Date', nextFree); nextFree = Math.max(nextFree, dateCol + 1);
          var categoryCol = findOrCreateCol(sheet, headerRowVals, r, 'Category', nextFree); nextFree = Math.max(nextFree, categoryCol + 1);
          var routineCol = findOrCreateCol(sheet, headerRowVals, r, 'Routine', nextFree); nextFree = Math.max(nextFree, routineCol + 1);

          return { sheet: sheet, headerRow: r, idCol: idCol, obsCol: obsCol, actionCol: actionCol, dateCol: dateCol, categoryCol: categoryCol, routineCol: routineCol };
        }
      }
    }
  }
  throw new Error('Could not find a tab with an "Observation" column header anywhere in this spreadsheet.');
}

// Looks for `name` in the given header row; if missing, writes it at `fallbackCol` and returns that index (0-based).
function findOrCreateCol(sheet, headerRowVals, headerRowIdx, name, fallbackCol) {
  for (var c = 0; c < headerRowVals.length; c++) {
    if (String(headerRowVals[c]).trim().toLowerCase() === name.toLowerCase()) return c;
  }
  sheet.getRange(headerRowIdx + 1, fallbackCol + 1).setValue(name);
  return fallbackCol;
}

function getObservations() {
  var layout = findObservationsLayout();
  var sheet = layout.sheet;
  var last = sheet.getLastRow();
  var out = [];
  for (var r = layout.headerRow + 2; r <= last; r++) {
    var obs = sheet.getRange(r, layout.obsCol + 1).getValue();
    var act = sheet.getRange(r, layout.actionCol + 1).getValue();
    if (!obs && !act) continue;
    var id = sheet.getRange(r, layout.idCol + 1).getValue();
    if (!id) { id = r; sheet.getRange(r, layout.idCol + 1).setValue(id); }
    out.push({
      id: id,
      observation: obs,
      action: act,
      date: formatDate(sheet.getRange(r, layout.dateCol + 1).getValue()),
      category: sheet.getRange(r, layout.categoryCol + 1).getValue(),
      routine: sheet.getRange(r, layout.routineCol + 1).getValue(),
    });
  }
  return out;
}

function addObservation(body) {
  var layout = findObservationsLayout();
  var sheet = layout.sheet;
  var row = sheet.getLastRow() + 1;
  var id = new Date().getTime();
  var date = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  sheet.getRange(row, layout.idCol + 1).setValue(id);
  sheet.getRange(row, layout.obsCol + 1).setValue(body.observation);
  sheet.getRange(row, layout.actionCol + 1).setValue(body.practice);
  sheet.getRange(row, layout.dateCol + 1).setValue(date);
  sheet.getRange(row, layout.categoryCol + 1).setValue(body.category || '');
  sheet.getRange(row, layout.routineCol + 1).setValue(body.routine || '');
  return { id: id, observation: body.observation, action: body.practice, date: date, category: body.category || '', routine: body.routine || '' };
}

function deleteObservation(id) {
  var layout = findObservationsLayout();
  var sheet = layout.sheet;
  var last = sheet.getLastRow();
  for (var r = layout.headerRow + 2; r <= last; r++) {
    var rowId = sheet.getRange(r, layout.idCol + 1).getValue();
    if (String(rowId) === String(id)) {
      sheet.deleteRow(r);
      return { ok: true };
    }
  }
  return { ok: false };
}

// ---------------------------------------------------------------------
// Bi-weekly reviews — one row per routine per review session. Auto-
// creates/migrates the "Reviews" tab (safe to reset the header while
// it's still empty).
// ---------------------------------------------------------------------

var REVIEWS_HEADERS = ['Date', 'Category', 'Routine', 'Serving Me', 'Notes', 'Why Reminder'];

function getReviewsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(REVIEWS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(REVIEWS_SHEET_NAME);
    sheet.appendRow(REVIEWS_HEADERS);
    sheet.setFrozenRows(1);
    return sheet;
  }
  // Migrate old category-level schema -> per-routine schema, only if no real data has been saved yet.
  if (sheet.getLastRow() <= 1) {
    sheet.clear();
    sheet.appendRow(REVIEWS_HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getReviews() {
  var sheet = getReviewsSheet();
  var data = sheet.getDataRange().getValues();
  var out = [];
  for (var r = 1; r < data.length; r++) {
    if (!data[r][0] && !data[r][1] && !data[r][2]) continue;
    out.push({
      date: formatDate(data[r][0]),
      category: data[r][1],
      routine: data[r][2],
      serving: data[r][3],
      notes: data[r][4],
      why: data[r][5],
    });
  }
  return out;
}

function addReviewBatch(rows) {
  if (!rows.length) return { ok: true, count: 0 };
  var sheet = getReviewsSheet();
  var values = rows.map(function (row) {
    return [row.date, row.category, row.routine, row.serving, row.notes, row.why];
  });
  sheet.getRange(sheet.getLastRow() + 1, 1, values.length, REVIEWS_HEADERS.length).setValues(values);
  return { ok: true, count: values.length };
}

function formatDate(val) {
  if (Object.prototype.toString.call(val) === '[object Date]') {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return val;
}
