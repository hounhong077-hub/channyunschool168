// ============================================================
//  CYIS ATTENDANCE SYSTEM — BACKEND v11.5 (FINAL)
// ============================================================

const SPREADSHEET_IDS = {
  gep:      '1zY1pSFHXqVP8bDNjpdRhnFNzc9f5ZjRVXJ94ANDDe9c',
  fulltime: '1NhPpQsrYdckIA0fl9zWeUCLd7nLGsdZTRMYCa_kGHKw'
};
const USER_LOGIN_SHEET_ID = '17XSeNzoVt9pDqWVN7w0HjAOERV2selM6jxcPkd-n4co';
const CAMPUS_SPREADSHEETS = {
  1: '1JaYr0Hr8Fdbg9Fff2VDiIYDbZqVxYMY56BIWDqdC76I',
  2: '1GoOBvzUUg34oDV6rG4iBVM8mVvopv9-upKcB6DwJ0m0',
  3: '1xSOUHCdcGOjJDZZfxctBYFQEma61vRvMMAWvQFftzHQ',
  4: '1968WTVWyvPWfAckVQL_kktQF3kwqaVU1TIumuqJ5_7A'
};
const CAMPUS_IDS = [1, 2, 3, 4];
const PHOTO_PARENT_FOLDER_ID = '1UzPePdQXTA432TAZ6WXqsU3LuHOf5Llf';
const USER_PROFILE_PHOTOS_FOLDER_ID = '1GK4pGsZbX3gsb8_Pl3DBRj7TpsCZym9s';
const SHEET_NAME_PROBLEMS  = 'សិស្សមានបញ្ហា';
const SHEET_NAME_LATE      = '⏰ សិស្សមករៀនយឺត';
const SHOES_SHEET_NAME     = '👟 ស្បែកជើងសិស្ស';
const HONORROLL_SHEET_NAME = '🏆 តារាងកិត្តិយស';
const PROFILE_PHOTO_NAME_TEMPLATE = '{teacher}';
const DATABASE_SPREADSHEET_ID   = '1KLoWnanIjn6OZesUxll-G6Fvtc09g4rszLgj-0CR1Vk';
const DATABASE_SPREADSHEET_NAME = 'Yearly Attendance';
const MIRROR_SPREADSHEET_ID     = '1VuZcPFqJmfbuMLENbF2ZYKFM4O9RdfERF03R3eCaDIk';
const CLASS_ROW_TITLE      = 1;
const CLASS_ROW_META       = 2;
const CLASS_ROW_MONTHS     = 3;
const CLASS_ROW_HEADER     = 4;
const CLASS_ROW_DATA_START = 5;
const COL_NO            = 1;
const COL_ID            = 2;
const COL_KHMER         = 3;
const COL_ENGLISH       = 4;
const COL_SEX           = 5;
const COL_CLASS         = 6;
const COL_MONTHS_START  = 7;
const COL_MONTHS_END    = COL_MONTHS_START + 47;
const COL_TOTAL_L       = 55;
const COL_TOTAL_U       = 56;
const COL_TOTAL_E       = 57;
const COL_GRAND_TOTAL   = 58;
const SHEET_TOTAL_COLS  = 58;
const MONTH_ORDER = ['September','October','November','December','January','February','March','April','May','June','July','August'];
const MONTH_COLORS = ['#9fc5e8','#f9cb9c','#b6d7a8','#ea9999','#b4a7d6','#a2c4c9','#ffe599','#f6b26b','#a4c2f4','#d5a6bd','#cccccc','#93c47d'];
const YEARLY_SYNC_PROGRAMS   = ['fulltime'];
const SOURCE_HEADER_ROW      = 4;
const SOURCE_STUDENT_START   = 8;
const SOURCE_STUDENT_END     = 120;
const SOURCE_STUDENT_COUNT   = SOURCE_STUDENT_END - SOURCE_STUDENT_START + 1;
const SOURCE_MONTH_START_COL = 42;
const DB_REMOVED_SHEETS = ['📊 Yearly Attendance', '📋 Class Index'];
const USER_MASTER_CACHE_KEY = 'cyis_master_rows_v8';
const USER_MASTER_CACHE_TTL = 60;
const FACE_THUMB_SIZE      = 160;
const FACE_THUMB_CACHE_TTL = 24 * 3600;
const CACHE_DURATION = 300000;
var sheetsCache = {}, sheetsCacheTime = {}, studentsCache = {}, studentsCacheTime = {}, attendanceCache = {}, attendanceCacheTime = {}, monthlyReportCache = {}, photoMapCache = {}, photoMapCacheTime = {}, honorRollCache = {}, honorRollCacheTime = {};

