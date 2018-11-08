var url = "http://b699e673.ngrok.io";
//const url = "http://128.199.216.159:3030";
var fields = ['studentId', 'image', 'prefix', 'name', 'lastname', 'gender', 'year', 'faculty',
 'facultyId', 'division', 'birthday', 'tel', 'lineID', 'facebook',
  'instragram', 'isInRcu', 'RcuBuilding', 'RcuRoom', 'RcuBed']
var nColumns = fields.length;

function isRowValid(rowArray) {
    for (var i = 0; i < nColumns; i++)
        if (!rowArray[i]) return false;
    return true;
}

function rowToObject(rowArray) {
    var obj = {}
    for (var i = 0; i < nColumns; i++) {
        obj[fields[i]] = rowArray[i];
    }
    return obj;
}

function rodOnEdit(e) {
  return ; // disable
    var sheet = e.range.getSheet();
    var range = e.range; // changed range
  //    var range = sheet.getDataRange();
  //    var allValues = range.getValues();

    // expand range to row
    var changedRows = sheet.getRange(range.rowStart, 1, range.rowEnd - range.rowStart + 1, nColumns).getValues()
//    Logger.log("%s \n\n changed: %s \n\n all=%s \n\n rows = %s\n", sheet, e.range.getValues(), allValues, changedRows)
    var objectArray = changedRows.filter(isRowValid).map(rowToObject);
    Logger.log("objects :%s ", objectArray);
    if (e.range.columnStart > nColumns) {
        Logger.log("Ignored edited region %s because it's out of range", e.range);
        return console.log("Ignored edited region", e.range, "because it's out of range");
    }
    var payload = { data: JSON.stringify(objectArray) }
    Logger.log(payload)
    UrlFetchApp.fetch(url + '/api/v1/user/update-in', {
        method: 'post',
        payload: payload
    })
}

function importFromDB() {
  var resp = UrlFetchApp.fetch(url + "/api/v1/user/export", {method: 'get'}).getContentText();
  Logger.log("Imported from DB:" + resp);
}

function exportToDB() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  Logger.log(sheet)
    var dr = sheet.getDataRange(); // dataRange
//    Logger.log("\n%s , %s\n", dr.get);
    var allRows = sheet.getRange(2, 1, dr.getLastRow() - 2 + 1, nColumns);
  Logger.log("\n%s\n", allRows);
  allRows = allRows.getValues();;
  Logger.log("\n%s\n", allRows);
  var objectArray = allRows.filter(isRowValid).map(rowToObject);
    Logger.log("To Export %s\n", objectArray);
  var payload = { data: JSON.stringify(objectArray), drop: true}
    Logger.log(payload)
    UrlFetchApp.fetch(url + '/api/v1/user/update-in', {
        method: 'post',
        payload: payload
   })
}

function onOpen(){
  var sheetApp = SpreadsheetApp.getActive();
  var items = [{name: "export to DB...", functionName: "exportToDB"}, {name:"import from db", functionName:"importFromDB"}]
  sheetApp.addMenu("My Data", items)
}
