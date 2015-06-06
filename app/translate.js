module.exports = {
    agrovoc: function(res) {
        var i, answer, json;
        json = JSON.parse(res);
        answer = [];
        for (i = 0; i < json.results.length; i++) {
            answer.push({
                'uri': json.results[i].uri,
                'label': json.results[i].prefLabel,
                'source': 'agrovoc'
            });
        }
        return answer;
    },
    fast: function(res) {
        var i, answer, json, term, id;
        answer = [];
        json = JSON.parse(res);
        for (i = 0; i < json.response.docs.length; i++) {
            if (typeof json.response.docs[i].idroot !== "undefined") {
                id = json.response.docs[i].idroot.substring(3).replace(/^0+/,"");
                answer.push({
                    'uri': "http://experimental.worldcat.org/fast/" + id + "/",
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
