var ready = false;

var _q = window.location.search.substring(1);
var _v = _q.split('&');
var _p = _v[0];

/* session storage */
const asyncSessionStorage = {
    setItem: async function (key, value) {
        await null;
        return sessionStorage.setItem(key, value);
    },
    getItem: async function (key) {
        await null;
        return sessionStorage.getItem(key);
    }
};

var contract;
var text;

this.windowload();

async function windowload() {
    /* assets */
    // testnet
    var shasta_contract = 'TAwqgmbcCVb7et51DLfz8sNB8jbxniP479';
    var shasta_text = 'Tron Shasta Testnet';

    // mainnet
    var mainnet_contract = 'TXL8jcirh7swUPdH9CyriojPKupswxZ8na';
    var mainnet_text = 'Tron Mainnet';
    
    // tronlink installed
    if(sessionStorage.getItem('aznl_account') && sessionStorage.getItem('aznl_network')) {
        switch(sessionStorage.getItem('aznl_network')) {
            case 'https://api.trongrid.io': // mainnet
                contract = mainnet_contract;
                text = mainnet_text;
                break;
            case 'https://api.shasta.trongrid.io': // shasta testnet
                contract = shasta_contract;
                text = shasta_text;
                break;
            default: // unsupported network
                contract = null;
                text = null;
        }

        await sessionStorage.setItem('aznl_contract',contract);
        await sessionStorage.setItem('aznl_networktext',text);
        
        ready = true;

        if(sessionStorage.getItem('aznl_contract') == null) {
            $('.popupback').css('display', 'block');
            $('#noprovider').css('display', 'block');
        } else {
            $('.popupback').css('display', 'none');
            $('#noprovider').css('display', 'none');
        }

        //this.loader();
        
        try {
            window.onload = function(){
                this.loader();
            };
        } catch(error) {
            this.loader();
        }
    } else {
        window.location = './sign.html';
    }
}

async function loader() {
    var ntwrk = sessionStorage.getItem('aznl_networktext');
    var ntwrktxt = ntwrk.replace(/ /g, '<br />');
    $('.networkloaded').html(ntwrktxt);
    
    $('.acc').text(sessionStorage.getItem('aznl_account'));
    $('.net').text(sessionStorage.getItem('aznl_networktext'));
    $('.cnt').text(sessionStorage.getItem('aznl_contract'));
    
    if(!sessionStorage.getItem('aznl_currcoin')) {
        await sessionStorage.setItem('aznl_currcoin', 'BTC');
        await sessionStorage.setItem('aznl_currcoinid', 11);
    }
    
    if(sessionStorage.getItem('aznl_contract') != null) {
        if(_p == 'weekcoin' || _p == 'daycoin') {
            loadpredictioninfo();
            loadcurrentprice();
            loadassetstats();
        }
        
        if(_p == 'weekcoin') {
            weekcountdowntoopen();
        }
        
        if(_p == 'daycoin') {
            daycountdowntoopen();
        }

        if(_p == 'predictions') {
            loaduserpredictionslist(1);
        }

        if(_p == 'wallet') {
            loaduserbalance();
        }
    } else {
        $('.popupback').css('display', 'block');
        $('#noprovider').css('display', 'block');
    }
    
    
}

