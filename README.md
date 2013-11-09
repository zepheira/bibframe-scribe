BIBFRAME Editor
===============

There are two pieces to this software.  The UI can be run locally without
a webserver out of the box.  Just visit the file `app/static/index.html`
in a browser.

The backend is based on Node.js and MongoDB.  In order to avoid a confused
Node.js installation, consider using a virtual environment as provided by
[nodeenv](https://github.com/ekalinin/nodeenv), which provides `npm` and `node`
per environment and can be easily installed using `pip`.  You'll also need
to install MongoDB, which can be done with `brew` on a Mac.  There will
be a Chef cookbook coming soon to cover Linux server installs.

Until then.  With `nodeenv` and `mongod` binaries available:

```
% nodeenv -c [env]
% cd [env]
% . bin/activate
% git clone [this repo]
% cd bibframe-editor
% npm install
% mongod -rest &
% node app
```

More
====

See http://bibframe.org/ for more.

[Zepheira](http://zepheira.com/)
