BIBFRAME Editor
===============

You can run this locally without a webserver.  Just clone it and visit
`editor.html`.  If you want to use it with a webserver, the only blocker
is the profile service loader, which expects more of a query argument than
a path; symlink `vra/vra.json` to vra.json in the `profiles/` directory
and change `config.json` to point to the new symlink (and make sure your
server will follow symlinks).

See http://bibframe.org/ for more.

[Zepheira](http://zepheira.com/)