async function loadpredictioninfo() {
    let cont = await window.tronWeb.contract().at(contract);
    
    var currassetid, prevassetid, startoffset, closeoffset, endoffset, offsetplus;
    
    if(_p == 'weekcoin') {
        currassetid = this.weekcurrassetid(sessionStorage.getItem('aznl_currcoinid'));
        prevassetid = this.weekprevassetid(sessionStorage.getItem('aznl_currcoinid'));
    } else if(_p == 'daycoin') {
        currassetid = this.daycurrassetid(sessionStorage.getItem('aznl_currcoinid'));
        prevassetid = this.dayprevassetid(sessionStorage.getItem('aznl_currcoinid'));
    }
    
    await sessionStorage.setItem('aznl_currcoinassetid', currassetid);
    
    // current prediction info
    cont.getpredictionasset(Number(currassetid)).call().then(function(receipt){
        var obj = JSON.parse(JSON.stringify(receipt));

        var _coin = obj.a;
        var _date = obj.b;
        var _cycle = parseInt(obj.c._hex);
        var _openprice = parseInt(obj.d._hex);
        var _closeprice = parseInt(obj.e._hex);
        var _pricehigh = parseInt(obj.f._hex);
        var _pricelow = parseInt(obj.g._hex);
        var _isclosed = obj.h;
        var _totstake = parseInt(obj.i._hex);
        var _totpreds = parseInt(obj.j._hex);

        if(_openprice && _isclosed == false) {
            var op = _openprice / 10000;
            var rp = _pricehigh / 10000;
            var fp = _pricelow / 10000;

            var startdatetime, closedatetime, enddatetime;
            var stu, ctu, etu, stl, ctl, etl;

            if(_cycle == 1) {
                if(_p == 'weekcoin') {
                    startdatetime = this.getdate(_date, 0) + "T00:01:00Z";
                    closedatetime = this.getdate(_date, 3) + "T11:59:00Z";
                    enddatetime = this.getdate(_date, 6) + "T23:59:00Z";
                } else if(_p == 'daycoin') {
                    startdatetime = this.getdate(_date, 0) + "T00:01:00Z";
                    closedatetime = this.getdate(_date, 0) + "T11:59:00Z";
                    enddatetime = this.getdate(_date, 0) + "T23:59:00Z";
                }
            } else if(_cycle == 2) {
                if(_p == 'weekcoin') {
                    startdatetime = this.getdate(_date, 3) + "T12:01:00Z";
                    closedatetime = this.getdate(_date, 6) + "T23:59:00Z";
                    enddatetime = this.getdate(_date, 10) + "T11:59:00Z";
                } else if(_p == 'daycoin') {
                    startdatetime = this.getdate(_date, 0) + "T12:01:00Z";
                    closedatetime = this.getdate(_date, 0) + "T23:59:00Z";
                    enddatetime = this.getdate(_date, 1) + "T11:59:00Z";
                }
            }

            sessionStorage.setItem('aznl_currclosedatetime', closedatetime);
            sessionStorage.setItem('aznl_currenddatetime', enddatetime);

            sessionStorage.setItem('aznl_currcoinopenprice', op.toFixed(4));
            sessionStorage.setItem('aznl_currcoinpricehigh', rp.toFixed(4));
            sessionStorage.setItem('aznl_currcoinpricelow', fp.toFixed(4));

            // UTC datetimes
            stu = this.datetime('UTC',startdatetime);
            ctu = this.datetime('UTC',closedatetime);
            etu = this.datetime('UTC',enddatetime);

            // LOCAL datetimes
            stl = this.datetime('LOCAL',startdatetime);
            ctl = this.datetime('LOCAL',closedatetime);
            etl = this.datetime('LOCAL',enddatetime);

            var pq = 'ON '+etu+' // '+etl+' - '+_coin+'/USDT PRICE WILL';

            $('.cycle').text('CYCLE '+_cycle);
            $('.cycletext').html('<b>CYCLE '+_cycle+':</b> '+stu+' ('+stl+') &#8594; '+etu+' ('+etl+')');
            $('.riseprice').text(rp.toFixed(4));
            $('.fallprice').text(fp.toFixed(4));

            $('#openingprice').text(op.toFixed(4));
            $('#openingtime').html(stu+'<br />'+stl);
            $('#predictionquestion').html('<b>'+pq.toUpperCase()+'</b>');
        }
    });

    // previous prediction info
    cont.getpredictionasset(Number(prevassetid)).call().then(function(receipt){
        var obj = JSON.parse(JSON.stringify(receipt));

        var _openprice = parseInt(obj.d._hex);
        var _closeprice = parseInt(obj.e._hex);

        if(_closeprice) {
            var yop = _openprice / 10000;
            var ycp = _closeprice / 10000;

            var ydiff = ycp - yop;
            var yperc = (ydiff / yop) * 100;
            var ycpc = yperc.toFixed(2) + "%";

            if(ycp > yop) {  // price rise
                $("#yestclosing").css("color","green");
                $("#yestchange").css("color","green");
            } else if(ycp < yop) { // price fall
                $("#yestclosing").css("color","red");
                $("#yestchange").css("color","red");
            }

            $('#yestopening').text(yop.toFixed(4));
            $('#yestclosing').text(ycp.toFixed(4));
            $('#yestchange').text(ycpc);
        }
    });

    // get ra/rb/fb stats
    cont.getrapredictionsstats(Number(currassetid)).call().then(function(receipt){
        // ra stats
        
        var obj = JSON.parse(JSON.stringify(receipt));

        var _ratotpreds = parseInt(obj.raa._hex);
        var _ratotstake = parseInt(obj.rab._hex);

        if(!_ratotpreds){_ratotpreds = 0;}
        if(!_ratotstake){_ratotstake = 0;}

        cont.getrbpredictionsstats(Number(currassetid)).call().then(function(receipt){
            // rb stats
            
            var obj = JSON.parse(JSON.stringify(receipt));

            var _rbtotpreds = parseInt(obj.rba._hex);
            var _rbtotstake = parseInt(obj.rbb._hex);

            if(!_rbtotpreds){_rbtotpreds = 0;}
            if(!_rbtotstake){_rbtotstake = 0;}

            cont.getfbpredictionsstats(Number(currassetid)).call().then(function(receipt){
                // fb stats
                
                var obj = JSON.parse(JSON.stringify(receipt));

                var _fbtotpreds = parseInt(obj.fba._hex);
                var _fbtotstake = parseInt(obj.fbb._hex);

                if(!_fbtotpreds){_fbtotpreds = 0;}
                if(!_fbtotstake){_fbtotstake = 0;}

                var _totpreds = _ratotpreds + _rbtotpreds + _fbtotpreds;
                var _totstake = _ratotstake + _rbtotstake + _fbtotstake;

                if(_totpreds > 0) {
                    var _rap = (_ratotpreds / _totpreds) * 100;
                    var _rbp = (_rbtotpreds / _totpreds) * 100;
                    var _fbp = (_fbtotpreds / _totpreds) * 100;

                    _rap = _rap.toFixed();
                    _rbp = _rbp.toFixed();
                    _fbp = _fbp.toFixed();

                    $(".rasenttext").text(_rap+"%");
                    $(".rbsenttext").text(_rbp+"%");
                    $(".fbsenttext").text(_fbp+"%");

                    if(_rap > 90){_rap = 90;}
                    if(_rap < 5){_rap = 5;}

                    if(_rbp > 90){_rbp = 90;}
                    if(_rbp < 5){_rbp = 5;}

                    if(_fbp > 90){_fbp = 90;}
                    if(_fbp < 5){_fbp = 5;}

                    _rap = _rap + "%";
                    _rbp = _rbp + "%";
                    _fbp = _fbp + "%";

                    $(".rasent").css("width",_rap);
                    $(".rasenttext").css("width",_rap);
                    $(".rbsent").css("width",_rbp);
                    $(".rbsenttext").css("width",_rbp);
                    $(".fbsent").css("width",_fbp);
                    $(".fbsenttext").css("width",_fbp);
                } else {
                    $(".rasenttext").text("0%");
                    $(".rbsenttext").text("0%");
                    $(".fbsenttext").text("0%");
                    
                    $(".rasent").css("width","33%");
                    $(".rasenttext").css("width","33%");
                    $(".rbsent").css("width","34%");
                    $(".rbsenttext").css("width","34%");
                    $(".fbsent").css("width","33%");
                    $(".fbsenttext").css("width","33%");
                }

                if(_totstake > 0) {
                    var _rats = _ratotstake / 1000000;
                    var _rbts = _rbtotstake / 1000000;
                    var _fbts = _fbtotstake / 1000000;

                    var _ras = (_ratotstake / _totstake) * 100;
                    var _rbs = (_rbtotstake / _totstake) * 100;
                    var _fbs = (_fbtotstake / _totstake) * 100;

                    _ras = _ras.toFixed();
                    _rbs = _rbs.toFixed();
                    _fbs = _fbs.toFixed();

                    $(".rastaketext").text(_rats.toFixed(2));
                    $(".rbstaketext").text(_rbts.toFixed(2));
                    $(".fbstaketext").text(_fbts.toFixed(2));

                    if(_ras > 80){_ras = 80;}
                    if(_ras < 10){_ras = 10;}

                    if(_rbs > 80){_rbs = 80;}
                    if(_rbs < 10){_rbs = 10;}

                    if(_fbs > 80){_fbs = 80;}
                    if(_fbs < 10){_fbs = 10;}

                    _ras = _ras + "%";
                    _rbs = _rbs + "%";
                    _fbs = _fbs + "%";

                    $(".rastake").css("width",_rap);
                    $(".rastaketext").css("width",_rap);
                    $(".rbstake").css("width",_rbp);
                    $(".rbstaketext").css("width",_rbp);
                    $(".fbstake").css("width",_fbp);
                    $(".fbstaketext").css("width",_fbp);
                } else {
                    $(".rastaketext").text("0.00");
                    $(".rbstaketext").text("0.00");
                    $(".fbstaketext").text("0.00");
                    
                    $(".rastake").css("width","33%");
                    $(".rastaketext").css("width","33%");
                    $(".rbstake").css("width","34%");
                    $(".rbstaketext").css("width","34%");
                    $(".fbstake").css("width","33%");
                    $(".fbstaketext").css("width","33%");
                }
            });
        });
    });
}