function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  if (p.s === '1' || p.student === '1') {
    var t = HtmlService.createTemplateFromFile('StudentView');
    t.studentId = p.i || p.id || ''; t.className = p.c || p.cls || ''; t.programType = p.p || p.prog || 'gep';
    return t.evaluate().setTitle('CYIS Student').addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  return HtmlService.createHtmlOutputFromFile('AttendanceDashboard').setFaviconUrl('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjR9cK7_BjbUQ4THtiR6iLjRdc3TN7o8kTPD7k91b70ixGvhTAdEYFVOnoN1TlSB2LZEX_PNoBOKDOyYtg94vVlATxh7jpWk6ngIY45Ym4S7RzwvnrEyWDDeGX5DkDqfIDCqmXcOEqjZ0x-9xaWyLZ3XOGWeb-I7mc7s93BDsynlqGNuEBRVY0zfg6akWg/s1111/CYIS%20Png.png').setTitle('សម្រង់វត្តមានប្រចាំថ្ងៃ').addMetaTag('viewport', 'width=device-width, initial-scale=1').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function normalizeProgramKey_(p) { return String(p || '').toLowerCase().replace(/[^a-z]/g, ''); }
function normalizeParam_(v) { if (v === null || v === undefined) return ''; var s = String(v).replace(/\+/g, ' ').trim(); for (var k = 0; k < 2; k++) { var b = s; s = s.replace(/^["'""'']+|["'""'']+$/g, '').trim(); if (s === b) break; } return s; }
function squeezeSheetName_(s) { return String(s || '').normalize('NFC').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, '').replace(/[()（）\[\]{}'"''""`«»]/g, '').toLowerCase(); }
function getSpreadsheetForProgram(programType) { var sheetId = SPREADSHEET_IDS[normalizeProgramKey_(programType)]; if (!sheetId) return null; try { return SpreadsheetApp.openById(sheetId); } catch (e) { return null; } }
function getOrCreateSheet_(ss, sheetName) { if (!ss || !sheetName) return null; var sheet = ss.getSheetByName(sheetName); if (sheet) return sheet; try { return ss.insertSheet(sheetName); } catch (e) { return null; } }
function withLock_(fn) { var lock = LockService.getScriptLock(); try { lock.waitLock(30000); return fn(); } catch (e) { return { success: false, message: 'Lock timeout: ' + e }; } finally { try { lock.releaseLock(); } catch (e) {} } }
function formatDate_(d) { if (!d) return ''; if (typeof d === 'string') { var m = d.match(/^(\d{4}-\d{2}-\d{2})/); if (m) return m[1]; return d; } try { var dt = new Date(d); return dt.getFullYear() + '-' + (dt.getMonth() + 1).toString().padStart(2, '0') + '-' + dt.getDate().toString().padStart(2, '0'); } catch (e) { return d.toString(); } }
function getDateColumnByDay(d) { return (d >= 1 && d <= 31) ? 10 + d : null; }
function convertSheetNameToKhmerFolder_(n) { if (!n) return n; var s = n.toString().trim(); var g = s.match(/^Grade\s+(\d+)\s+([A-F])$/i); if (g) return 'កម្រិត ' + g[1] + ' ' + g[2].toUpperCase(); var k = s.match(/^Khmer\s+(K1[A-G])$/i); if (k) return 'មត្តេយ្យភាសាខ្មែរ ' + k[1].toUpperCase(); var e = s.match(/^English\s+(K1[A-G])$/i); if (e) return 'មត្តេយ្យភាសាអង់គ្លេស ' + e[1].toUpperCase(); return s; }
function verifyDatabaseSheetName() { try { var dbSS = SpreadsheetApp.openById(DATABASE_SPREADSHEET_ID); var name = dbSS.getName(); if (name !== DATABASE_SPREADSHEET_NAME) { return { success: false, message: 'Name mismatch: expected "' + DATABASE_SPREADSHEET_NAME + '" but found "' + name + '"' }; } return { success: true, message: '✅ Name verified: ' + name }; } catch (e) { return { success: false, message: 'Error: ' + e.toString() }; } }
function colLetter_(n) { var s = ''; while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
function driveThumbUrl_(fileId, size) { if (!fileId) return ''; return 'https://lh3.googleusercontent.com/d/' + fileId + '=w' + (size || 400); }

const SAVE_PROGRESS_KEY = 'cyis_save_progress';
function setSaveProgress_(pct, label) { try { CacheService.getScriptCache().put(SAVE_PROGRESS_KEY, JSON.stringify({ pct: Math.max(0, Math.min(100, Math.round(pct))), label: label || '', ts: Date.now() }), 180); } catch (e) {} }
function getSaveProgress() { try { var raw = CacheService.getScriptCache().get(SAVE_PROGRESS_KEY); if (raw) return JSON.parse(raw); } catch (e) {} return { pct: 0, label: 'Starting…', ts: 0 }; }
function saveAttendanceToDatabase() {
  var t0 = Date.now();
  try {
    setSaveProgress_(0, 'Preparing…');
    var MONTHS = ['September','October','November','December','January','February','March','April','May','June','July','August'];
    var monthIdx = (new Date().getMonth() + 4) % 12; var monthName = MONTHS[monthIdx];
    setSaveProgress_(1, 'Primary DB…'); var r1 = syncYearlyFastToId_('fulltime', DATABASE_SPREADSHEET_ID, 1, 50);
    if (!r1 || !r1.success) { setSaveProgress_(0, 'Failed'); return { success: false, message: '❌ Primary DB: ' + ((r1 && r1.message) || 'Sync failed') }; }
    setSaveProgress_(51, 'Mirror DB…'); var r2 = syncYearlyFastToId_('fulltime', MIRROR_SPREADSHEET_ID, 51, 95);
    if (!r2 || !r2.success) { setSaveProgress_(0, 'Failed'); return { success: false, message: '❌ Mirror DB: ' + ((r2 && r2.message) || 'Sync failed') }; }
    setSaveProgress_(100, 'Done'); var elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    var msg = '✅ Saved — ' + monthName + ' • DB: ' + r1.sheets + ' sheets, ' + r1.students + ' students • Mirror: ' + r2.sheets + ' sheets (' + elapsed + 's)';
    try { SpreadsheetApp.openById(SPREADSHEET_IDS.fulltime).toast(msg, '💾 Save Attendance', 6); } catch (e) {}
    return { success: true, message: msg, sheets: r1.sheets, mirrorSheets: r2.sheets, students: r1.students, month: monthName, elapsed: elapsed + 's' };
  } catch (e) { setSaveProgress_(0, 'Error'); return { success: false, message: '❌ Error: ' + e.toString() }; }
}
function syncYearlyFastToId_(programType, targetSpreadsheetId, pctStart, pctEnd) {
  return withLock_(function () {
    try {
      var program = programType || 'fulltime'; var sourceSS = getSpreadsheetForProgram(program); if (!sourceSS) throw new Error('Source spreadsheet not found');
      var targetSS = SpreadsheetApp.openById(targetSpreadsheetId); var classNames = getSheetsForProgram(program); var total = classNames.length;
      if (total === 0) return { success: true, sheets: 0, students: 0, created: 0, updated: 0, failed: 0 };
      var created = 0, updated = 0, failed = 0, totalStudents = 0; var span = (pctEnd - pctStart) || 1;
      for (var ci = 0; ci < total; ci++) {
        var className = classNames[ci]; var srcSheet = sourceSS.getSheetByName(className); if (!srcSheet) { failed++; continue; }
        try {
          var targetSheet = targetSS.getSheetByName(className); var isNew = !targetSheet;
          if (isNew) { targetSheet = targetSS.insertSheet(className); created++; } else { updated++; }
          var count = mirrorClassSheetFast_(targetSheet, srcSheet, className, isNew); totalStudents += count;
        } catch (e) { failed++; }
        var pct = pctStart + Math.round(((ci + 1) / total) * span); setSaveProgress_(pct, className + ' (' + (ci + 1) + '/' + total + ')');
      }
      return { success: true, sheets: total, created: created, updated: updated, failed: failed, students: totalStudents };
    } catch (e) { return { success: false, message: 'Error: ' + e.toString() }; }
  });
}
function mirrorClassSheetFast_(dbSheet, srcSheet, className, isNew) {
  if (dbSheet.getMaxColumns() < SHEET_TOTAL_COLS) { dbSheet.insertColumnsAfter(dbSheet.getMaxColumns(), SHEET_TOTAL_COLS - dbSheet.getMaxColumns()); }
  if (isNew) { writeHeaderLayout_(dbSheet, className); } else { try { dbSheet.getRange(CLASS_ROW_META, 1).setValue('Generated: ' + new Date().toLocaleString() + '  |  Class: ' + className); } catch (e) {} }
  var srcLastRow = srcSheet.getLastRow(); var dataStart = CLASS_ROW_DATA_START;
  if (srcLastRow < SOURCE_STUDENT_START) { var lastR0 = dbSheet.getLastRow(); if (lastR0 >= dataStart) { dbSheet.getRange(dataStart, 1, lastR0 - dataStart + 1, SHEET_TOTAL_COLS).clearContent(); } return 0; }
  var numStudents = Math.min(srcLastRow - (SOURCE_STUDENT_START - 1), SOURCE_STUDENT_COUNT);
  var studentBlock = srcSheet.getRange(SOURCE_STUDENT_START, 1, numStudents, 10).getValues();
  var apBlock; try { apBlock = srcSheet.getRange(SOURCE_STUDENT_START, SOURCE_MONTH_START_COL, numStudents, 48).getValues(); } catch (e) { apBlock = []; for (var zz = 0; zz < numStudents; zz++) apBlock.push(new Array(48).fill('')); }
  var outputRows = []; var studentCount = 0;
  for (var r = 0; r < studentBlock.length; r++) {
    var row = studentBlock[r]; var id = row[1]; if (!id || String(id).trim() === '') continue;
    var khmer = row[3] ? String(row[3]).trim() : ''; var english = row[2] ? String(row[2]).trim() : ''; var sex = row[4] ? String(row[4]).trim() : '';
    var outRow = [studentCount + 1, String(id).trim(), khmer, english, sex, className];
    var mrow = apBlock[r] || []; var sumL = 0, sumU = 0, sumE = 0;
    for (var mc = 0; mc < 48; mc++) { var v = mrow[mc]; outRow.push(v === null || v === undefined || v === '' ? '' : v); }
    for (var b = 0; b < 12; b++) {
      var base = b * 4; var lv = Number(mrow[base]), uv = Number(mrow[base + 1]), ev = Number(mrow[base + 2]);
      if (!isNaN(lv) && mrow[base] !== '' && mrow[base] !== null && mrow[base] !== undefined) sumL += lv;
      if (!isNaN(uv) && mrow[base + 1] !== '' && mrow[base + 1] !== null && mrow[base + 1] !== undefined) sumU += uv;
      if (!isNaN(ev) && mrow[base + 2] !== '' && mrow[base + 2] !== null && mrow[base + 2] !== undefined) sumE += ev;
    }
    outRow.push(sumL > 0 ? sumL : '', sumU > 0 ? sumU : '', sumE > 0 ? sumE : '', (sumL + sumU + sumE) > 0 ? (sumL + sumU + sumE) : '');
    outputRows.push(outRow); studentCount++;
  }
  var lastRow = dbSheet.getLastRow();
  if (lastRow >= dataStart) { var existingRows = lastRow - dataStart + 1; if (outputRows.length < existingRows) { try { dbSheet.getRange(dataStart + outputRows.length, 1, existingRows - outputRows.length, SHEET_TOTAL_COLS).clearContent(); } catch (e) {} } }
  if (outputRows.length > 0) { dbSheet.getRange(dataStart, 1, outputRows.length, SHEET_TOTAL_COLS).setValues(outputRows); }
  return studentCount;
}
function writeHeaderLayout_(dbSheet, className) {
  try { var maxRow = Math.max(dbSheet.getMaxRows(), 500); var maxCol = Math.max(SHEET_TOTAL_COLS, dbSheet.getMaxColumns()); try { var merges = dbSheet.getRange(1, 1, maxRow, maxCol).getMergedRanges(); for (var mm = 0; mm < merges.length; mm++) { try { merges[mm].breakApart(); } catch (e) {} } } catch (e) {} } catch (e) {}
  var titleRng = dbSheet.getRange(CLASS_ROW_TITLE, 1, 1, SHEET_TOTAL_COLS); try { titleRng.breakApart(); } catch (e) {} titleRng.merge();
  titleRng.setValue('📊 ' + className + ' — សម្រង់វត្តមានប្រចាំឆ្នាំ | Yearly Attendance').setFontWeight('bold').setFontSize(15).setBackground('#1e3a8a').setFontColor('#ffffff').setHorizontalAlignment('center').setVerticalAlignment('middle');
  dbSheet.setRowHeight(CLASS_ROW_TITLE, 40);
  var metaRng = dbSheet.getRange(CLASS_ROW_META, 1, 1, SHEET_TOTAL_COLS); try { metaRng.breakApart(); } catch (e) {} metaRng.merge();
  metaRng.setValue('Generated: ' + new Date().toLocaleString() + '  |  Class: ' + className).setFontStyle('italic').setFontSize(10).setBackground('#e0e7ff').setFontColor('#3730a3').setHorizontalAlignment('center').setVerticalAlignment('middle');
  dbSheet.setRowHeight(CLASS_ROW_META, 22);
  for (var m = 0; m < 12; m++) {
    var col = COL_MONTHS_START + (m * 4); var rng = dbSheet.getRange(CLASS_ROW_MONTHS, col, 1, 4); try { rng.breakApart(); } catch (e) {} rng.merge();
    rng.setValue(MONTH_ORDER[m].toUpperCase()).setBackground(MONTH_COLORS[m]).setFontWeight('bold').setFontColor('#000000').setHorizontalAlignment('center').setVerticalAlignment('middle').setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  }
  var sumRng = dbSheet.getRange(CLASS_ROW_MONTHS, COL_TOTAL_L, 1, 4); try { sumRng.breakApart(); } catch (e) {} sumRng.merge();
  sumRng.setValue('📊 YEARLY TOTALS').setBackground('#7c3aed').setFontColor('#ffffff').setFontWeight('bold').setFontSize(11).setHorizontalAlignment('center').setVerticalAlignment('middle').setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  dbSheet.setRowHeight(CLASS_ROW_MONTHS, 34);
  dbSheet.getRange(CLASS_ROW_HEADER, 1, 1, 6).setValues([['No.', 'ID', 'ឈ្មោះខ្មែរ', 'English Name', 'Sex', 'Class']]).setFontWeight('bold').setFontSize(11).setBackground('#2c7da0').setFontColor('#ffffff').setHorizontalAlignment('center').setVerticalAlignment('middle').setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);
  var monthHdr = []; for (var j = 0; j < 12; j++) monthHdr.push('L', 'U', 'E', 'Total');
  dbSheet.getRange(CLASS_ROW_HEADER, COL_MONTHS_START, 1, 48).setValues([monthHdr]).setFontWeight('bold').setFontSize(9).setBackground('#0891b2').setFontColor('#ffffff').setHorizontalAlignment('center').setVerticalAlignment('middle').setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);
  dbSheet.getRange(CLASS_ROW_HEADER, COL_TOTAL_L, 1, 4).setValues([['SUM L', 'SUM U', 'SUM E', 'GRAND']]).setFontWeight('bold').setFontSize(10).setBackground('#a855f7').setFontColor('#ffffff').setHorizontalAlignment('center').setVerticalAlignment('middle').setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  dbSheet.setRowHeight(CLASS_ROW_HEADER, 28);
  try { dbSheet.setFrozenRows(CLASS_ROW_HEADER); dbSheet.setFrozenColumns(COL_CLASS); } catch (e) {}
}

function getTopAbsentStudents(limit, programType, minTotal) {
  limit = Math.min(Math.max(Number(limit) || 100, 1), 500); programType = programType || 'fulltime'; minTotal = (minTotal === undefined || minTotal === null) ? 5 : Math.max(0, Number(minTotal));
  var cacheKey = 'cyis_top_absent_v4_' + programType + '_' + limit + '_' + minTotal; var persistKey = 'cyis_top_absent_persist_v4_' + programType + '_' + limit + '_' + minTotal;
  var cache = CacheService.getScriptCache(); var props = PropertiesService.getScriptProperties();
  try { var hit = cache.get(cacheKey); if (hit) { var p = JSON.parse(hit); p.fromCache = true; p.source = 'hot'; return p; } } catch (e) {}
  var result = null; try { result = buildTopAbsentBatch_(programType, limit, minTotal); } catch (e) { result = { success: false, message: String(e), students: [] }; }
  if (result && result.success) { try { cache.put(cacheKey, JSON.stringify(result), 7200); } catch (e) {} try { props.setProperty(persistKey, JSON.stringify(result)); } catch (e) {} return result; }
  try { var raw = props.getProperty(persistKey); if (raw) { var p2 = JSON.parse(raw); p2.fromCache = true; p2.stale = true; p2.source = 'persist'; return p2; } } catch (e) {}
  return buildTopAbsentSlow_(limit, programType, minTotal);
}
function buildTopAbsentBatch_(programType, limit, minTotal) {
  var ss = getSpreadsheetForProgram(programType); if (!ss) return { success: false, message: 'Source spreadsheet not found', students: [] };
  var classNames = getSheetsForProgram(programType); if (!classNames.length) return { success: true, students: [], count: 0, minTotal: minTotal, source: 'FullTime', generatedAt: Date.now() };
  var ranges = []; var classInfo = []; var cStartL = colLetter_(SOURCE_MONTH_START_COL); var cEndL = colLetter_(SOURCE_MONTH_START_COL + 47);
  for (var i = 0; i < classNames.length; i++) {
    var cn = classNames[i]; var sheet = ss.getSheetByName(cn); if (!sheet) continue;
    var lastRow = sheet.getLastRow(); if (lastRow < SOURCE_STUDENT_START) continue;
    var numStudents = Math.min(lastRow - (SOURCE_STUDENT_START - 1), SOURCE_STUDENT_COUNT); if (numStudents <= 0) continue;
    var safeName = "'" + cn.replace(/'/g, "''") + "'"; var startRow = SOURCE_STUDENT_START; var endRow = startRow + numStudents - 1;
    ranges.push(safeName + '!A' + startRow + ':J' + endRow); ranges.push(safeName + '!' + cStartL + startRow + ':' + cEndL + endRow); classInfo.push({ name: cn });
  }
  if (!ranges.length) return { success: true, students: [], count: 0, minTotal: minTotal, source: 'FullTime', generatedAt: Date.now() };
  var resp = null; try { if (typeof Sheets !== 'undefined' && Sheets.Spreadsheets && Sheets.Spreadsheets.Values) { resp = Sheets.Spreadsheets.Values.batchGet(ss.getId(), { ranges: ranges }); } } catch (e) { resp = null; }
  if (!resp || !resp.valueRanges) return buildTopAbsentSlow_(limit, programType, minTotal);
  var students = [];
  for (var ci = 0; ci < classInfo.length; ci++) {
    var cn2 = classInfo[ci].name; var rosterVR = resp.valueRanges[ci * 2]; var monthlyVR = resp.valueRanges[ci * 2 + 1];
    var roster = (rosterVR && rosterVR.values) || []; var monthly = (monthlyVR && monthlyVR.values) || [];
    for (var r = 0; r < roster.length; r++) {
      var row = roster[r]; if (!row) continue; var id = row[1]; if (id === null || id === undefined || String(id).trim() === '') continue;
      var mrow = monthly[r] || []; var sumL = 0, sumU = 0, sumE = 0;
      for (var mm = 0; mm < 12; mm++) {
        var base = mm * 4; var lv = Number(mrow[base]), uv = Number(mrow[base + 1]), ev = Number(mrow[base + 2]);
        if (!isNaN(lv) && mrow[base] !== undefined && mrow[base] !== '' && mrow[base] !== null) sumL += lv;
        if (!isNaN(uv) && mrow[base + 1] !== undefined && mrow[base + 1] !== '' && mrow[base + 1] !== null) sumU += uv;
        if (!isNaN(ev) && mrow[base + 2] !== undefined && mrow[base + 2] !== '' && mrow[base + 2] !== null) sumE += ev;
      }
      var total = sumL + sumU + sumE; if (total <= minTotal) continue;
      students.push({ id: String(id).trim(), khmerName: row[3] ? String(row[3]).trim() : '', englishName: row[2] ? String(row[2]).trim() : '', sex: row[4] ? String(row[4]).trim() : '', className: cn2, group: row[5] ? String(row[5]).trim() : '', dateOfBirth: row[7] ? String(row[7]).trim() : '', phone: row[8] ? String(row[8]).trim() : '', sumL: sumL, sumU: sumU, sumE: sumE, total: total });
    }
  }
  students.sort(function (a, b) { if (b.total !== a.total) return b.total - a.total; if (b.sumU !== a.sumU) return b.sumU - a.sumU; if (b.sumE !== a.sumE) return b.sumE - a.sumE; return b.sumL - a.sumL; });
  var top = students.slice(0, limit); return { success: true, students: top, count: top.length, minTotal: minTotal, source: 'FullTime', generatedAt: Date.now() };
}
function buildTopAbsentSlow_(limit, programType, minTotal) {
  limit = Math.min(Math.max(Number(limit) || 100, 1), 500); programType = programType || 'fulltime'; minTotal = (minTotal === undefined || minTotal === null) ? 5 : Math.max(0, Number(minTotal));
  try {
    var ss = getSpreadsheetForProgram(programType); if (!ss) return { success: false, message: 'Source spreadsheet not found', students: [] };
    var classNames = getSheetsForProgram(programType); var students = [];
    for (var ci = 0; ci < classNames.length; ci++) {
      var className = classNames[ci]; var sheet = ss.getSheetByName(className); if (!sheet) continue;
      var lastRow = sheet.getLastRow(); if (lastRow < SOURCE_STUDENT_START) continue;
      var numStudents = Math.min(lastRow - (SOURCE_STUDENT_START - 1), SOURCE_STUDENT_COUNT); if (numStudents <= 0) continue;
      var studentBlock, monthBlock; try { studentBlock = sheet.getRange(SOURCE_STUDENT_START, 1, numStudents, 10).getValues(); } catch (e) { continue; }
      try { monthBlock = sheet.getRange(SOURCE_STUDENT_START, SOURCE_MONTH_START_COL, numStudents, 48).getValues(); } catch (e) { monthBlock = []; for (var zz = 0; zz < numStudents; zz++) monthBlock.push(new Array(48).fill('')); }
      for (var r = 0; r < studentBlock.length; r++) {
        var row = studentBlock[r]; var id = row[1]; if (id === null || id === undefined || String(id).trim() === '') continue;
        var mrow = monthBlock[r] || []; var sumL = 0, sumU = 0, sumE = 0;
        for (var mm = 0; mm < 12; mm++) {
          var base = mm * 4; var lv = Number(mrow[base]), uv = Number(mrow[base + 1]), ev = Number(mrow[base + 2]);
          if (!isNaN(lv) && mrow[base] !== '' && mrow[base] !== null && mrow[base] !== undefined) sumL += lv;
          if (!isNaN(uv) && mrow[base + 1] !== '' && mrow[base + 1] !== null && mrow[base + 1] !== undefined) sumU += uv;
          if (!isNaN(ev) && mrow[base + 2] !== '' && mrow[base + 2] !== null && mrow[base + 2] !== undefined) sumE += ev;
        }
        students.push({ id: String(id).trim(), khmerName: row[3] ? String(row[3]).trim() : '', englishName: row[2] ? String(row[2]).trim() : '', sex: row[4] ? String(row[4]).trim() : '', className: className, group: row[5] ? String(row[5]).trim() : '', dateOfBirth: row[7] ? String(row[7]).trim() : '', phone: row[8] ? String(row[8]).trim() : '', sumL: sumL, sumU: sumU, sumE: sumE, total: sumL + sumU + sumE });
      }
    }
    students.sort(function (a, b) { if (b.total !== a.total) return b.total - a.total; if (b.sumU !== a.sumU) return b.sumU - a.sumU; if (b.sumE !== a.sumE) return b.sumE - a.sumE; return b.sumL - a.sumL; });
    var top = students.filter(function (s) { return s.total > minTotal; }).slice(0, limit);
    return { success: true, students: top, count: top.length, minTotal: minTotal, source: 'FullTime', generatedAt: Date.now() };
  } catch (e) { return { success: false, message: String(e), students: [] }; }
}

function getOrCreateSheetFolder_(sheetName) { var parent = DriveApp.getFolderById(PHOTO_PARENT_FOLDER_ID); var khmer = convertSheetNameToKhmerFolder_(sheetName); var it = parent.getFoldersByName(khmer); if (it.hasNext()) return it.next(); return parent.createFolder(khmer); }
function getStudentPhotoMap(sheetName) {
  if (!sheetName) return {}; var now = Date.now(); if (photoMapCache[sheetName] && (now - photoMapCacheTime[sheetName]) < CACHE_DURATION) return photoMapCache[sheetName];
  var map = {}; try { var folder = getOrCreateSheetFolder_(sheetName), files = folder.getFiles(); while (files.hasNext()) { var f = files.next(), mime = f.getMimeType() || ''; if (mime.indexOf('image/') !== 0) continue; var base = f.getName().replace(/\.[^.]+$/, '').toLowerCase().trim(); if (!base) continue; map[base] = { id: f.getId(), url: f.getUrl(), thumb: driveThumbUrl_(f.getId(), 200), updated: f.getLastUpdated().getTime() }; } } catch (e) {}
  photoMapCache[sheetName] = map; photoMapCacheTime[sheetName] = now; return map;
}
function clearPhotoCache() { photoMapCache = {}; photoMapCacheTime = {}; return { success: true }; }
function uploadStudentPhoto(sheetName, studentName, base64Data, mimeType) {
  return withLock_(function() {
    try {
      if (!sheetName || !studentName || !base64Data) return { success: false, message: 'Missing parameters' };
      mimeType = mimeType || 'image/jpeg'; if (mimeType.indexOf('image/') !== 0) return { success: false, message: 'Not an image' };
      var extMap = { 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/bmp': 'bmp' }; var ext = extMap[mimeType] || 'jpg';
      var safeName = studentName.toString().trim(); var fileName = safeName + '.' + ext; var folder = getOrCreateSheetFolder_(sheetName);
      var existing = folder.getFiles(), toDelete = []; while (existing.hasNext()) { var f = existing.next(); var base = f.getName().replace(/\.[^.]+$/, '').toLowerCase().trim(); if (base === safeName.toLowerCase()) toDelete.push(f); }
      for (var i = 0; i < toDelete.length; i++) { try { toDelete[i].setTrashed(true); } catch (e) {} }
      var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName); var file = folder.createFile(blob);
      try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
      delete photoMapCache[sheetName]; delete photoMapCacheTime[sheetName];
      return { success: true, message: 'Photo uploaded', fileId: file.getId(), url: file.getUrl(), thumb: driveThumbUrl_(file.getId(), 200) };
    } catch (e) { return { success: false, message: 'Error: ' + e.toString() }; }
  });
}
function sanitizeUserNameForFile_(name) { return String(name || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_').replace(/[^a-z0-9_\-]/g, '').replace(/^_+|_+$/g, ''); }
function resolveUserPhotoBaseCandidates_(username, phone) {
  var uLower = String(username || '').trim().toLowerCase(); var pTrim = String(phone || '').trim(); var teacher = '';
  try { var rows = loadMasterRows_(); if (pTrim) { for (var i = 0; i < rows.length; i++) { if (String(rows[i].phone || '').trim() === pTrim) { teacher = rows[i].teacherName || ''; break; } } } if (!teacher && uLower) { for (var j = 0; j < rows.length; j++) { if (String(rows[j].username || '').trim().toLowerCase() === uLower) { teacher = rows[j].teacherName || ''; if (teacher) break; } } } } catch (e) {}
  var tpl = PROFILE_PHOTO_NAME_TEMPLATE || '{teacher}'; var primary = tpl.replace(/\{teacher\}/g, teacher).replace(/\{username\}/g, String(username || '')).replace(/\{phone\}/g, pTrim); primary = sanitizeUserNameForFile_(primary);
  var list = [primary, sanitizeUserNameForFile_(teacher), sanitizeUserNameForFile_(phone), sanitizeUserNameForFile_(username)]; var seen = {}, out = [];
  for (var k = 0; k < list.length; k++) { if (list[k] && !seen[list[k]]) { seen[list[k]] = true; out.push(list[k]); } }
  if (!out.length) throw new Error('Cannot resolve filename base for user'); return out;
}
function loadMasterRows_() {
  var cache = CacheService.getScriptCache(); try { var hit = cache.get(USER_MASTER_CACHE_KEY); if (hit) { var parsed = JSON.parse(hit); if (parsed && parsed.rows) return parsed.rows; } } catch (e) {}
  var out = []; try { var ss = SpreadsheetApp.openById(USER_LOGIN_SHEET_ID); var sheet = ss.getSheetByName('Master'); if (sheet) { var lastRow = sheet.getLastRow(); if (lastRow >= 2) { var maxRow = Math.min(lastRow, 1200); var data = sheet.getRange(2, 1, maxRow - 1, 5).getValues(); for (var i = 0; i < data.length; i++) { var r = data[i]; var uname = r[1] ? String(r[1]).trim() : ''; var phone = r[2] ? String(r[2]).trim() : ''; var role = r[3] ? String(r[3]).trim().toLowerCase() : 'member'; var tname = r[4] ? String(r[4]).trim() : ''; if (!uname && !phone && !tname) continue; out.push({ rowIndex: i + 2, username: uname, phone: phone, role: role, teacherName: tname }); } } } } catch (e) { }
  try { cache.put(USER_MASTER_CACHE_KEY, JSON.stringify({ rows: out, ts: Date.now() }), USER_MASTER_CACHE_TTL); } catch (e) {} return out;
}
function invalidateMasterRowsCache_() { try { CacheService.getScriptCache().remove(USER_MASTER_CACHE_KEY); } catch (e) {} }
function getUserProfilePhotoMap() {
  const cacheKey = 'cyis_user_profile_map'; try { const cache = CacheService.getScriptCache(); const hit = cache.get(cacheKey); if (hit) return JSON.parse(hit); } catch (e) {}
  const map = {}; try { const folder = DriveApp.getFolderById(USER_PROFILE_PHOTOS_FOLDER_ID); const files = folder.getFiles(); while (files.hasNext()) { const f = files.next(); const mime = f.getMimeType() || ''; if (mime.indexOf('image/') !== 0) continue; const base = f.getName().replace(/\.[^.]+$/, '').toLowerCase().trim(); if (!base) continue; map[base] = { id: f.getId(), url: f.getUrl(), thumb: driveThumbUrl_(f.getId(), 400), fileName: f.getName(), updated: f.getLastUpdated().getTime() }; } } catch (e) { }
  try { CacheService.getScriptCache().put(cacheKey, JSON.stringify(map), 300); } catch (e) {} return map;
}
function getUserProfilePhoto(identifier, password) {
  try {
    var username = '', passwordIn = ''; if (identifier && typeof identifier === 'object') { username = identifier.username || ''; passwordIn = identifier.phone || identifier.password || ''; } else { username = identifier || ''; passwordIn = password || ''; }
    if (typeof username === 'string' && username.indexOf('|') !== -1 && !passwordIn) { var parts = username.split('|'); username = parts[0] || ''; passwordIn = parts[1] || ''; }
    var bases = []; try { bases = resolveUserPhotoBaseCandidates_(username, passwordIn); } catch (e) { return null; }
    var map = getUserProfilePhotoMap(); for (var b = 0; b < bases.length; b++) { if (map[bases[b]]) return map[bases[b]]; }
    var folder = DriveApp.getFolderById(USER_PROFILE_PHOTOS_FOLDER_ID); var files = folder.getFiles(); var seenBase = {}; for (var k = 0; k < bases.length; k++) seenBase[bases[k]] = true;
    while (files.hasNext()) { var f = files.next(); var mime = f.getMimeType() || ''; if (mime.indexOf('image/') !== 0) continue; var fBase = sanitizeUserNameForFile_(f.getName().replace(/\.[^.]+$/, '')); if (seenBase[fBase]) { return { id: f.getId(), url: f.getUrl(), thumb: driveThumbUrl_(f.getId(), 400), fileName: f.getName(), updated: f.getLastUpdated().getTime() }; } }
    return null;
  } catch (e) { return null; }
}
function uploadUserProfilePhoto(username, base64Data, mimeType) {
  return withLock_(function () {
    try {
      if (!username || !base64Data) return { success: false, message: 'Missing username or photo' };
      var actualUsername = username, phoneHint = ''; if (typeof username === 'string' && username.indexOf('|') !== -1) { var parts = username.split('|'); actualUsername = parts[0] || username; phoneHint = parts[1] || ''; }
      actualUsername = String(actualUsername).trim(); phoneHint = String(phoneHint).trim(); if (!actualUsername) return { success: false, message: 'Empty username' };
      mimeType = mimeType || 'image/jpeg'; if (mimeType.indexOf('image/') !== 0) return { success: false, message: 'Not an image' };
      const extMap = { 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/bmp': 'bmp' }; const ext = extMap[mimeType] || 'jpg';
      var candidates = []; try { candidates = resolveUserPhotoBaseCandidates_(actualUsername, phoneHint); } catch (e) { return { success: false, message: 'Could not resolve filename for ' + actualUsername }; }
      var primaryBase = candidates[0]; if (!primaryBase) return { success: false, message: 'Invalid filename base' };
      const folder = DriveApp.getFolderById(USER_PROFILE_PHOTOS_FOLDER_ID); const existing = folder.getFiles(); const toDelete = [];
      while (existing.hasNext()) { const f = existing.next(); const fBase = sanitizeUserNameForFile_(f.getName().replace(/\.[^.]+$/, '')); if (candidates.indexOf(fBase) !== -1) toDelete.push(f); }
      for (let i = 0; i < toDelete.length; i++) { try { toDelete[i].setTrashed(true); } catch (e) {} }
      const fileName = primaryBase + '.' + ext; const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName); const file = folder.createFile(blob);
      try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
      try { CacheService.getScriptCache().remove('cyis_user_profile_map'); } catch (e) {}
      return { success: true, message: 'Profile photo saved as ' + fileName, fileId: file.getId(), url: file.getUrl(), fileName: fileName, thumb: driveThumbUrl_(file.getId(), 400) };
    } catch (e) { return { success: false, message: 'Error: ' + e.toString() }; }
  });
}

function authenticateUser(username, phone) {
  try {
    var ss = SpreadsheetApp.openById(USER_LOGIN_SHEET_ID); var sheet = ss.getSheetByName('Master');
    if (!sheet) { sheet = ss.insertSheet('Master'); sheet.appendRow(['Number', 'Username', 'Phone', 'Role', "Teacher's Name"]); sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#2c7da0').setFontColor('#ffffff').setHorizontalAlignment('center'); sheet.appendRow(['1', 'Admin', '0000000000', 'admin', 'System Admin']); invalidateMasterRowsCache_(); return null; }
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var su = data[i][1] ? data[i][1].toString().trim() : ''; var sp = data[i][2] ? data[i][2].toString().trim() : ''; var role = data[i][3] ? data[i][3].toString().trim().toLowerCase() : 'member'; var tn = data[i][4] ? data[i][4].toString().trim() : '';
      if (su === username && sp === phone) {
        if (role === 'banned') return { username: username, phone: phone, role: 'banned', teacherName: tn };
        saveUserLoginRecord(username, phone, role, tn); var photo = getUserProfilePhoto(username, phone);
        return { username: username, phone: phone, role: role, teacherName: tn, profilePhotoUrl: photo ? photo.thumb : '', profilePhotoFullUrl: photo ? photo.url : '', profilePhotoFileName: photo ? (photo.fileName || '') : '', success: true };
      }
    } return null;
  } catch (e) { return null; }
}
function saveUserLoginRecord(username, phone, role, teacherName) { try { var ss = SpreadsheetApp.openById(USER_LOGIN_SHEET_ID); var sheet = ss.getSheetByName('User_Login_Records'); if (!sheet) { sheet = ss.insertSheet('User_Login_Records'); sheet.getRange(1, 1, 1, 8).setValues([['', 'Timestamp', 'Username', 'Phone', 'Role', "Teacher's Name", 'Login Time', 'Status']]); } var newRow = sheet.getLastRow() + 1; var ts = new Date().toLocaleString(); sheet.getRange(newRow, 2, 1, 7).setValues([[ts, username, phone, role, teacherName || '', ts, 'Login Successful']]); } catch (e) {} }
function verifyUserStatusQuiet(username, phone) { try { var ss = SpreadsheetApp.openById(USER_LOGIN_SHEET_ID); var sheet = ss.getSheetByName('Master'); if (!sheet) return null; var data = sheet.getDataRange().getValues(); for (var i = 1; i < data.length; i++) { var su = data[i][1] ? data[i][1].toString().trim() : ''; var sp = data[i][2] ? data[i][2].toString().trim() : ''; if (su === username && sp === phone) { var role = data[i][3] ? data[i][3].toString().trim().toLowerCase() : 'member'; var tn = data[i][4] ? data[i][4].toString().trim() : ''; var photo = getUserProfilePhoto(username, phone); return { username: username, phone: phone, role: role, teacherName: tn, profilePhotoUrl: photo ? photo.thumb : '', profilePhotoFullUrl: photo ? photo.url : '', profilePhotoFileName: photo ? (photo.fileName || '') : '', success: true }; } } return null; } catch (e) { return null; } }
function getSheetsForProgram(programType) { var now = Date.now(); if (sheetsCache[programType] && (now - sheetsCacheTime[programType]) < CACHE_DURATION) return sheetsCache[programType]; try { var ss = getSpreadsheetForProgram(programType); if (!ss) return []; var sheets = ss.getSheets(), names = []; var EXCLUDE = ['Absent_Records', 'Master', SHEET_NAME_PROBLEMS, SHEET_NAME_LATE, SHOES_SHEET_NAME, HONORROLL_SHEET_NAME, 'User_Login_Records']; for (var i = 0; i < sheets.length; i++) { if (EXCLUDE.indexOf(sheets[i].getName()) === -1) names.push(sheets[i].getName()); } sheetsCache[programType] = names; sheetsCacheTime[programType] = now; return names; } catch (e) { return []; } }
function getStudentsFromSheet(sheetName, programType) {
  var cacheKey = programType + '_' + sheetName, now = Date.now(); if (studentsCache[cacheKey] && (now - studentsCacheTime[cacheKey]) < CACHE_DURATION) return studentsCache[cacheKey];
  try { var ss = getSpreadsheetForProgram(programType); if (!ss) return []; var sheet = ss.getSheetByName(sheetName); if (!sheet) return []; var lastRow = sheet.getLastRow(); if (lastRow < 8) return []; var data = sheet.getRange(8, 1, lastRow - 7, 10).getValues(), students = []; for (var i = 0; i < data.length; i++) { var row = data[i], id = row[1]; if (id && id.toString().trim() !== '') { var sex = row[4] ? row[4].toString().trim() : ''; students.push({ id: id.toString().trim(), englishName: row[2] ? row[2].toString().trim() : '', khmerName: row[3] ? row[3].toString().trim() : '', sex: sex, gender: sex === 'M' ? 'ប្រុស' : (sex === 'F' ? 'ស្រី' : sex), group: row[5] ? row[5].toString().trim() : '', class: row[6] ? row[6].toString().trim() : '', dateOfBirth: row[7] ? row[7].toString().trim() : '', phone: row[8] ? row[8].toString().trim() : '', status: row[9] ? row[9].toString().trim() : 'Active', rowIndex: i + 8 }); } } studentsCache[cacheKey] = students; studentsCacheTime[cacheKey] = now; return students; } catch (e) { return []; }
}

function getDashboardStats(programType, forceRefresh) {
  try {
    var key = 'cyis_dash_v2_' + normalizeProgramKey_(programType); var cache = CacheService.getScriptCache();
    if (!forceRefresh) { try { var c = cache.get(key); if (c) { var p = JSON.parse(c); p.fromCache = true; p.cacheSource = 'script'; return p; } } catch (e) {} }
    var ss = getSpreadsheetForProgram(programType); if (!ss) return { success: false, message: 'Spreadsheet not found' };
    var EXCLUDE = { 'Absent_Records': 1, 'Master': 1 }; EXCLUDE[SHEET_NAME_PROBLEMS] = 1; EXCLUDE[SHEET_NAME_LATE] = 1; EXCLUDE[SHOES_SHEET_NAME] = 1; EXCLUDE[HONORROLL_SHEET_NAME] = 1; EXCLUDE['User_Login_Records'] = 1;
    var allSheets = ss.getSheets(), rows = [], grandM = 0, grandF = 0, grandTotal = 0; var batchOk = false, batchResults = null, batchNames = [];
    try { if (typeof Sheets !== 'undefined' && Sheets.Spreadsheets && Sheets.Spreadsheets.Values) { var ranges = []; for (var i = 0; i < allSheets.length; i++) { var nm = allSheets[i].getName(); if (EXCLUDE[nm]) continue; var lr = allSheets[i].getLastRow(); var sn = "'" + nm.replace(/'/g, "''") + "'"; ranges.push(sn + (lr < 8 ? '!B8:E8' : '!B8:E' + lr)); batchNames.push(nm); } if (ranges.length) { var resp = Sheets.Spreadsheets.Values.batchGet(ss.getId(), { ranges: ranges }); if (resp && resp.valueRanges) { batchResults = resp.valueRanges; batchOk = true; } } } } catch (e) {}
    if (batchOk) { for (var bi = 0; bi < batchResults.length; bi++) { var c2 = countMF_((batchResults[bi] && batchResults[bi].values) || []); rows.push({ sheetName: batchNames[bi], totalM: c2.m, totalF: c2.f, total: c2.m + c2.f }); grandM += c2.m; grandF += c2.f; grandTotal += c2.m + c2.f; } }
    else { for (var j = 0; j < allSheets.length; j++) { var sheet = allSheets[j], name = sheet.getName(); if (EXCLUDE[name]) continue; var lastRow = sheet.getLastRow(); if (lastRow < 8) { rows.push({ sheetName: name, totalM: 0, totalF: 0, total: 0 }); continue; } var c3 = countMF_(sheet.getRange(8, 2, lastRow - 7, 4).getValues()); rows.push({ sheetName: name, totalM: c3.m, totalF: c3.f, total: c3.m + c3.f }); grandM += c3.m; grandF += c3.f; grandTotal += c3.m + c3.f; } }
    var result = { success: true, totalSheets: rows.length, totalStudents: grandTotal, totalM: grandM, totalF: grandF, rows: rows, fromCache: false, generatedAt: Date.now() };
    try { cache.put(key, JSON.stringify(result), 1800); } catch (e) {} try { PropertiesService.getScriptProperties().setProperty('cyis_dash_persist_' + normalizeProgramKey_(programType), JSON.stringify(result)); } catch (e) {} return result;
  } catch (e) { return { success: false, message: e.toString() }; }
}
function countMF_(vals) { var m = 0, f = 0; if (!vals) return { m: 0, f: 0 }; for (var r = 0; r < vals.length; r++) { var row = vals[r]; if (!row) continue; var id = row[0]; if (id === null || id === undefined || id === '') continue; var sex = row[3] === null || row[3] === undefined ? '' : String(row[3]).trim(); if (!sex) continue; var sx = sex.toUpperCase(); if (sex === 'ប' || sex === 'ប្រុស' || sx === 'M') m++; else if (sex === 'ស' || sex === 'ស្រី' || sx === 'F') f++; } return { m: m, f: f }; }
function getSheetNamesFast(programType) { try { var ss = getSpreadsheetForProgram(programType); if (!ss) return { success: false, sheets: [], message: 'Spreadsheet not found' }; var EXCLUDE = { 'Absent_Records': 1, 'Master': 1 }; EXCLUDE[SHEET_NAME_PROBLEMS] = 1; EXCLUDE[SHEET_NAME_LATE] = 1; EXCLUDE[SHOES_SHEET_NAME] = 1; EXCLUDE[HONORROLL_SHEET_NAME] = 1; EXCLUDE['User_Login_Records'] = 1; var all = ss.getSheets(), names = []; for (var i = 0; i < all.length; i++) { var n = all[i].getName(); if (!EXCLUDE[n]) names.push(n); } return { success: true, sheets: names, generatedAt: Date.now() }; } catch (e) { return { success: false, sheets: [], message: String(e) }; } }

function getNewStudentsPing(programType) { var key = normalizeProgramKey_(programType); try { var cache = CacheService.getScriptCache(); var hit = cache.get('cyis_ns_result_' + key); if (hit) { var p = JSON.parse(hit); return { success: true, count: p.totalNew || 0, ts: Date.now(), fresh: true }; } var p2 = cache.get('cyis_ns_ping_' + key); if (p2) { var q = JSON.parse(p2); return { success: true, count: q.count || 0, ts: q.ts || 0, fresh: false }; } return { success: true, count: -1, ts: 0, fresh: false }; } catch (e) { return { success: false, count: -1, ts: 0 }; } }
function getNewStudentsList(programType, markAsSeen) {
  try {
    var key = normalizeProgramKey_(programType); var nsKey = 'cyis_ns_baseline_' + key; var detKey = 'cyis_ns_detected_' + key; var cacheKey = 'cyis_ns_result_' + key;
    var cache = CacheService.getScriptCache(); if (!markAsSeen) { try { var hit = cache.get(cacheKey); if (hit) { var parsed = JSON.parse(hit); parsed.fromCache = true; return parsed; } } catch (e) {} }
    var props = PropertiesService.getScriptProperties(); var baseline = {}; try { var raw = props.getProperty(nsKey); if (raw) baseline = JSON.parse(raw); } catch (e) { baseline = {}; }
    var detectedMap = {}; try { var rawDet = props.getProperty(detKey); if (rawDet) detectedMap = JSON.parse(rawDet); } catch (e) { detectedMap = {}; }
    var ss = getSpreadsheetForProgram(programType); if (!ss) return { success: false, message: 'Spreadsheet not found', newStudents: [], totalNew: 0 };
    var EXCLUDE = { 'Absent_Records': 1, 'Master': 1 }; EXCLUDE[SHEET_NAME_PROBLEMS] = 1; EXCLUDE[SHEET_NAME_LATE] = 1; EXCLUDE[SHOES_SHEET_NAME] = 1; EXCLUDE[HONORROLL_SHEET_NAME] = 1; EXCLUDE['User_Login_Records'] = 1;
    var allSheets = ss.getSheets(), activeNames = [], activeSheets = [], ranges = [];
    for (var i = 0; i < allSheets.length; i++) { var nm = allSheets[i].getName(); if (EXCLUDE[nm]) continue; activeNames.push(nm); activeSheets.push(allSheets[i]); ranges.push("'" + nm.replace(/'/g, "''") + "'!B8:C500"); }
    var batchValues = null; try { if (typeof Sheets !== 'undefined' && Sheets.Spreadsheets && Sheets.Spreadsheets.Values && ranges.length) { var resp = Sheets.Spreadsheets.Values.batchGet(ss.getId(), { ranges: ranges }); if (resp && resp.valueRanges) batchValues = resp.valueRanges; } } catch (e) {}
    var current = {}, studentRows = {}, firstRun = (Object.keys(baseline).length === 0), newStudents = [];
    for (var bi = 0; bi < activeNames.length; bi++) {
      var name = activeNames[bi], sheet = activeSheets[bi], ids = [];
      if (batchValues) { var vals = (batchValues[bi] && batchValues[bi].values) || []; for (var r = 0; r < vals.length; r++) { var idCell = vals[r] && vals[r][0]; var nameCell = vals[r] && vals[r][1]; var idStr = (idCell === null || idCell === undefined) ? '' : String(idCell).trim(); var nmStr = (nameCell === null || nameCell === undefined) ? '' : String(nameCell).trim(); if (idStr === '' && nmStr === '') continue; ids.push({ id: idStr, name: nmStr }); } }
      else { try { var lr = sheet.getLastRow(), readRows = Math.min(500, Math.max(0, lr - 7)); if (readRows > 0) { var r2 = sheet.getRange(8, 2, readRows, 2).getValues(); for (var r3 = 0; r3 < r2.length; r3++) { var iV = r2[r3][0], nV = r2[r3][1]; var iS = (iV === null || iV === undefined) ? '' : String(iV).trim(); var nS = (nV === null || nV === undefined) ? '' : String(nV).trim(); if (iS === '' && nS === '') continue; ids.push({ id: iS, name: nS }); } } } catch (e) { ids = []; } }
      current[name] = ids.length; studentRows[name] = ids;
    }
    if (!firstRun) { for (var si = 0; si < activeNames.length; si++) { var sn = activeNames[si], list = studentRows[sn] || [], prev = baseline[sn]; if (prev === undefined) continue; if (list.length <= prev) continue; var added = list.slice(prev), extraData = []; try { extraData = activeSheets[si].getRange(8 + prev, 1, added.length, 10).getValues(); } catch (e) {} for (var k = 0; k < added.length; k++) { var rec = added[k], full = extraData[k] || []; var sexRaw = full[4] ? String(full[4]).trim() : ''; var detId = sn + '|' + (rec.id || rec.name); var existing = detectedMap[detId]; var detAt = (existing && typeof existing === 'object') ? existing.ts : (typeof existing === 'number' ? existing : Date.now()); if (!detAt) detAt = Date.now(); detectedMap[detId] = { ts: detAt, row: full }; newStudents.push({ sheetName: sn, studentId: rec.id, englishName: full[2] ? String(full[2]).trim() : rec.name, khmerName: full[3] ? String(full[3]).trim() : '', sex: sexRaw, gender: sexRaw === 'M' ? 'ប្រុស' : (sexRaw === 'F' ? 'ស្រី' : sexRaw), dateOfBirth: full[7] ? String(full[7]).trim() : '', phone: full[8] ? String(full[8]).trim() : '', detectedAt: detAt }); } } }
    if (firstRun || markAsSeen) { try { props.setProperty(nsKey, JSON.stringify(current)); } catch (e) {} }
    try { var cutoff = Date.now() - 45 * 24 * 60 * 60 * 1000, pruned = {}; for (var dk in detectedMap) { if (!detectedMap.hasOwnProperty(dk)) continue; var entry = detectedMap[dk]; var ts = (typeof entry === 'number') ? entry : (entry && entry.ts); if (ts && ts > cutoff) pruned[dk] = entry; } props.setProperty(detKey, JSON.stringify(pruned)); } catch (e) {}
    if (markAsSeen) { try { cache.remove(cacheKey); } catch (e) {} try { cache.put('cyis_ns_ping_' + key, JSON.stringify({ count: 0, ts: Date.now() }), 60); } catch (e) {} return { success: true, newStudents: [], totalNew: 0, markedAsSeen: true }; }
    var result = { success: true, newStudents: newStudents, totalNew: newStudents.length, firstRun: firstRun };
    try { cache.put(cacheKey, JSON.stringify(result), 2); } catch (e) {} try { cache.put('cyis_ns_ping_' + key, JSON.stringify({ count: newStudents.length, ts: Date.now() }), 30); } catch (e) {} return result;
  } catch (e) { return { success: false, message: String(e), newStudents: [], totalNew: 0 }; }
}
function getRecentlyDetectedStudents(programType, days) {
  var START = Date.now(); var BUDGET_MS = 20000;
  function buildFromRow(sheetName, row, ts) { var sexRaw = row[4] ? String(row[4]).trim() : ''; return { sheetName: sheetName, studentId: row[1] ? String(row[1]).trim() : '', englishName: row[2] ? String(row[2]).trim() : '', khmerName: row[3] ? String(row[3]).trim() : '', sex: sexRaw, gender: sexRaw === 'M' ? 'ប្រុស' : (sexRaw === 'F' ? 'ស្រី' : sexRaw), dateOfBirth: row[7] ? String(row[7]).trim() : '', phone: row[8] ? String(row[8]).trim() : '', detectedAt: ts }; }
  try {
    days = Number(days) || 30; var key = normalizeProgramKey_(programType); var cache = CacheService.getScriptCache(); var cacheKey = 'cyis_recent_' + key + '_' + days;
    try { var hit = cache.get(cacheKey); if (hit) { var parsed = JSON.parse(hit); parsed.fromCache = true; return parsed; } } catch (e) {}
    var detKey = 'cyis_ns_detected_' + key; var props = PropertiesService.getScriptProperties(); var detectedMap = {}; try { var raw = props.getProperty(detKey); if (raw) detectedMap = JSON.parse(raw); } catch (e) { detectedMap = {}; }
    var cutoff = Date.now() - days * 24 * 60 * 60 * 1000; var students = []; var needScan = [];
    for (var dk in detectedMap) {
      if (!detectedMap.hasOwnProperty(dk)) continue; var entry = detectedMap[dk]; var ts, row;
      if (typeof entry === 'number') { ts = entry; row = null; } else if (entry && typeof entry === 'object') { ts = entry.ts; row = entry.row; } else continue;
      if (!ts || ts < cutoff) continue;
      var sep = dk.indexOf('|'); var sheetName = sep >= 0 ? dk.slice(0, sep) : dk; var sid = sep >= 0 ? dk.slice(sep + 1) : '';
      if (row && row.length) { students.push(buildFromRow(sheetName, row, ts)); } else { needScan.push({ key: dk, sheetName: sheetName, sid: sid, ts: ts }); }
    }
    if (needScan.length > 0 && (Date.now() - START) < BUDGET_MS) {
      try { var ss = getSpreadsheetForProgram(programType); if (ss) { var EXCLUDE = { 'Absent_Records': 1, 'Master': 1 }; EXCLUDE[SHEET_NAME_PROBLEMS] = 1; EXCLUDE[SHEET_NAME_LATE] = 1; EXCLUDE[SHOES_SHEET_NAME] = 1; EXCLUDE[HONORROLL_SHEET_NAME] = 1; EXCLUDE['User_Login_Records'] = 1; var bySheet = {}; for (var i = 0; i < needScan.length; i++) { var n = needScan[i]; if (!bySheet[n.sheetName]) bySheet[n.sheetName] = []; bySheet[n.sheetName].push(n); } var sheetNames = Object.keys(bySheet); var upgraded = false; for (var si = 0; si < sheetNames.length; si++) { if ((Date.now() - START) > BUDGET_MS) break; var sn = sheetNames[si]; if (EXCLUDE[sn]) continue; var sheet = ss.getSheetByName(sn); if (!sheet) continue; var lr = sheet.getLastRow(); if (lr < 8) continue; var data = sheet.getRange(8, 1, lr - 7, 10).getValues(); var list = bySheet[sn]; for (var li = 0; li < list.length; li++) { if ((Date.now() - START) > BUDGET_MS) break; var need = list[li]; for (var r = 0; r < data.length; r++) { var rowData = data[r]; var rid = rowData[1] ? String(rowData[1]).trim() : ''; var rname = rowData[2] ? String(rowData[2]).trim() : ''; if (!rid && !rname) continue; if (String(rid || rname) === need.sid) { students.push(buildFromRow(sn, rowData, need.ts)); detectedMap[need.key] = { ts: need.ts, row: rowData }; upgraded = true; break; } } } } if (upgraded) { try { props.setProperty(detKey, JSON.stringify(detectedMap)); } catch (e) {} } } } catch (e) {}
    }
    students.sort(function(a, b) { return (b.detectedAt || 0) - (a.detectedAt || 0); }); var elapsed = Date.now() - START;
    var result = { success: true, students: students, total: students.length, days: days, elapsedMs: elapsed, partial: needScan.length > 0 && elapsed >= BUDGET_MS };
    try { cache.put(cacheKey, JSON.stringify(result), 90); } catch (e) {} return result;
  } catch (e) { return { success: false, message: String(e), students: [], total: 0 }; }
}

function getAttendance(date, sheetName, programType) {
  var cacheKey = programType + '_' + sheetName + '_' + date, now = Date.now(); if (attendanceCache[cacheKey] && (now - attendanceCacheTime[cacheKey]) < CACHE_DURATION) return attendanceCache[cacheKey];
  try { var ss = getSpreadsheetForProgram(programType); if (!ss) return []; var sheet = ss.getSheetByName(sheetName); if (!sheet) return []; var dateCol = getDateColumnByDay(new Date(date).getDate()); if (!dateCol) return []; var students = getStudentsFromSheet(sheetName, programType), attendance = []; for (var i = 0; i < students.length; i++) { var student = students[i]; var cell = sheet.getRange(student.rowIndex, dateCol); var val = cell.getValue() || ''; var note = cell.getNote() || ''; var status = 'present'; if (val === 'P') status = 'present'; else if (val === 'E') status = 'excused'; else if (val === 'U') status = 'unexcused'; else if (val === 'L') status = 'late'; attendance.push({ studentId: student.id, studentName: student.englishName, class: student.class, status: status, remark: note }); } attendanceCache[cacheKey] = attendance; attendanceCacheTime[cacheKey] = now; return attendance; } catch (e) { return []; }
}
function saveAttendanceWithProgram(date, attendanceData, sheetName, programType) {
  return withLock_(function() {
    try {
      var ss = getSpreadsheetForProgram(programType); if (!ss) return { success: false, message: 'Spreadsheet not found' }; var sheet = ss.getSheetByName(sheetName); if (!sheet) return { success: false, message: 'Sheet not found' };
      var dateCol = getDateColumnByDay(new Date(date).getDate()); if (!dateCol) return { success: false, message: 'Invalid date' }; var lastRow = sheet.getLastRow(); if (lastRow < 8) return { success: false, message: 'No students' }; var studentCount = lastRow - 7;
      var colNo = 47, colKhmer = 48, colSex = 49, colReason = 50, colStatus = 51; var BACKUP_COLS = 5;
      sheet.getRange(7, colNo, 1, BACKUP_COLS).setValues([['ល.រ', 'Khmer Name', 'Sex', 'Reason', 'E / U / L']]); sheet.getRange(8, colNo, studentCount, BACKUP_COLS).clearContent(); sheet.getRange(8, colNo, studentCount, BACKUP_COLS).setBackground(null);
      var students = getStudentsFromSheet(sheetName, programType); var attendanceMap = {}; for (var i = 0; i < attendanceData.length; i++) attendanceMap[attendanceData[i].studentId] = attendanceData[i];
      var dayValues = [], dayColors = [], dayNotes = []; var presentCount = 0, excusedCount = 0, unexcusedCount = 0, lateCount = 0; var backupRows = []; var absentNo = 0;
      for (var r = 0; r < studentCount; r++) {
        var studentRow = r + 8; var student = null; for (var ii = 0; ii < students.length; ii++) { if (students[ii].rowIndex === studentRow) { student = students[ii]; break; } }
        if (!student) { dayValues.push(['']); dayColors.push(['#ffffff']); dayNotes.push(['']); continue; }
        var rec = attendanceMap[student.id]; if (!rec) { dayValues.push(['']); dayColors.push(['#ffffff']); dayNotes.push(['']); continue; }
        var val = '', color = '', note = ''; var statusLetter = '';
        if (rec.status === 'present') { val = 'P'; color = '#c8e6c9'; presentCount++; } else if (rec.status === 'excused') { val = 'E'; color = '#ffe0b2'; statusLetter = 'E'; excusedCount++; } else if (rec.status === 'unexcused') { val = 'U'; color = '#ffcdd2'; statusLetter = 'U'; unexcusedCount++; } else if (rec.status === 'late') { val = 'L'; color = '#e1f5fe'; statusLetter = 'L'; lateCount++; }
        if (rec.status !== 'present' && rec.remark && rec.remark.trim() !== '' && rec.remark !== 'None') note = rec.remark;
        dayValues.push([val]); dayColors.push([color]); dayNotes.push([note]); if (rec.status !== 'present') { absentNo++; backupRows.push([absentNo, student.khmerName || '', student.gender || student.sex || '', rec.remark || '', statusLetter]); }
      }
      var dayRange = sheet.getRange(8, dateCol, studentCount, 1); dayRange.setValues(dayValues); dayRange.setBackgrounds(dayColors); dayRange.setNotes(dayNotes);
      var absentCount = backupRows.length;
      if (absentCount > 0) { var backupRange = sheet.getRange(8, colNo, absentCount, BACKUP_COLS); backupRange.setValues(backupRows); } else { sheet.getRange(8, colKhmer).setValue('គ្មានអវត្តមាន'); }
      delete attendanceCache[programType + '_' + sheetName + '_' + date];
      return { success: true, message: '✅ ' + programType.toUpperCase() + ' - ' + sheetName + ': P:' + presentCount + ', E:' + excusedCount + ', U:' + unexcusedCount + ', L:' + lateCount };
    } catch (e) { return { success: false, message: 'Error: ' + e.toString() }; }
  });
}
function getMonthlyAttendanceForProgram(monthYear, programType, sheetName) {
  var cacheKey = programType + '_' + sheetName + '_' + monthYear, now = Date.now(); if (monthlyReportCache[cacheKey] && (now - monthlyReportCache[cacheKey].time) < CACHE_DURATION) return monthlyReportCache[cacheKey].data;
  try { var ss = getSpreadsheetForProgram(programType); if (!ss) return []; var sheet = ss.getSheetByName(sheetName); if (!sheet) return []; var parts = monthYear.split('-'), year = parseInt(parts[0]), month = parseInt(parts[1]); var daysInMonth = new Date(year, month, 0).getDate(); var students = getStudentsFromSheet(sheetName, programType), results = []; var startCol = 11, endCol = 41; for (var i = 0; i < students.length; i++) { var student = students[i]; var dayValues = sheet.getRange(student.rowIndex, startCol, 1, endCol - startCol + 1).getValues()[0]; for (var day = 1; day <= daysInMonth; day++) { if (day > 31) continue; var sv = dayValues[day - 1] || '', status = 'present'; if (sv === 'P') status = 'present'; else if (sv === 'E') status = 'excused'; else if (sv === 'U') status = 'unexcused'; else if (sv === 'L') status = 'late'; results.push({ date: year + '-' + month.toString().padStart(2, '0') + '-' + day.toString().padStart(2, '0'), studentId: student.id, studentName: student.englishName, khmerName: student.khmerName, class: student.class, sex: student.sex, status: status, remark: '' }); } } monthlyReportCache[cacheKey] = { data: results, time: now }; return results; } catch (e) { return []; }
}
function getCampusNumberFromName(name) { if (!name) return null; var n = name.toString().trim(); if (n === 'Campus 1' || n === 'សាខាទី១') return 1; if (n === 'Campus 2' || n === 'សាខាទី២') return 2; if (n === 'Campus 3' || n === 'សាខាទី៣') return 3; if (n === 'Campus 4' || n === 'សាខាទី៤') return 4; return null; }
function saveStudentProblem(data) { return withLock_(function() { try { var campusNum = getCampusNumberFromName(data.campus); if (!campusNum) return { success: false, message: 'Invalid campus' }; var ss = SpreadsheetApp.openById(CAMPUS_SPREADSHEETS[campusNum]); var sheet = ss.getSheetByName(SHEET_NAME_PROBLEMS); if (!sheet) { sheet = ss.insertSheet(SHEET_NAME_PROBLEMS); sheet.getRange(1, 1, 1, 9).setValues([['', 'Timestamp', 'Student Name', 'Sex', 'Date', 'Grade', 'Problem', 'Campus', 'Reported By']]); } var newRow = sheet.getLastRow() + 1; sheet.getRange(newRow, 2, 1, 8).setValues([[new Date().toLocaleString(), data.studentName || '', data.sex || '', data.date || '', data.grade || '', data.problem || '', data.campus || '', data.reportedBy || 'System']]); return { success: true, message: '✅ Problem report saved!' }; } catch (e) { return { success: false, message: 'Error: ' + e.toString() }; } }); }
function getProblemReports(filters) { var results = []; for (var c = 0; c < CAMPUS_IDS.length; c++) { var campusNum = CAMPUS_IDS[c]; try { var ss = SpreadsheetApp.openById(CAMPUS_SPREADSHEETS[campusNum]); var sheet = ss.getSheetByName(SHEET_NAME_PROBLEMS); if (!sheet) continue; var lastRow = sheet.getLastRow(); if (lastRow < 2) continue; var data = sheet.getRange(2, 1, lastRow - 1, 9).getValues(); for (var i = 0; i < data.length; i++) { var r = data[i]; if (!r[2]) continue; results.push({ campus: 'Campus ' + campusNum, timestamp: r[1] ? r[1].toString() : '', studentName: r[2] ? r[2].toString() : '', sex: r[3] ? r[3].toString() : '', date: r[4] ? formatDate_(r[4]) : '', grade: r[5] ? r[5].toString() : '', problem: r[6] ? r[6].toString() : '', reportedBy: r[8] ? r[8].toString() : '' }); } } catch (e) {} } return results; }
function saveLateReport(data) { return withLock_(function() { try { var campusNum = getCampusNumberFromName(data.campus); if (!campusNum) return { success: false, message: 'Invalid campus' }; var ss = SpreadsheetApp.openById(CAMPUS_SPREADSHEETS[campusNum]); var sheet = ss.getSheetByName(SHEET_NAME_LATE); if (!sheet) { sheet = ss.insertSheet(SHEET_NAME_LATE); sheet.getRange(1, 1, 1, 9).setValues([['', 'Timestamp', 'Student Name', 'Sex', 'Class', 'Date', 'Reason', 'Campus', 'Reported By']]); } var newRow = sheet.getLastRow() + 1; sheet.getRange(newRow, 2, 1, 8).setValues([[new Date().toLocaleString(), data.studentName || '', data.sex || '', data.sheetName || '', data.date || '', data.reason || '', data.campus || '', data.reportedBy || 'System']]); return { success: true, message: '✅ Late report saved!' }; } catch (e) { return { success: false, message: 'Error: ' + e.toString() }; } }); }
function getLateReports(filters) { var results = []; for (var c = 0; c < CAMPUS_IDS.length; c++) { var campusNum = CAMPUS_IDS[c]; try { var ss = SpreadsheetApp.openById(CAMPUS_SPREADSHEETS[campusNum]); var sheet = ss.getSheetByName(SHEET_NAME_LATE); if (!sheet) continue; var lastRow = sheet.getLastRow(); if (lastRow < 2) continue; var data = sheet.getRange(2, 1, lastRow - 1, 9).getValues(); for (var i = 0; i < data.length; i++) { var r = data[i]; if (!r[2]) continue; results.push({ campus: 'Campus ' + campusNum, timestamp: r[1] ? r[1].toString() : '', studentName: r[2] ? r[2].toString() : '', sex: r[3] ? r[3].toString() : '', sheetName: r[4] ? r[4].toString() : '', date: r[5] ? formatDate_(r[5]) : '', reason: r[6] ? r[6].toString() : '', reportedBy: r[8] ? r[8].toString() : '' }); } } catch (e) {} } return results; }

function getOrCreateHonorRollSheet_(programType) { var ss = getSpreadsheetForProgram(programType); if (!ss) return null; var sheet = ss.getSheetByName(HONORROLL_SHEET_NAME); if (!sheet) { sheet = ss.insertSheet(HONORROLL_SHEET_NAME); sheet.getRange(1, 1, 1, 7).setValues([['Class', 'Slot 1 (Rank 1)', 'Slot 2 (Rank 2)', 'Slot 3 (Rank 3)', 'Slot 4 (Rank 4)', 'Slot 5 (Rank 5)', 'Last Updated']]); } return sheet; }
function getHonorRollSelections(sheetName, programType) { try { if (!sheetName || !programType) return [null, null, null, null, null]; var cacheKey = programType + '_' + sheetName, now = Date.now(); if (honorRollCache[cacheKey] && (now - honorRollCacheTime[cacheKey]) < CACHE_DURATION) return honorRollCache[cacheKey]; var sheet = getOrCreateHonorRollSheet_(programType); if (!sheet) return [null, null, null, null, null]; var lastRow = sheet.getLastRow(); if (lastRow < 2) return [null, null, null, null, null]; var data = sheet.getRange(2, 1, lastRow - 1, 7).getValues(); for (var i = 0; i < data.length; i++) { var r = data[i]; if (!r[0]) continue; if (r[0].toString().trim() === sheetName.toString().trim()) { var sel = [r[1] ? r[1].toString().trim() : null, r[2] ? r[2].toString().trim() : null, r[3] ? r[3].toString().trim() : null, r[4] ? r[4].toString().trim() : null, r[5] ? r[5].toString().trim() : null]; honorRollCache[cacheKey] = sel; honorRollCacheTime[cacheKey] = now; return sel; } } return [null, null, null, null, null]; } catch (e) { return [null, null, null, null, null]; } }
function saveHonorRollSelections(sheetName, programType, selections) { return withLock_(function() { try { if (!sheetName || !programType) return { success: false, message: 'Missing params' }; if (!Array.isArray(selections) || selections.length !== 5) return { success: false, message: 'selections must be 5 items' }; var sheet = getOrCreateHonorRollSheet_(programType); if (!sheet) return { success: false, message: 'No sheet' }; var lastRow = sheet.getLastRow(), targetRow = -1; if (lastRow >= 2) { var data = sheet.getRange(2, 1, lastRow - 1, 1).getValues(); for (var i = 0; i < data.length; i++) { if (data[i][0] && data[i][0].toString().trim() === sheetName.toString().trim()) { targetRow = i + 2; break; } } } var rowValues = [sheetName, selections[0] || '', selections[1] || '', selections[2] || '', selections[3] || '', selections[4] || '', new Date().toLocaleString()]; if (targetRow > 0) sheet.getRange(targetRow, 1, 1, 7).setValues([rowValues]); else sheet.appendRow(rowValues); delete honorRollCache[programType + '_' + sheetName]; delete honorRollCacheTime[programType + '_' + sheetName]; return { success: true, message: '✅ Honor roll saved!' }; } catch (e) { return { success: false, message: 'Error: ' + e.toString() }; } }); }
function saveHonorRollRanked(sheetName, programType, studentIds, lang) { try { if (!Array.isArray(studentIds)) return { success: false, message: 'studentIds must be an array' }; var slots = [null, null, null, null, null]; for (var i = 0; i < Math.min(5, studentIds.length); i++) slots[i] = studentIds[i] || null; return saveHonorRollSelections(sheetName, programType, slots); } catch (e) { return { success: false, message: 'Error: ' + e.toString() }; } }

function clearAllCache() { sheetsCache = {}; sheetsCacheTime = {}; studentsCache = {}; studentsCacheTime = {}; attendanceCache = {}; attendanceCacheTime = {}; monthlyReportCache = {}; photoMapCache = {}; photoMapCacheTime = {}; honorRollCache = {}; honorRollCacheTime = {}; invalidateMasterRowsCache_(); try { var c = CacheService.getScriptCache(); c.remove('cyis_dash_v2_gep'); c.remove('cyis_dash_v2_fulltime'); c.remove('cyis_ns_result_gep'); c.remove('cyis_ns_result_fulltime'); c.remove('cyis_ns_ping_gep'); c.remove('cyis_ns_ping_fulltime'); c.remove('cyis_recent_gep_30'); c.remove('cyis_recent_fulltime_30'); c.remove(SAVE_PROGRESS_KEY); c.remove('cyis_user_profile_map'); } catch (e) {} return { success: true }; }
function getPhotoDataUrl(fileId, mimeType) { try { if (!fileId) return { success: false }; var blob = DriveApp.getFileById(fileId).getBlob(); var mime = mimeType || blob.getContentType() || 'image/jpeg'; return { success: true, dataUrl: 'data:' + mime + ';base64,' + Utilities.base64Encode(blob.getBytes()) }; } catch (e) { return { success: false, message: e.toString() }; } }
function getPhotoDataUrlsBatch(fileIds, mimeType) { try { if (!Array.isArray(fileIds) || !fileIds.length) return { success: true, dataUrls: {} }; var out = {}; for (var i = 0; i < fileIds.length; i++) { try { var blob = DriveApp.getFileById(fileIds[i]).getBlob(); var mime = mimeType || blob.getContentType() || 'image/jpeg'; out[fileIds[i]] = 'data:' + mime + ';base64,' + Utilities.base64Encode(blob.getBytes()); } catch (err) { out[fileIds[i]] = null; } } return { success: true, dataUrls: out }; } catch (e) { return { success: false, message: e.toString() }; } }

function getAllUsersForRoleManagement() {
  try {
    var ss = SpreadsheetApp.openById(USER_LOGIN_SHEET_ID);
    var sheet = ss.getSheetByName('Master');
    if (!sheet) return { success: false, message: 'Master sheet not found' };
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return { success: true, data: [] };
    var data = sheet.getRange(2, 1, lastRow - 1, 21).getValues();
    var out = [];
    for (var i = 0; i < data.length; i++) {
      var r = data[i];
      var uname = r[1] ? String(r[1]).trim() : '';
      var phone = r[2] ? String(r[2]).trim() : '';
      var role  = r[3] ? String(r[3]).trim().toLowerCase() : 'member';
      var tname = r[4] ? String(r[4]).trim() : '';
      if (!uname && !phone && !tname) continue;
      out.push({
        rowIndex: i + 2, username: uname, phone: phone, role: role, teacherName: tname,
        mid1M: r[5] || '', mid1A: r[6] || '', mid2M: r[7] || '', mid2A: r[8] || '',
        gepMid1A: r[9] || '', gepMid1B: r[10] || '', gepMid2A: r[11] || '', gepMid2B: r[12] || '',
        permDb: r[13] === true || r[13] === 'TRUE' || r[13] === '1',
        permReports: r[14] === true || r[14] === 'TRUE' || r[14] === '1',
        permAttendance: r[15] === true || r[15] === 'TRUE' || r[15] === '1',
        permClassroom: r[16] === true || r[16] === 'TRUE' || r[16] === '1',
        permCampus: r[17] === true || r[17] === 'TRUE' || r[17] === '1',
        permIdcard: r[18] === true || r[18] === 'TRUE' || r[18] === '1',
        permHonorroll: r[19] === true || r[19] === 'TRUE' || r[19] === '1',
        permSettings: r[20] === true || r[20] === 'TRUE' || r[20] === '1'
      });
    }
    return { success: true, data: out };
  } catch (e) { return { success: false, message: e.toString() }; }
}
function updateUserRole(rowIndex, newRole, requesterRole) {
  return withLock_(function() {
    try {
      if (String(requesterRole || '').toLowerCase().trim() !== 'vip') return { success: false, message: 'Unauthorized: Only VIP accounts can change roles.' };
      var ss = SpreadsheetApp.openById(USER_LOGIN_SHEET_ID);
      var sheet = ss.getSheetByName('Master');
      if (!sheet) return { success: false, message: 'Master sheet not found' };
      sheet.getRange(rowIndex, 4).setValue(newRole);
      invalidateMasterRowsCache_();
      return { success: true, message: 'Role updated to ' + newRole };
    } catch (e) { return { success: false, message: e.toString() }; }
  });
}
function updateUserClassField(rowIndex, colIndex, newValue, requesterRole) {
  return withLock_(function() {
    try {
      if (String(requesterRole || '').toLowerCase().trim() !== 'vip') return { success: false, message: 'Unauthorized: Only VIP can change data.' };
      var ss = SpreadsheetApp.openById(USER_LOGIN_SHEET_ID);
      var sheet = ss.getSheetByName('Master');
      if (!sheet) return { success: false, message: 'Master sheet not found' };
      sheet.getRange(rowIndex, colIndex).setValue(newValue);
      invalidateMasterRowsCache_();
      return { success: true, message: 'Updated successfully' };
    } catch (e) { return { success: false, message: e.toString() }; }
  });
}
function updateUserPermission(rowIndex, colIndex, isChecked, requesterRole) {
  return withLock_(function() {
    try {
      if (String(requesterRole || '').toLowerCase().trim() !== 'vip') return { success: false, message: 'Unauthorized: Only VIP can change permissions.' };
      var ss = SpreadsheetApp.openById(USER_LOGIN_SHEET_ID);
      var sheet = ss.getSheetByName('Master');
      if (!sheet) return { success: false, message: 'Master sheet not found' };
      sheet.getRange(rowIndex, colIndex).setValue(isChecked);
      invalidateMasterRowsCache_();
      return { success: true, message: 'Permission updated' };
    } catch (e) { return { success: false, message: e.toString() }; }
  });
}

// ============================================================
// ⚡ NEW: ADD NEW USER FUNCTION
// ============================================================
function addNewUserToMaster(username, password, role, teacherName) {
  return withLock_(function() {
    try {
      if (!username || !password) {
        return { success: false, message: 'Username and Password are required.' };
      }
      
      var ss = SpreadsheetApp.openById(USER_LOGIN_SHEET_ID);
      var sheet = ss.getSheetByName('Master');
      if (!sheet) return { success: false, message: 'Master sheet not found' };
      
      var data = sheet.getDataRange().getValues();
      
      // Check if username already exists (case-insensitive)
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][1]).trim().toLowerCase() === username.trim().toLowerCase()) {
          return { success: false, message: 'Username already exists.' };
        }
      }
      
      var newRow = sheet.getLastRow() + 1;
      
      // Append the new row (Number, Username, Phone/Password, Role, Teacher's Name)
      // Leaving other columns blank by only setting the first 5 columns
      sheet.getRange(newRow, 1, 1, 5).setValues([[
        newRow - 1, 
        username.trim(), 
        password.trim(), 
        role.trim(), 
        teacherName.trim()
      ]]);
      
      invalidateMasterRowsCache_(); // Clear cache so new user appears immediately
      return { success: true, message: 'User added successfully' };
      
    } catch (e) {
      return { success: false, message: 'Error: ' + e.toString() };
    }
  });
}
