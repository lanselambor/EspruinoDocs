/* Copyright (C) 2014 Spence Konde. See the file LICENSE for copying permission. */
/*
This module interfaces with a DHT22 temperature and relative humidity sensor.
Usage (any GPIO pin can be used):

var dht = require("DHT22").connect(C11);
dht.read(function (a) {console.log("Temp is "+a.temp.toString()+" and RH is "+a.rh.toString());});

the return value if no data received: {"temp": -1, "rh": -1, err:true, "checksumError": false}
the return value, if some data is received, but the checksum is invalid: {"temp": -1, "rh": -1, err:true, "checksumError": true}
  */

function DHT22(pin) {
  this.pin = pin;
}

DHT22.prototype.read = function (cb, n) {
  if (!n) n=10;
  var d = ""; 
  var ht = this;
  pinMode(ht.pin); // set pin state to automatic
  digitalWrite(ht.pin, 0);
  setTimeout(function() {
    this.watch = setWatch(function(t) {
      d+=0|(t.time-t.lastTime>0.00005);
    }, ht.pin, {edge:'falling',repeat:true} );
  },20);
  setTimeout(function() {
    clearWatch(ht.watch);
    delete ht.watch;
    var cks = 
        parseInt(d.substr(2,8),2)+
        parseInt(d.substr(10,8),2)+
        parseInt(d.substr(18,8),2)+
        parseInt(d.substr(26,8),2);
    if (cks&&((cks&0xFF)==parseInt(d.substr(34,8),2))) {
      cb({ 
        raw : d,
        rh : parseInt(d.substr(2,16),2)*0.1,
        temp : parseInt(d.substr(19,15),2)*0.2*(0.5-d[18])
      });
    } else {
      if (n>1) setTimeout(function() {ht.read(cb,--n);},500);
      else cb({err:true, checksumError:cks>0, raw:d, temp:-1, rh:-1});
    }
  }, 50);
};

exports.connect = function(pin) {
    return new DHT22(pin);
};