function loadcurrentprice() {
    var coinpair = sessionStorage.getItem('aznl_currcoin') + 'USDT';
    var url = "https://api.binance.com/api/v3/ticker/price?symbol=" + coinpair;
    
    $.get(url, function(data){
        var obj = JSON.parse(JSON.stringify(data));
        var cp = Number(obj.price);
        var op = sessionStorage.getItem('aznl_currcoinopenprice');
        
        var diff = cp - op;
        var perc = (diff / op) * 100;
        var cpc = perc.toFixed(2) + "%";

        if(cp > op) {  // price rise
            $("#currentprice").css("color","green");
            $("#currentpercent").css("color","green");
        } else if(cp < op) { // price fall
            $("#currentprice").css("color","red");
            $("#currentpercent").css("color","red");
        }

        $("#currentprice").text(cp.toFixed(4));
        $("#currentpercent").text(cpc);
    });
}

async function loadassetstats() {
    let cont = await window.tronWeb.contract().at(contract);
    
    var currassetid;
    
    if(_p == 'weekcoin') {
        currassetid = this.weekcurrassetid(sessionStorage.getItem('aznl_currcoinid'));
    } else if(_p == 'daycoin') {
        currassetid = this.daycurrassetid(sessionStorage.getItem('aznl_currcoinid'));
    }
    
    // get ra/rb/fb stats
    cont.getrapredictionsstats(Number(currassetid)).call().then(function(receipt){
        // ra stats
        
        var obj = JSON.parse(JSON.stringify(receipt));

        var _ratotpreds = parseInt(obj.raa._hex);
        var _ratotstake = parseInt(obj.rab._hex);

        if(!_ratotpreds){_ratotpreds = 0;}
        if(!_ratotstake){_ratotstake = 0;}

        cont.getrbpredictionsstats(Number(currassetid)).call().then(function(receipt){
            // rb stats
            
            var obj = JSON.parse(JSON.stringify(receipt));

            var _rbtotpreds = parseInt(obj.rba._hex);
            var _rbtotstake = parseInt(obj.rbb._hex);

            if(!_rbtotpreds){_rbtotpreds = 0;}
            if(!_rbtotstake){_rbtotstake = 0;}

            cont.getfbpredictionsstats(Number(currassetid)).call().then(function(receipt){
                // fb stats
                
                var obj = JSON.parse(JSON.stringify(receipt));

                var _fbtotpreds = parseInt(obj.fba._hex);
                var _fbtotstake = parseInt(obj.fbb._hex);

                if(!_fbtotpreds){_fbtotpreds = 0;}
                if(!_fbtotstake){_fbtotstake = 0;}

                var _totpreds = _ratotpreds + _rbtotpreds + _fbtotpreds;
                var _totstake = _ratotstake + _rbtotstake + _fbtotstake;

                if(_totpreds > 0) {
                    var _rap = (_ratotpreds / _totpreds) * 100;
                    var _rbp = (_rbtotpreds / _totpreds) * 100;
                    var _fbp = (_fbtotpreds / _totpreds) * 100;

                    _rap = _rap.toFixed();
                    _rbp = _rbp.toFixed();
                    _fbp = _fbp.toFixed();

                    $(".rasenttext").text(_rap+"%");
                    $(".rbsenttext").text(_rbp+"%");
                    $(".fbsenttext").text(_fbp+"%");
                    
                    $("#rasenttext").text(_rap+"%");
                    $("#rbsenttext").text(_rbp+"%");
                    $("#fbsenttext").text(_fbp+"%");

                    if(_rap > 90){_rap = 90;}
                    if(_rap < 5){_rap = 5;}

                    if(_rbp > 90){_rbp = 90;}
                    if(_rbp < 5){_rbp = 5;}

                    if(_fbp > 90){_fbp = 90;}
                    if(_fbp < 5){_fbp = 5;}

                    _rap = _rap + "%";
                    _rbp = _rbp + "%";
                    _fbp = _fbp + "%";

                    $(".rasent").css("width",_rap);
                    $(".rasenttext").css("width",_rap);
                    $(".rbsent").css("width",_rbp);
                    $(".rbsenttext").css("width",_rbp);
                    $(".fbsent").css("width",_fbp);
                    $(".fbsenttext").css("width",_fbp);
                } else {
                    $(".rasenttext").text("0%");
                    $(".rbsenttext").text("0%");
                    $(".fbsenttext").text("0%");
                    
                    $("#rasenttext").text("0%");
                    $("#rbsenttext").text("0%");
                    $("#fbsenttext").text("0%");
                    
                    $(".rasent").css("width","33%");
                    $(".rasenttext").css("width","33%");
                    $(".rbsent").css("width","34%");
                    $(".rbsenttext").css("width","34%");
                    $(".fbsent").css("width","33%");
                    $(".fbsenttext").css("width","33%");
                }

                if(_totstake > 0) {
                    var _rats = _ratotstake / 1000000;
                    var _rbts = _rbtotstake / 1000000;
                    var _fbts = _fbtotstake / 1000000;

                    var _ras = (_ratotstake / _totstake) * 100;
                    var _rbs = (_rbtotstake / _totstake) * 100;
                    var _fbs = (_fbtotstake / _totstake) * 100;

                    _ras = _ras.toFixed();
                    _rbs = _rbs.toFixed();
                    _fbs = _fbs.toFixed();

                    $(".rastaketext").text(_rats.toFixed(2));
                    $(".rbstaketext").text(_rbts.toFixed(2));
                    $(".fbstaketext").text(_fbts.toFixed(2));
                    
                    $("#rastaketext").text(_rats.toFixed(4));
                    $("#rbstaketext").text(_rbts.toFixed(4));
                    $("#fbstaketext").text(_fbts.toFixed(4));

                    if(_ras > 80){_ras = 80;}
                    if(_ras < 10){_ras = 10;}

                    if(_rbs > 80){_rbs = 80;}
                    if(_rbs < 10){_rbs = 10;}

                    if(_fbs > 80){_fbs = 80;}
                    if(_fbs < 10){_fbs = 10;}

                    _ras = _ras + "%";
                    _rbs = _rbs + "%";
                    _fbs = _fbs + "%";

                    $(".rastake").css("width",_rap);
                    $(".rastaketext").css("width",_rap);
                    $(".rbstake").css("width",_rbp);
                    $(".rbstaketext").css("width",_rbp);
                    $(".fbstake").css("width",_fbp);
                    $(".fbstaketext").css("width",_fbp);
                } else {
                    $(".rastaketext").text("0.00");
                    $(".rbstaketext").text("0.00");
                    $(".fbstaketext").text("0.00");
                    
                    $("#rastaketext").text("0.0000");
                    $("#rbstaketext").text("0.0000");
                    $("#fbstaketext").text("0.0000");
                    
                    $(".rastake").css("width","33%");
                    $(".rastaketext").css("width","33%");
                    $(".rbstake").css("width","34%");
                    $(".rbstaketext").css("width","34%");
                    $(".fbstake").css("width","33%");
                    $(".fbstaketext").css("width","33%");
                }
            });
        });
    });
}

