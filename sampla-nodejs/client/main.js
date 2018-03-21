import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Promise } from 'meteor/promise';
import { Session } from 'meteor/session';

import './main.html';

var errMessage1 = '送金元がありません';
var errMessage2 = '送金先がありません';

Template.balance.onCreated(async function balanceOnCreated() {
  //送金元あるか
  this.senderFind = new ReactiveVar(errMessage1);
  //送金元ユーザ名
  this.senderName = new ReactiveVar();
  //送金元残高
  this.senderShow = new ReactiveVar(0);
  //送金先あるか
  this.receiveFind = new ReactiveVar(errMessage2);
  //送金先ユーザ名
  this.receiveName = new ReactiveVar();
  //送金先残高
  this.receiveShow = new ReactiveVar(0);

  console.log("onCreated end");
});

Template.balance.helpers({
  senderFind() {
    console.log("senderFind time");
    return Template.instance().senderFind.get();
  },
  senderName() {
    console.log("senderName time");
    return Template.instance().senderName.get();
  },
  senderShow() {
    console.log("senderShow time");
    return Template.instance().senderShow.get();
  },
  receiveFind() {
    console.log("receiveFind time");
    return Template.instance().receiveFind.get();
  },
  receiveName() {
    console.log("receiveName time");
    return Template.instance().receiveName.get();
  },
  receiveShow() {
    console.log("receiveShow time");
    return Template.instance().receiveShow.get();
  },
});

Template.balance.events({
  //テキストボックスに入力されたユーザ名の残高を表示する
  async 'input #sender'(event, instance) {
    console.log(event.currentTarget.value);
    //残高照会を呼び出す
    var senderBalance = await Meteor.callPromise('zandaka',event.currentTarget.value);
    if(senderBalance != null) {
      instance.senderShow.set(senderBalance);
      instance.senderName.set(event.currentTarget.value);
      instance.senderFind.set('送金元:' + event.currentTarget.value);
    } else {
      instance.senderShow.set('');
      instance.senderFind.set(errMessage1);
    }
  },
  async 'input #receiver'(event, instance) {
    console.log(event.currentTarget.value);
    //残高照会を呼び出す
    var receiverBalance = await Meteor.callPromise('zandaka',event.currentTarget.value);
    if(receiverBalance != null) {
      instance.receiveShow.set(receiverBalance);
      instance.receiveName.set(event.currentTarget.value);
      instance.receiveFind.set('送金先:' + event.currentTarget.value);
    } else {
      instance.receiveShow.set('');
      instance.receiveFind.set(errMessage2);
    }
  },
  async 'click #send'(event, instance) {
    //テキストボックスの文字を取得する
    //金額
    var amtInput = instance.find('input[type=text][id=amt]');
    var amt = amtInput.value;
    console.log(amt);

    if(window.confirm(instance.senderName.get() + 'から' + instance.receiveName.get() + 'に' + amt + 'を送金します。よろしいですか？')){
      var sendBeforeBal = await Meteor.callPromise('zandaka',instance.senderName.get());
      var receiveBeforeBal = await Meteor.callPromise('zandaka',instance.receiveName.get());
      Meteor.call('soukin',instance.senderName.get(),instance.receiveName.get(),amt,async function(err,data) {
        if(!err) { 
            console.log(data);
            //送金元の金額反映
            var sendBalCheck = async function() {
              var sendAfterBal = await Meteor.callPromise('zandaka',instance.senderName.get());
              if(sendBeforeBal != sendAfterBal) {
                //金額反映
                instance.senderShow.set(sendAfterBal);
              } else {
                setTimeout(sendBalCheck,1000);
              }
            }
            //送金先の金額反映
            var receiveBalCheck = async function() {
              var receiveAfterBal = await Meteor.callPromise('zandaka',instance.receiveName.get());
              if(receiveBeforeBal != receiveAfterBal) {
                //金額反映
                instance.receiveShow.set(receiveAfterBal);
              } else {
                setTimeout(receiveBalCheck,1000);
              }
            }            
            sendBalCheck();
            receiveBalCheck();
        }
      });
    } else {
      //キャンセル
    }
  },
});

