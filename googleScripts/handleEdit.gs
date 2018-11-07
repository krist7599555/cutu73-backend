var url = "http://b699e673.ngrok.io";

function isRowValid(rowArray) {
    for (var i = 0; i < 8; i++)
        if (!rowArray[i]) return false;
    return true;
}

function rowToObject(rowArray) {
    var obj = {}
    var fields = ["time", "prefix", "gender", "name", "lname", "nickname", "tel", "imageURL"];
    for (var i = 0; i < 8; i++) {
        obj[fields[i]] = rowArray[i];
    }
    return obj;
}

function rodOnEdit(e) {
    var sheet = e.range.getSheet();
    var range = sheet.getDataRange();
    var allValues = range.getValues();
    var rows = e.range;

    const changedRows = sheet.getRange(e.range.rowStart, 1, e.range.rowEnd - e.range.rowStart + 1, 9)
        .getValues()
    const objectArray = changedRows.filter(isRowValid).map(rowToObject);
    Logger.log("objects :%s ", objectArray);
    if (e.range.columnStart > 8) {
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