function makeprediction(pred) {
    var _ws = screen.availWidth;
    
    var etu = this.datetime('UTC',sessionStorage.getItem('aznl_currenddatetime'));
    var etl = this.datetime('LOCAL',sessionStorage.getItem('aznl_currenddatetime'));
    var stk;
    
    var img = '<img src="./images/coins/'+sessionStorage.getItem('aznl_currcoin')+'USDT.png" style="height:30px;vertical-align:middle;" />';
    var pt = 'ON '+etu+' // '+etl+'<br />'+sessionStorage.getItem('aznl_currcoin')+'/USDT PRICE WILL:<br /><br />';
    
    if(pred == 1) { //RA
        pt += '<b>RISE ABOVE '+sessionStorage.getItem('aznl_currcoinpricehigh')+'</b>';
    } else if(pred == 2) { //RB
        pt += '<b>RANGE BETWEEN '+sessionStorage.getItem('aznl_currcoinpricelow')+' AND '+sessionStorage.getItem('aznl_currcoinpricehigh')+'</b>';
    } else if(pred == 3) { //FB
        pt += '<b>FALL BELOW '+sessionStorage.getItem('aznl_currcoinpricelow')+'</b>';
    }
    
    if(_ws > 1000) {
        stk = document.getElementById("stakeamountwide").value;
    } else if(_ws < 600) {
        stk = document.getElementById("stakeamountnarrow").value;
    } else {
        stk = document.getElementById("stakeamountmid").value;
    }
    
    $('.predictionimg').html(img);
    
    $('.predictioncoinpair').text(sessionStorage.getItem('aznl_currcoin')+'/USDT');
    $('.prediction').html(pt);
    $('.predictionstake').html('<b>'+stk+' TRX</b>');
    
    if(stk == 0) {
        $('.predictionconfirm').html('[ERROR] Stake cannot be 0 TRX.');
        
        $('.predictionstake').css('color', 'red');
        $('.predictionconfirm').css('color', 'red');
        $('.predictionconfirm').css('font-weight', 'bold');
    } else {
        $('.predictionconfirm').html('<div class="confirmbutton" onclick="confirmprediction('+pred+')">Confirm Prediction</div>');
        
        $('.predictionstake').css('color', 'green');
        $('.predictionconfirm').css('color', '#fff');
    }
    
    $('.popupback').css('display', 'block');
    $('#predconfirm').css('display', 'block');
}

async function confirmprediction(pred) {
    let cont = await window.tronWeb.contract().at(contract);
    
    var _ws = screen.availWidth;
    var stk;
    
    var _acc = sessionStorage.getItem('aznl_account');
    var _asset = sessionStorage.getItem('aznl_currcoinassetid');
    var _pred = _asset+''+pred;
    
    if(_ws > 1000) {
        stk = document.getElementById("stakeamountwide").value;
    } else if(_ws < 600) {
        stk = document.getElementById("stakeamountnarrow").value;
    } else {
        stk = document.getElementById("stakeamountmid").value;
    }
    
    var stake = stk * 1000000;
    
    var sendtxt = '<div style="color:green;"><b>Sending Prediction. It may take a minute or so. Please Wait...</b></div>';
    $('.predictionconfirm').html(sendtxt);
    
    cont.makeuserprediction(_asset, _pred, sessionStorage.getItem('aznl_affiliate')).send({
        callValue: stake,
        shouldPollResponse: true
    }).then(function(receipt){
        var cnfrmtxt = '<div style="color:green;"><b>PREDICTION SENT SUCCESSFULLY</b></div><div>&nbsp;</div><div class="confirmbutton" onclick="popupclose()">Done</div>';

        $('.predictionconfirm').css('color', '#fff');
        $('.predictionconfirm').css('font-weight', 'normal');

        $('.predictionconfirm').html(cnfrmtxt);
    }).catch(function(error){
        $('.predictionconfirm').html('[ERROR] '+error);
        
        $('.predictionconfirm').css('color', 'red');
        $('.predictionconfirm').css('font-weight', 'bold');
    });
}

async function loaduserbalance() {
    await window.tronWeb;
    
    window.tronWeb.trx.getBalance(sessionStorage.getItem('aznl_account')).then(function(balance){
        var bal = balance / 1000000;
        $('.bal').text(bal + " TRX");
        
        if(sessionStorage.getItem('aznl_networktext') == "Tron Shasta Testnet") {
            $('.usdtbal').text("TEST TRX");
        } else {
            var priceurl = "https://api.binance.com/api/v3/ticker/price?symbol=TRXUSDT";

            $.get(priceurl, function(pricedata){
                var priceobj = JSON.parse(JSON.stringify(pricedata));
                var usdtprice = Number(priceobj.price);

                var usdtbal = bal * usdtprice;
                $('.usdtbal').text(usdtbal.toFixed(2) + " USDT");
            });
        }
    });
}

