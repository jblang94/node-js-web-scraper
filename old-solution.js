const request = require('request');
const cheerio = require('cheerio');
const json2csv = require('json2csv');
const fs = require('fs');

const url = 'http://substack.net/images/';
const file = 'images.csv';

function determineFileType(filePermission, absoluteUrl) {
  if(/d/.test(filePermission)) {
    return "dir"
  }
  var fileExtension = absoluteUrl.split('.').pop();
  if(fileExtension) {
    return fileExtension;
  } else {
    return "unknown";
  }
}

function createFileInfoJson(tds) {
  var filePermissions = null;
  var absoluteUrl = null;
  var fileType = null;
  tds.each(function(index, td) {
    if(index == 0) {
      filePermissions = td.children[0].children[0].data.replace(/[()]/g, '');
    }
    if(index == 2) {
      absoluteUrl = '/substack.net' + (td.children[0].attribs.href);
      fileType = determineFileType(filePermissions, absoluteUrl);
    }
  });
  var fileInfoJson = { "File Permission": filePermissions, 
                             "Absolute Url": absoluteUrl, 
                                "File Type": fileType };
  return fileInfoJson;
}

function streamToCsv(html) {
  var $ = cheerio.load(html);
  var csvData = [];
  $('tr').each(function(index, tr) {
    var tds = $(tr).children();
    var fileInfoJson = createFileInfoJson($(tds));
    csvData.push(fileInfoJson);
  });
  var csv = json2csv({ data: csvData, fields: Object.keys(csvData[0])});
  fs.writeFile(file, csv, function(err) {
    if(err) throw err;
    console.log('Saved csv data to ' + file);
  });
}

request(url, function(error, response, body) {
  if(!error && response.statusCode == 200) {
    streamToCsv(body);
  }
});