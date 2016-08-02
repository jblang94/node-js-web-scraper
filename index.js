const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const url = 'http://substack.net/images/';
const file = 'images.csv';
var $ = null;

function createFileInfoObject(tds) {
  var filePermissions = null;
  var absoluteUrl = null;
  var fileType = null;
  tds.each(function(index, td) {
    if(index == 0) {
      filePermissions = td.children[0].children[0].data;
    }
    if(index == 2) {
      absoluteUrl = '/substack.net' + (td.children[0].attribs.href);
      fileType = absoluteUrl.split('.')[1];
    }
  });
  var fileInfoObject = {"filePermissions": filePermissions, 
                            "absoluteUrl": absoluteUrl, 
                            "fileType": fileType};
  return fileInfoObject;
}

function streamToCsv(html) {
  var $ = cheerio.load(html);
  $('tr').each(function(index, tr) {
    var tds = $(tr).children();
    var fileInfoObject = createFileInfoObject($(tds));
  });
}

request(url, function(error, response, body) {
  if(!error && response.statusCode == 200) {
    console.log('no error detected');
    streamToCsv(body);
  }
});