async function loaduserpredictionslist(page) {
    let cont = await window.tronWeb.contract().at(contract);
    
    cont.getnumusertransactions().call().then(function(receipt){
        var txnums = Number(receipt);
        var pages = Math.ceil(txnums / 10);
        
        if(txnums > 0) {
            if(page == 1) {
                predsind = txnums - 1;
                
                predslist = '<table cellpadding="0" cellspacing="0" border="0" class="predrow"><tr>';
                predslist += '<td class="predstxt"><b>Prediction</b></td>';
                predslist += '<td class="predsstk"><b>Stake</b></td>';
                predslist += '</tr></table>';
            }
            
            var ind = predsind;
            var lst = ind - 10;

            if(ind < 10) {
                lst = -1;
            }
            var stampday = 1000 * 60 * 60 * 24;
            
            while(ind > lst) {
                cont.getlistusertransaction(ind).call().then(function(receipt){
                    var obj = JSON.parse(JSON.stringify(receipt));

                    var _isusertx = obj.isusertx;

                    if(_isusertx == true) {
                        var _predtx = parseInt(obj.predtx._hex);
                        var _assetid = parseInt(obj.a._hex);
                        var _predid = parseInt(obj.b._hex);
                        var _stake = parseInt(obj.c._hex) / 1000000;
                        var _stamp = parseInt(obj.d._hex) * 1000;
                        var _iscorrect = obj.e;
                        
                        var prdsstk = _stake+' TRX';
                        
                        var assetstring = _assetid.toString();
                        var d = Number(assetstring.substr(-2, 1));
                        
                        cont.getpredictionasset(_assetid).call().then(async function(receipt){
                            var obj = JSON.parse(JSON.stringify(receipt));
                            
                            var _coin = obj.a;
                            var _date = obj.b;
                            var _cycle = parseInt(obj.c._hex);
                            var _closeprice = parseInt(obj.e._hex) / 10000;
                            var _pricehigh = parseInt(obj.f._hex) / 10000;
                            var _pricelow = parseInt(obj.g._hex) / 10000;
                            var _isclosed = obj.h;
                            
                            var enddtstrng;
                            var offset;
                            
                            if(d == 7) {
                                // weekly
                                if(_cycle == 1) {
                                    enddtstrng = _date + 'T23:59:00Z';
                                    offset = stampday * 6;
                                } else if(_cycle == 2) {
                                    enddtstrng = _date + 'T11:59:00Z';
                                    offset = stampday * 10;
                                }
                            } else if(d == 1) {
                                // daily
                                if(_cycle == 1) {
                                    enddtstrng = _date + 'T23:59:00Z';
                                    offset = 0;
                                } else if(_cycle == 2) {
                                    enddtstrng = _date + 'T11:59:00Z';
                                    offset = stampday;
                                }
                            }
                            
                            var enddt = new Date(enddtstrng);
                            var endstmp = enddt.getTime() + offset;
                            var enddate = new Date(endstmp);
                            var enddateutc = this.datetime('UTC',enddate);
                            var enddateloc = this.datetime('LOCAL',enddate);
                            
                            var assprd = _assetid * 10;
                            var prdstxt = '<span style="font-size:0.8em;color:#aaa;">'+new Date(_stamp)+'</span>';
                            var prdsts;

                            if(_predid == assprd + 1) {
                                // rise above
                                prdstxt += '<br /><br />'+_coin+'/USDT Price to RISE ABOVE '+_pricehigh.toFixed(4);
                            } else if(_predid == assprd + 2) {
                                // range between
                                prdstxt += '<br /><br />'+_coin+'/USDT Price to RANGE BETWEEN '+_pricelow.toFixed(4)+' AND '+_pricehigh.toFixed(4);
                            } else if(_predid == assprd + 3) {
                                // fall below
                                prdstxt += '<br /><br />'+_coin+'/USDT Price to FALL BELOW '+_pricelow.toFixed(4);
                            }
                            
                            prdstxt += '<br />On '+enddateutc+' // '+enddateloc;
                            
                            if(_isclosed == true) {
                                if(_closeprice == 0) {
                                    prdsts = '&nbsp;&nbsp;<span style="background-color:#111;">&nbsp;&nbsp;&nbsp;</span>';
                                } else {
                                    if(_iscorrect == true) {
                                        prdsts = '&nbsp;&nbsp;<span style="background-color:green;">&nbsp;&nbsp;&nbsp;</span>';
                                    } else {
                                        prdsts = '&nbsp;&nbsp;<span style="background-color:red;">&nbsp;&nbsp;&nbsp;</span>';
                                    }
                                }
                            } else {
                                prdsts = '&nbsp;&nbsp;<span style="background-color:#369;">&nbsp;&nbsp;&nbsp;</span>';
                            }
                            
                            var coinpair = _coin + 'USDT';
                            var url = "https://api.binance.com/api/v3/ticker/price?symbol=" + coinpair;
                            var _currprice;

                            await $.get(url, function(data){
                                var obj = JSON.parse(JSON.stringify(data));
                                var cp = Number(obj.price);

                                prdstxt += '<br /><br /><b><span style="font-size:0.9em;color:#aaa;">Current Price: '+cp.toFixed(4)+' USDT</span></b>';
                                _currprice = cp.toFixed(4);
                            });
                            
                            predslist += '<table cellpadding="0" cellspacing="0" border="0" class="predrow" style="cursor:pointer;" onclick="loaduserprediction('+_predtx+','+_currprice+')"><tr>';
                            predslist += '<td class="predsimg"><img src="./images/coins/'+_coin+'USDT.png" style="width:50px;vertical-align:middle;" /></td>';
                            predslist += '<td class="predstxt">'+prdstxt+'</td>';
                            predslist += '<td class="predsstk">'+prdsstk+prdsts+'</td>';
                            predslist += '</tr></table>';
                            
                            $('.preds').html(predslist);
                        });
                    }
                });

                ind--;
            }
            
            if(page < pages) {
                var pg = page + 1;
                var more = '<div class="morebutton" onclick="loaduserpredictionslist('+pg+')">View More</div>';
                $('.more').html(more);
                
                predsind = ind;
                page++;
            } else {
                $('.more').html('');
            }
        } else {
            $('.preds').html('<div class="nopreds">You have not made any predictions on the current network yet.</div>');
        }
            
    });
}

