module.exports = {
    agrovoc: function(res) {
        var i, answer, json;
        json = JSON.parse(res.toString().substring(9).slice(0, -1));
        answer = [];
        for (i = 0; i < json.results.length; i++) {
            answer.push({
                'uri': 'http://foris.fao.org/agrovoc/term/' + json.results[i].code + '/',
                'label': json.results[i].label,
                'source': 'agrovoc'
            });
        }
        return answer;
    },
    fast: function(res) {
        var i, answer, json, term;
        answer = [];
        json = JSON.parse(res);
        for (i = 0; i < json.response.docs.length; i++) {
            if (typeof json.response.docs[i].idroot !== "undefined") {
                answer.push({
                    'uri': json.response.docs[i].idroot,
                    'label': json.response.docs[i].suggestall,
                    'source': 'fast'
                });
            }
        }
        return answer;
    },
    lc: function(res) {
        var i, answer, json;
        answer = [];
        json = JSON.parse(res);
        for (i = 0; i < json[1].length; i++) {
            answer.push({
                'uri': json[3][i],
                'label': json[1][i],
                'source': 'lc'
            });
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
            answer.push({
                'uri': 'http://viaf.org/viaf/' + json.result[i].viafid,
                'label': json.result[i].term,
                'source': 'viaf'
            });
        }
        return answer;
    }
};
