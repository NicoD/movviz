/**
 * movie repository criteria
 * @module repository/movie/criteria
 */
'use strict';

var vsprintf = require("sprintf-js").vsprintf;

var criterias = {

  'search': {
    "line": "function() {" +
            " if(!%2$s) {" +
            "   return this.title.indexOf(\"%1$s\") != -1;" +
            " } else { " +
            "   return this.title.toLowerCase().indexOf(\"%1$s\".toLowerCase()) != -1;"+
            " }" +
            "}",
    "args": [ 
      {
        "name": "pattern"
      },
      {
        "name": "case sensitive (Y/N)",
        "transform": function(str) { return str === "Y"; }
      }
    ]
  }
};


var getWhere = function(args) {
  return vsprintf(this.line, args);
};


/**
 * CriteraRepository
 * centralize criteria access
 *
 * @class
 */
var Repository = function() {


  /**
   * return the criteria corresponding to the given name
   * @param {String} name
   * @return object
   */
  this.findByName = function(name) {
    var ret = Object.create( criterias[name]);
    if(ret) { ret.getWhere = getWhere; }
    return ret;
  };
};


/**
 * Criteria repository factory
 * @return {module:respository/movie/criteria~Repository}
 */
module.exports.create = function() {
  return new Repository();
};