async function loaduserprediction(_predtx,_currprice) {
    let cont = await window.tronWeb.contract().at(contract);
    
    cont.getusertransaction(_predtx).call().then(function(receipt){
        var obj = JSON.parse(JSON.stringify(receipt));

        var _isusertx = obj.isusertx;

        if(_isusertx == true) {
            var _assetid = parseInt(obj.a._hex);
            var _predid = parseInt(obj.b._hex);
            var _stake = parseInt(obj.c._hex) / 1000000;
            var _reward = parseInt(obj.d._hex) / 1000000;
            var _stamp = parseInt(obj.e._hex) * 1000;
            var _iscorrect = obj.f;
            var _rewardpaid = obj.g;
            
            var _payout = 0;
            var prdsrwd = 0;
            var prdspay = 0;
            var prdscnfrm = null;
            
            var rwrdperc = (Number(_reward)  / Number(_stake)) * 100;

            var prdsstk = _stake.toFixed(4)+' TRX';
            
            var assetstring = _assetid.toString();
            var d = Number(assetstring.substr(-2, 1));
            var stampday = 1000 * 60 * 60 * 24;

            cont.getpredictionasset(_assetid).call().then(async function(receipt){
                var obj = JSON.parse(JSON.stringify(receipt));

                var _coin = obj.a;
                var _date = obj.b;
                var _cycle = parseInt(obj.c._hex);
                var _closeprice = parseInt(obj.e._hex) / 10000;
                var _pricehigh = parseInt(obj.f._hex) / 10000;
                var _pricelow = parseInt(obj.g._hex) / 10000;
                var _isclosed = obj.h;

                var enddtstrng;
                var offset;

                if(d == 7) {
                    // weekly
                    if(_cycle == 1) {
                        enddtstrng = _date + 'T23:59:00Z';
                        offset = stampday * 6;
                    } else if(_cycle == 2) {
                        enddtstrng = _date + 'T11:59:00Z';
                        offset = stampday * 10;
                    }
                } else if(d == 1) {
                    // daily
                    if(_cycle == 1) {
                        enddtstrng = _date + 'T23:59:00Z';
                        offset = 0;
                    } else if(_cycle == 2) {
                        enddtstrng = _date + 'T11:59:00Z';
                        offset = stampday;
                    }
                }

                var enddt = new Date(enddtstrng);
                var endstmp = enddt.getTime() + offset;
                var enddate = new Date(endstmp);
                var enddateutc = this.datetime('UTC',enddate);
                var enddateloc = this.datetime('LOCAL',enddate);

                var assprd = _assetid * 10;
                var prdstxt = '';
                var prdscp;
                var prdscurrp;
                
                var img = '<img src="./images/coins/'+_coin+'USDT.png" style="height:30px;vertical-align:middle;" />';

                if(_predid == assprd + 1) {
                    // rise above
                    prdstxt += _coin+'/USDT Price to RISE ABOVE '+_pricehigh.toFixed(4);
                } else if(_predid == assprd + 2) {
                    // range between
                    prdstxt += _coin+'/USDT Price to RANGE BETWEEN '+_pricelow.toFixed(4)+' AND '+_pricehigh.toFixed(4);
                } else if(_predid == assprd + 3) {
                    // fall below
                    prdstxt += _coin+'/USDT Price to FALL BELOW '+_pricelow.toFixed(4);
                }

                prdstxt += '<br />On '+enddateutc+' // '+enddateloc;

                if(_isclosed == true) {
                    if(_closeprice == 0) {
                        prdsrwd = 'Not Yet Set';
                        prdspay = 'Not Yet Set';
                        prdscp = 'Not Yet Set';
                        
                        $('.predictionconfirm').html('');
                    } else {
                        prdscp = _closeprice.toFixed(4) + ' USDT';
                        
                        if(_iscorrect == true) {
                            _payout = Number(_stake) + Number(_reward);
                            
                            var prdsrwdtrx = _reward;
                            var prdspaytrx = _payout;
                            
                            prdsrwd = '<span style="color:green;">'+Number(prdsrwdtrx).toFixed(4)+' TRX ['+rwrdperc+'%]</span>';
                            prdspay = '<span style="color:green;">'+Number(prdspaytrx).toFixed(4)+' TRX</span>';
                            
                            if(_rewardpaid == false) {
                                $('.predictionconfirm').html('<div class="confirmbutton" onclick="withdraw('+_assetid+','+_predtx+')">Withdraw Pay Out</div>');
                            } else {
                                $('.predictionconfirm').html('');
                                prdspay = '<span style="color:green;">'+Number(prdspaytrx).toFixed(4)+' TRX <b>[PAID OUT]</b></span>';
                            }
                            
                            $('.predictionconfirm').css('color', '#fff');
                        } else {
                            prdsrwd = '<span style="color:red;">-'+prdsstk+' - Incorrect Prediction [-100%]</span>';
                            prdspay = '<span style="color:red;">0.0000 TRX - Incorrect Prediction</span>';
                            
                            $('.predictionconfirm').html('');
                        }
                    }
                } else {
                    prdsrwd = 'Not Yet Set';
                    prdspay = 'Not Yet Set';
                    prdscp = 'Not Yet Set';
                    
                    $('.predictionconfirm').html('');
                }
                
                $('.predictionimg').html(img);
                $('.predictioncoinpair').html(_coin+'/USDT');
                $('.prediction').html(prdstxt);
                $('.predictioncurrentprice').html(_currprice.toFixed(4)+' USDT');
                $('.predictioncloseprice').html(prdscp);
                $('.predictiondatetime').html(new Date(_stamp));
                $('.predictionstake').html(prdsstk);
                $('.predictionreward').html(prdsrwd);
                $('.predictionpayout').html(prdspay);
                
                $('.popupback').css('display', 'block');
                $('#predview').css('display', 'block');
            });
        }
    });
}

