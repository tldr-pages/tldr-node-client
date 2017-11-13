'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const path = require('path');
const glob = Promise.promisify(require('glob'));
const natural = require('natural');

const config = require('./config');

const CACHE_FOLDER = path.join(config.get().cache, 'cache');

var fileWords = [];

var getTokens = (data) => {
  var tokenizer = new natural.WordTokenizer();
  var tokens = tokenizer.tokenize(data);
  tokens.forEach((word,index) => {
    word = word.toLowerCase();
    word = natural.PorterStemmer.stem(word);
    tokens[index] = word;
  });

  return tokens;
};

var createFileIndex = (tokens, name) => {
  fileWords[name] = [];
  tokens.forEach(word => {
    if(fileWords[name][word]){ // Word already exists. Increment count.
      fileWords[name][word]++;
    } else {
      fileWords[name][word] = 1;
    }
  });
};

var processRawDocument = (data, name) => {
  var tokens = getTokens(data);
  createFileIndex(tokens, name);
};

exports.createIndex = () => {
  console.log('CACHE_FOLDER:', CACHE_FOLDER);
  glob(CACHE_FOLDER + '/pages/**/*.md', {}).then(files => {
    var testfiles = files.slice(100,102); // eslint-disable-line
    var promises = [];
    testfiles.forEach(file => {
      var promise = fs.readFileAsync(file).then((data) => {
        processRawDocument(data.toString(), file);
      });
      promises.push(promise);
    });
    Promise.all(promises).then(() => {
      console.log(fileWords);
      console.log('All Done');
    });
  });
};
