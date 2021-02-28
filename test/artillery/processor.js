'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

module.exports = {
  logResponse: logResponse,
  uploadImage: uploadImage,
  saveTokens: saveTokens,
  getTokens: getTokens,
};

function logResponse(context, ee, done) {
  console.log(chalk.dim('  -- Response -- '));
  console.log(chalk.dim(JSON.stringify(context.vars.response, null, 2)));
  done();
}

function uploadImage(requestParams, context, ee, next) {
  var formData = {
    file: fs.createReadStream(path.join(__dirname, './data/image.jpg')),
  };
  requestParams.formData = Object.assign({}, requestParams.formData, formData);
  next();
}

function saveTokens(context, ee, done) {
    var fileContent = context.vars.token1 + "\n" + context.vars.token2 + "\n" + context.vars.token3;
    fs.writeFileSync(path.resolve(__dirname, './data/tokens.txt'), fileContent, 'utf8');
    done();
}

function getTokens(context, ee, done) {
    var fileContent = fs.readFileSync(path.resolve(__dirname, './data/tokens.txt'), {encoding: 'utf-8'});
    var tokens = fileContent.split("\n");
    context.vars.token1 = tokens[0];
    context.vars.token2 = tokens[1];
    context.vars.token3 = tokens[2];
    done();
}