async function withdraw(_asset,_predtx) {
    let cont = await window.tronWeb.contract().at(contract);
    
    var _acc = sessionStorage.getItem('aznl_account');
    
    cont.getusertransaction(_predtx).call().then(function(receipt){
        var obj = JSON.parse(JSON.stringify(receipt));

        var _isusertx = obj.isusertx;
        var _rewardpaid = obj.g;

        if(_isusertx == true && _rewardpaid == false) {
            
            var sendtxt = '<div style="color:green;"><b>Sending Withdrawal Request. It may take a minute or so. Please Wait...</b></div>';
            $('.predictionconfirm').html(sendtxt);
            
            cont.withdrawuserreward(_asset, _predtx).send({shouldPollResponse: true}).then(function(receipt){
                var cnfrmtxt = '<div style="color:green;"><b>WITHDRAWAL REQUEST SUCCESSFUL</b></div><div>&nbsp;</div><div class="confirmbutton" onclick="popupclose()">Done</div>';

                $('.predictionconfirm').css('color', '#fff');
                $('.predictionconfirm').css('font-weight', 'normal');

                $('.predictionconfirm').html(cnfrmtxt);
            }).catch(function(error){
                $('.predictionconfirm').html('[ERROR] '+error.message);

                $('.predictionconfirm').css('color', 'red');
                $('.predictionconfirm').css('font-weight', 'bold');
            });
        }
    });
}

function countdown() {
    var countDownDate = new Date(sessionStorage.getItem('aznl_currclosedatetime')).getTime();
    var now = new Date().getTime();
    
    var distance = countDownDate - now;
    
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    $('#days').text(days);
    $('#hours').text(hours);
    $('#minutes').text(minutes);
    $('#seconds').text(seconds);
}

function popupclose() {
    $('.popup').css('display', 'none');
    $('.popupback').css('display', 'none');
}
    
function weekcurrassetid(coin) {
    var cycle;
    var stamp = Date.now();
    var date = new Date();
    var stampday = 1000 * 60 * 60 * 24;
    var today = date.getUTCDay();
    var hour = date.getUTCHours();

    if(today < 3) { // sunday to tuesday (0 to 2)
        cycle = 1;
    } else if(today > 3) { // thursday to saturday (4 to 6)
        cycle = 2;
    } else { // wednesday
        if(hour < 12) { // before 12 noon
            cycle = 1;
        } else { // on and after 12 noon
            cycle = 2;
        }
    }

    var costamp1 = stamp - (today * stampday);

    var codate1 = new Date(costamp1),
        coyr1 = codate1.getUTCFullYear(),
        comn1 = codate1.getUTCMonth()+1,
        codt1 = codate1.getUTCDate();

    if(comn1 < 10){comn1 = '0'+comn1;}
    if(codt1 < 10){codt1 = '0'+codt1;}

    var assetstring = coin+""+coyr1+""+comn1+""+codt1+"7"+cycle;

    return assetstring;
}

function weekprevassetid(coin) {
    var cycle;
    var stamp = Date.now();
    var date = new Date();
    var stampday = 1000 * 60 * 60 * 24;
    var stampweek = stampday * 7;
    var today = date.getUTCDay();
    var hour = date.getUTCHours();

    if(today < 3) { // sunday to tuesday (0 to 2)
        cycle = 1;
    } else if(today > 3) { // thursday to saturday (4 to 6)
        cycle = 2;
    } else { // wednesday
        if(hour < 12) { // before 12 noon
            cycle = 1;
        } else { // on and after 12 noon
            cycle = 2;
        }
    }

    var postamp1 = (stamp - (today * stampday)) - stampweek;

    var podate1 = new Date(postamp1),
        poyr1 = podate1.getUTCFullYear(),
        pomn1 = podate1.getUTCMonth()+1,
        podt1 = podate1.getUTCDate();

    if(pomn1 < 10){pomn1 = '0'+pomn1;}
    if(podt1 < 10){podt1 = '0'+podt1;}

    var assetstring = coin+""+poyr1+""+pomn1+""+podt1+"7"+cycle;

    return assetstring;
}

function weekcountdowntoopen() {
    var stamp = Date.now();
    var date = new Date();
    var stampday = 1000 * 60 * 60 * 24;
    var today = date.getUTCDay();
    var hour = date.getUTCHours();
    var mins = date.getUTCMinutes();
    var secs = date.getUTCSeconds();
    
    var closed = false;
    var opentime;
    
    // saturday 23:59
    if (today == 6 && hour == 23 && mins == 59) {
        closed = true;
        date.setUTCHours(0);
        
        if(date.getHours() < 10) {
            opentime = '0'+date.getHours()+':10';
        } else {
            opentime = date.getHours()+':10';
        }
    }
    
    // sunday 00:00 - 00:10
    if (today == 0 && hour == 0 && mins < 10) {
        closed = true;
        
        if(date.getHours() < 10) {
            opentime = '0'+date.getHours()+':10';
        } else {
            opentime = date.getHours()+':10';
        }
    }
    
    // wednesday 11:59
    if (today == 3 && hour == 11 && mins == 59) {
        closed = true;
        date.setUTCHours(12);
        
        if(date.getHours() < 10) {
            opentime = '0'+date.getHours()+':10';
        } else {
            opentime = date.getHours()+':10';
        }
    }
    
    // wednesday 12:00 - 12:10
    if (today == 3 && hour == 12 && mins < 10) {
        closed = true;
        
        if(date.getHours() < 10) {
            opentime = '0'+date.getHours()+':10';
        } else {
            opentime = date.getHours()+':10';
        }
    }
    
    if(closed == true) {
        $('#predsopentime').text(opentime);
        $('#predsclosed').css('width', pwtxt);
        $('#predsclosed').css('height', '100%');
        $('#predsclosed').css('border', 'none');
        $('#predsclosed').css('position', 'fixed');
        $('#predsclosed').css('top', '0');
        $('#predsclosed').css('left', '110px');
        $('#predsclosed').css('display', 'block');
    } else {
        $('#predsclosed').css('display', 'none');
    }
    
    // Sunday 00:10
    if (today == 0 && hour == 0 && mins == 10 && secs < 3) {
        this.loadpredictioninfo();
    }
    
    // Wednesday 12:10
    if (today == 3 && hour == 12 && mins == 10 && secs < 3) {
        this.loadpredictioninfo();
    }
}

