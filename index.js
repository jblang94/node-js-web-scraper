const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const url = 'http://substack.net/images/';
const file = 'images.csv';

request(url).pipe(fs.createWriteStream(file));
