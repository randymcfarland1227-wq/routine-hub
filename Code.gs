/**
 * Backend for the Routines site. Paste this into Extensions > Apps Script on the
 * "Routines" spreadsheet, then deploy as a Web App (see SETUP.md).
 *
 * Endpoints (all on the same Web App URL):
 *   GET  ?action=observations              -> [{id, observation, action}]
 *   GET  ?action=reviews                   -> [{date, category, serving, roadblocks, why, notes}]
 *   POST {action:'addObservation', observation, practice} -> {id, observation, action}
 *   POST {action:'deleteObservation', id}
 *   POST {action:'addReview', date, category, serving, roadblocks, why, notes}
 */

var OBSERVATIONS_SHEET_NAME = 'Observations';
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

  if (action === 'addObservation') return jsonOut(addObservation(body.observation, body.practice));
  if (action === 'deleteObservation') return jsonOut(deleteObservation(body.id));
  if (action === 'addReview') return jsonOut(addReview(body));

  return jsonOut({ error: 'unknown action' });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------
// Observations — reuses your existing "Observations" tab. Finds the
// header row by scanning for a cell that says "Observation", so it
// works with your current layout without needing to rearrange anything.
// ---------------------------------------------------------------------

function findObservationsLayout() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(OBSERVATIONS_SHEET_NAME);
  if (!sheet) throw new Error('No "' + OBSERVATIONS_SHEET_NAME + '" tab found.');

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
        return { sheet: sheet, headerRow: r, idCol: idCol, obsCol: obsCol, actionCol: actionCol };
      }
    }
  }
  throw new Error('Could not find an "Observation" header in the ' + OBSERVATIONS_SHEET_NAME + ' tab.');
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
    out.push({ id: id, observation: obs, action: act });
  }
  return out;
}

function addObservation(observation, practice) {
  var layout = findObservationsLayout();
  var sheet = layout.sheet;
  var row = sheet.getLastRow() + 1;
  var id = new Date().getTime();
  sheet.getRange(row, layout.idCol + 1).setValue(id);
  sheet.getRange(row, layout.obsCol + 1).setValue(observation);
  sheet.getRange(row, layout.actionCol + 1).setValue(practice);
  return { id: id, observation: observation, action: practice };
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
// Bi-weekly reviews — auto-creates a "Reviews" tab the first time it's used.
// ---------------------------------------------------------------------

function getReviewsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(REVIEWS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(REVIEWS_SHEET_NAME);
    sheet.appendRow(['Date', 'Category', 'Serving Me', 'Roadblocks', 'Why Reminder', 'Notes']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getReviews() {
  var sheet = getReviewsSheet();
  var data = sheet.getDataRange().getValues();
  var out = [];
  for (var r = 1; r < data.length; r++) {
    if (!data[r][0] && !data[r][1]) continue;
    out.push({
      date: formatDate(data[r][0]),
      category: data[r][1],
      serving: data[r][2],
      roadblocks: data[r][3],
      why: data[r][4],
      notes: data[r][5],
    });
  }
  return out;
}

function addReview(body) {
  var sheet = getReviewsSheet();
  sheet.appendRow([body.date, body.category, body.serving, body.roadblocks, body.why, body.notes]);
  return { ok: true };
}

function formatDate(val) {
  if (Object.prototype.toString.call(val) === '[object Date]') {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return val;
}