function daycurrassetid(coin) {
    var cycle;
    var date = new Date(),
        hr = date.getUTCHours,
        dt = date.getUTCDate(),
        mn = date.getUTCMonth() + 1,
        yr = date.getUTCFullYear();
    
    if(hr < 12) {
        cycle = 1;
    } else {
        cycle = 2;
    }
    
    if(mn < 10){mn = '0'+mn;}
    if(dt < 10){dt = '0'+dt;}
    
    var assetstring = coin+""+yr+""+mn+""+dt+"1"+cycle;
    
    return assetstring;
}

function dayprevassetid(coin) {
    var cycle;
    var stamp = Date.now() - (1000 * 60 * 60 * 24);
    var date = new Date(stamp),
        hr = date.getUTCHours,
        dt = date.getUTCDate(),
        mn = date.getUTCMonth() + 1,
        yr = date.getUTCFullYear();
    
    if(hr < 12) {
        cycle = 1;
    } else {
        cycle = 2;
    }
    
    if(mn < 10){mn = '0'+mn;}
    if(dt < 10){dt = '0'+dt;}
    
    var assetstring = coin+""+yr+""+mn+""+dt+"1"+cycle;
    
    return assetstring;
}

function daycountdowntoopen() {
    var stamp = Date.now();
    var date = new Date();
    var stampday = 1000 * 60 * 60 * 24;
    var today = date.getUTCDay();
    var hour = date.getUTCHours();
    var mins = date.getUTCMinutes();
    var secs = date.getUTCSeconds();
    
    var closed = false;
    var opentime;
    
    // 23:59
    if (hour == 23 && mins == 59) {
        closed = true;
        date.setUTCHours(0);
        
        if(date.getHours() < 10) {
            opentime = '0'+date.getHours()+':05';
        } else {
            opentime = date.getHours()+':05';
        }
    }
    
    // 00:00 - 00:10
    if (hour == 0 && mins < 10) {
        closed = true;
        
        if(date.getHours() < 10) {
            opentime = '0'+date.getHours()+':10';
        } else {
            opentime = date.getHours()+':10';
        }
    }
    
    // 11:59
    if (hour == 11 && mins == 59) {
        closed = true;
        date.setUTCHours(12);
        
        if(date.getHours() < 10) {
            opentime = '0'+date.getHours()+':10';
        } else {
            opentime = date.getHours()+':10';
        }
    }
    
    // 12:00 - 12:10
    if (hour == 12 && mins < 10) {
        closed = true;
        
        if(date.getHours() < 10) {
            opentime = '0'+date.getHours()+':10';
        } else {
            opentime = date.getHours()+':10';
        }
    }
    
    if(closed == true) {
        $('#predsopentime').text(opentime);
        $('#predsclosed').css('width', pwtxt);
        $('#predsclosed').css('height', '100%');
        $('#predsclosed').css('border', 'none');
        $('#predsclosed').css('position', 'fixed');
        $('#predsclosed').css('top', '0');
        $('#predsclosed').css('left', '110px');
        $('#predsclosed').css('display', 'block');
    } else {
        $('#predsclosed').css('display', 'none');
    }
    
    // 00:10
    if(hour == 0 && mins == 10 && secs < 3) {
        this.loadpredictioninfo();
    }
    
    // 12:10
    if(hour == 12 && mins == 10 && secs < 3) {
        this.loadpredictioninfo();
    }
}

function getdate(date, offset) {
    var d = new Date(date+"T00:00:00Z");
    var timestamp = d.getTime();
    var stampday = 1000 * 60 * 60 * 24;
    var mon = ["01","02","03","04","05","06","07","08","09","10","11","12"];
    
    var stamp = timestamp + (stampday * offset);
    
    var _d = new Date(stamp),
        yr = _d.getUTCFullYear(),
        mn = mon[_d.getUTCMonth()],
        dt = _d.getUTCDate();
    
    if(dt < 10){dt = '0' + dt;}
    
    return yr+"-"+mn+"-"+dt;
}
    
function datetime(type, datestring) {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var date = new Date(datestring);

    var hr, mn, sc, day, mon, yr;

    if(type == "UTC") {
        hr = date.getUTCHours();
        mn = date.getUTCMinutes();
        sc = date.getUTCSeconds();
        day = date.getUTCDate();
        mon = months[date.getUTCMonth()];
        yr = date.getUTCFullYear();
    } else if(type == "LOCAL") {
        hr = date.getHours();
        mn = date.getMinutes();
        sc = date.getSeconds();
        day = date.getDate();
        mon = months[date.getMonth()];
        yr = date.getFullYear();
    }

    if(hr < 10){hr = "0" + hr;}
    if(mn < 10){mn = "0" + mn;}
    if(sc < 10){sc = "0" + sc;}
    if(day < 10){day = "0" + day;}

    var dt = day + " " + mon + " " + yr + " " + hr + ":" + mn + " " + type;

    return dt;
}

async function checknetwork() {
    var node = window.tronWeb.fullNode.host;
    var addr = window.tronWeb.defaultAddress.base58;
    
    if(node != sessionStorage.getItem('aznl_network')) {
        if(node.includes("trongrid")) {
            $('.popupback').css('display', 'none');
            $('#noprovider').css('display', 'none');
            
            await sessionStorage.setItem('aznl_network',window.tronWeb.fullNode.host);
            window.location = './predictiondesk.html?' + _p;
        } else {
            $('.popupback').css('display', 'block');
            $('#noprovider').css('display', 'block');
        }
    } else {
        $('.popupback').css('display', 'none');
        $('#noprovider').css('display', 'none');
    }
    
    if(addr != sessionStorage.getItem('aznl_account')) {
        await sessionStorage.setItem('aznl_account',window.tronWeb.defaultAddress.base58);
        window.location = './predictiondesk.html?' + _p;
    }
}

setInterval(function(){
    if(ready == true) {
        if(_p == 'weekcoin' || _p == 'daycoin') {
            this.loadassetstats();
        }
    }
}, 60000);

setInterval(function(){
    if(ready == true) {
        if(_p == 'weekcoin' || _p == 'daycoin') {
            this.loadcurrentprice();
        }
    }
}, 5000);

setInterval(function(){
    if(ready == true) {
        this.checknetwork();
    
        if(_p == 'weekcoin' || _p == 'daycoin') {
            this.countdown();
        }

        if(_p == 'weekcoin') {
            this.weekcountdowntoopen();
        }

        if(_p == 'daycoin') {
            this.daycountdowntoopen();
        }
    }
}, 1000);
