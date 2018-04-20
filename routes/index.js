var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    let q = '"Футбол 1"';
    let aceenginehost = get_local_ip();
    let aceengineport = '6878';
    if ('q' in req.query) {
        q = req.query.q;
    }
    (async () => {
        try {
            let results = await acesearch(q);
            /*
            console.log('results');
            for (let i = 0; i < results['total']; i++) {
                let result = results['results'][i];
                for (let j = 0; j < result['items'].length; j++) {
                    let item = result['items'][j];
                    console.log(item);
                    let cid_response = await http_get('http://127.0.0.1:6878/server/api?method=get_content_id&infohash='+item['infohash']);
                    console.log(cid_response);
                    let cid_json = JSON.parse(cid_response);
                    if (!cid_json['error'])
                        results['results'][i]['items'][j]['cid'] = cid_json['result']['content_id'];
                }
            }
            */
            res.render('index', {
                title: 'AceStreamSearch',
                q: q,
                results: results,
                aceengineaddr: aceenginehost+':'+aceengineport
            });
            console.log(results);
        } catch (e) {
            console.log('ERROR CATCHED: '+e);
        }
    })();
});

function acesearch(q, category = null) {
    let qs = 'method=search&api_version=1.0&api_key=test_api_key';
    qs += '&group_by_channels=1&show_epg=1';
    if (category !== null)
        qs += '&category='+encodeURI(category);
    qs += '&query='+encodeURI(q);
    let url = 'https://search.acestream.net?'+qs;
    return new Promise((resolve, reject) => {
        http_get(url, 'https')
            .then(responseText => resolve(JSON.parse(responseText)))
            .catch(errorText => reject(errorText));
    });
}

function http_get(url, proto = 'http') {
    return new Promise((resolve, reject) => {
        const http = require(proto);
        console.log('getting '+url);
        http.get(url, (res) => {
            if (res.statusCode === 200) {
                // fetch response data
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => resolve(data));
            } else
                reject(`HTTP error: ${res.statusCode} ${res.statusMessage}`);
        }).on('error', (e) => {
            reject(`Request error: ${e.message}`);
        });
    });
    // return p;
}

function get_local_ip() {
    const os = require('os');
    var ifaces = os.networkInterfaces();
    
    for (let iface in ifaces) {
        if (iface.search(/Loopback/i) !== -1)
            continue;
        console.log(iface);
        for (let i = 0; i < ifaces[iface].length; i++) {
            let addr = ifaces[iface][i];
            if (addr.internal || (addr.family !== 'IPv4'))
                continue;
            console.log('ADDR: ', addr);
            return addr.address;
        }
    }
    
    return '127.0.0.1';
}

module.exports = router;
