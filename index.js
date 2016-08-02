const request = require('request');
const cheerio = require('cheerio');
const json2csv = require('json2csv');
const fs = require('fs');

const url = 'http://substack.net/images/';
const file = 'images.csv';

function determineFileType(filePermission, url) {
  if(/d/.test(filePermission)) {
    return "dir";
  }
  var fileExtension = url.split('.').pop();
  return (fileExtension == url) ? "unknown" : fileExtension;
}

function createFileInfoJson(tds) {
  var filePermission = tds.first().text().replace(/[()]/g, '');
  var url = tds.find('a').attr('href');
  var fileType = determineFileType(filePermission, url);
  return { "File Permission": filePermission, 
              "Absolute Url": '/substack.net' + url, 
                 "File Type": fileType };
} 

function streamToCsv(html) {
  var $ = cheerio.load(html);
  var csvData = [];
  $('tr').each(function(index, tr) {
    var tds = $(tr).children();
    var fileInfoJson = createFileInfoJson(tds);
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