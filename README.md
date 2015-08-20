BIBFRAME Scribe
===============

There are two pieces to this software.  The UI can be run locally without
a webserver out of the box.  Just visit the file `app/static/index.html`
in a browser.

The backend is based on Node.js.  In order to avoid a confused
Node.js installation, consider using a virtual environment as provided by
[nodeenv](https://github.com/ekalinin/nodeenv), which provides `npm` and `node`
per environment and can be easily installed using `pip`.  This branch uses
LevelDB, which needs a directory to store its data.  The default supplied is
`./bfstore`, relative to the `app/` directory; you can change this by supplying
a `backend.json` in the `app/` directory.

With the `nodeenv` binary available:

```
% git clone [this repo]
% nodeenv -c -r bibframe-scribe/requirements.txt [env]
% mv bibframe-scribe [env]/
% cd [env]
% . bin/activate
% cd bibframe-scribe
% cd app
% node index.js
```

There is still a bug in the restify library.  The static.js plugin fails to
evaluate a normalized path correctly and so will always return a 403
regardless of which directory it is configured to use.  The patch is minor.
You can use the `static.js` provided as a sibling file for deployment.

Issue described here: https://github.com/mcavage/node-restify/issues/549

Saving
======

Data leaves the user-interface of Scribe by being normalized to Turtle/N3 and placed as a string paylod in some simple JSON: `{n3: [data]}`.

Scribe expects to `PUT` the data to the endpoint `http://server/mount/resource/new`
(where, for Scribe, `mount` is where the Node application is mounted and is
optional if mounted at the root).

Editing
=======

You can bring data into Scribe by appending `?edit=<resource>` to the UI
location, likely `http://server/mount/static/`.  As Scribe does not currently
save data like labels originating from remote sources, the appearance during
editing may differ from initial creation due to the use of URIs instead of more
user-friendly labels.

You can also use the search utility to do a typeahead find for locally stored
resources labelled by a title or a label property.

Load Data
=========

You could probably install levelgraph-n3-import through npm in order to obtain
a command line tool that you can then use to import Turtle/N3 into your
configured LevelDB location, but that hasn't yet been tested.

License
=======

This project is licensed under the Apache 2.0 license.  See the file LICENSE in this directory.

Testing
=======

We're working on adding unit tests currently.  To run them, use Karma inside your existing NodeJS installation.

```
% npm install -g karma
% karma start
```

More
====

Scribe developement has been supported in part by the Library of Congress, BIBFLOW (an IMLS project of the UC Davis library) and Zepheira

* [Bibframe](http://bibframe.org/)
* [Zepheira](http://zepheira.com/)
* [Library of Congress](http://loc.gov/)
* [BIBFLOW](http://www.lib.ucdavis.edu/bibflow/)
