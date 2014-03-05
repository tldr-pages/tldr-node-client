var request = require('request');
var cache   = require('./cache');
var config  = require('./config');
var http    = require('http');
var path    = require('path');
var os      = require('os');
var unzip   = require('unzip');
var fs      = require('fs');
var crypto  = require('crypto');

if(config.proxy){
  request = request.defaults({'proxy':config.proxy});
}

exports.get = function(path, done) {
 request.get(config.remote.url+"/"+path, function(err, res, body){
    if (err) {
      done('tldr not available (check your internet connection)');
    } else if (res.statusCode != 200) {
      done(path + ' documentation is not available\n' +
        'Consider contributing Pull Request to https://github.com/rprieto/tldr');
    } else {
      cachePath(path, body, done);
    }
 });
}

exports.getTags = function(opts, done) {
  var options = {
    url : "https://api.github.com/repos/" + config.repository.split("#")[0] + "/tags",
    headers : {
      "User-Agent" : "tldr-puller"
    }
  };
  if (opts.github) {
    var parts = opts.github.split(":");
    if (parts.length === 2) {
      options.auth = {
        "user" : parts[0],
        "password" : parts[1]
      };
    }
  }
  request.get(options, function(err, res, body) {
    if (err) {
      done('tldr not available (check your internet connection)');
    } else if (res.statusCode !== 200) {
      console.log("body: " + body);
      console.log("status: " + res.status);
      done('Could not fetch tags. Contact the owner of \'' + config.repository.split("#")[0] + '\' for help');
    } else {
      done(null, JSON.parse(body));
    }
  });
}

exports.getZip = function(url, opts, done) {
  var adir = os.tmpdir(),
      afile = path.join(adir, path.basename(url)),
      options = {
        url : url,
        headers : {
          "User-Agent" : "tldr-puller"
        }
      },
      extractor = unzip.Extract({ path: afile }),
      shaDone = false, zipDone = false,
      shasum = crypto.createHash('sha1');
  
  shasum.setEncoding('hex');    

  if (opts.github) {
    var parts = opts.github.split(":");
    if (parts.length === 2) {
      options.auth = {
        "user" : parts[0],
        "password" : parts[1]
      };
    }
  }

  var adone = function() {
    if (shaDone && zipDone) {
      var bah = shasum.read();
      done(null, { path : afile, shasum : bah });
    }
  }

  extractor.on('finish', function() {
    zipDone = true;
    adone();
  });
  shasum.on('finish', function() {
    shaDone = true;
    adone();
  });
  extractor.on('error', done);
  shasum.on('error', done);

  var req = request.get(options);
  req.on('error', function(err) {
    console.log("ERR: %j", err);
  });
  req.pipe(shasum); // shasum doesnt work unless its first???
  req.pipe(extractor);
}

function cachePath(path, contents, done) {
  cache.save(path, contents, function(err) {
    done(null, contents);
  });
}

