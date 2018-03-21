import { Meteor } from 'meteor/meteor';
var zan = require('../server/query.js');
var sou = require('../server/invoke.js');

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
  // 残高照会
  'zandaka': async function(_arg1) {
    console.log("zandaka called");
    var data = await zan.zandaka(_arg1);
    console.log(data);
    return data;
  },
  'soukin': function(_arg1,_arg2,_arg3) {
    console.log("soukin called");
    var data = sou.soukin(_arg1,_arg2,_arg3);
    console.log(data);
    return true;
  }
});
