'use strict';

var assert = require('assert'),
    sinon = require('sinon'),
    dbUtils = require('../../src/utils/db'),
    logger = require('../../src/utils/logger').Logger;

logger.level = 'error';

describe('server/src/utils/db', function() {

  var dbStub;
  before(function() {
    dbStub = {
      listCollections: function() {
        var ret =  [{name: 'mycol1'}, {name: 'mycol2'}],
            ix = 0;

        return { 
          nextObject:function(cb) {
            return cb(null, (ix >= ret.length) ? null : ret[ix++]);
          }
        };
      },
      collection: function() {
        return {
          drop: function(cb) { cb(); }
        };
      }
    };
  });
  
  describe('collectionExists', function() {

    it("collection exists", function() {
      var cb;
      cb = sinon.spy();
      dbUtils.collectionExists(dbStub, 'mycol2', cb);
      assert(cb.calledWith(null, true));

      cb = sinon.spy();
      dbUtils.collectionExists(dbStub, 'mycol1', cb);
      assert(cb.calledWith(null, true));
    });

    it("collection not exists", function() {
      var cb = sinon.spy();
      dbUtils.collectionExists(dbStub, 'mycol3', cb);
      assert(cb.calledWith(null, false)); 
    });
  });

  describe('dropIfExists', function() {
      
    it("colleciton exists", function() {
      var cb = sinon.spy();
      dbUtils.dropIfExists(dbStub, 'mycol2', cb); 
      assert(cb.calledOnce);
    });

    it("collection not exists", function() {
      var cb = sinon.spy();
      dbUtils.dropIfExists(dbStub, 'mycol3', cb); 
      assert(cb.calledOnce);
    });
  });
});
