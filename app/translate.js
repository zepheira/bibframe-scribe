var maxMatchLength = 50, generateMatch;

generateMatch = function(uri, label, source) {
    var match = {
        'uri': uri,
        'source': source,
        'fullLabel': label
    };
    if (label.length > maxMatchLength) {
        match['label'] = label.substr(0, maxMatchLength) + '...';
    } else {
        match['label'] = label;
    }
    return match;
};

module.exports = {
    agrovoc: function(res) {
        var i, answer, json;
        json = JSON.parse(res);
        answer = [];
        for (i = 0; i < json.results.length; i++) {
            answer.push(generateMatch(
                json.results[i].uri,
                json.results[i].prefLabel,
                'agrovoc'
            ));
        }
        return answer;
    },
    fast: function(res) {
        var i, answer, json, term, id;
        answer = [];
        json = JSON.parse(res);
        for (i = 0; i < json.response.docs.length; i++) {
            if (typeof json.response.docs[i].idroot !== 'undefined') {
                id = json.response.docs[i].idroot.substring(3).replace(/^0+/, '');
                answer.push(generateMatch(
                    'http://experimental.worldcat.org/fast/' + id + '/',
                    json.response.docs[i].suggestall,
                    'fast'
                ));
            }
        }
        return answer;
    },
    lc: function(res) {
        var i, answer, json;
        answer = [];
        json = JSON.parse(res);
        for (i = 0; i < json[1].length; i++) {
            answer.push(generateMatch(
                json[3][i],
                json[1][i],
                'lc'
            ));
        }
        return answer;
    },
    mesh: function(res) {
        var i, answer, json;
        answer = [];
        json = JSON.parse(res);
        for (i = 0; i < json.results.bindings.length; i++) {
            answer.push({
                'uri': json.results.bindings[i].concept.value,
                'label': json.results.bindings[i].label.value,
                'source': 'mesh'
            });
        }
        return answer;
    },
    viaf: function(res) {
        var i, answer, json;
        answer = [];
        json = JSON.parse(res);
        for (i = 0; i < json.result.length; i++) {
            answer.push(generateMatch(
                'http://viaf.org/viaf/' + json.result[i].viafid,
                json.result[i].term,
                'viaf'
            ));
        }
        return answer;
    }
};
