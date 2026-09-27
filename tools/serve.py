#!/usr/bin/env python3
"""Static dev server for the Academy.

Plain `python3 -m http.server` lets the browser cache ES modules, so edits
appear not to take effect. This sends no-store on everything, which is what
you want while developing. Production hosting should do the opposite.

    python3 tools/serve.py [port]

The port comes from the argument, else $PORT, else 4173. $PORT is what lets a
second session run its own copy while the first still holds the default — the
site is plain static files, so nothing depends on the number.
"""
import os
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class NoCacheHandler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map,
                      ".js": "text/javascript", ".mjs": "text/javascript"}

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_error(self, code, message=None, explain=None):
        """Serve the site's own 404.html, the way a static host does.

        Without this the dev server answers a missing page with Python's grey
        "Error response" page, so the one screen a developer most wants to see
        rendered — the one a mistyped link actually lands on — was the one
        screen that could not be checked locally. GitHub Pages serves
        /404.html; now so does this.
        """
        page = ROOT / "404.html"
        if code == 404 and page.exists():
            body = page.read_bytes()
            self.send_response(404, message)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)
            return
        super().send_error(code, message, explain)

    def log_message(self, fmt, *args):        # keep the console readable
        if "404" in (fmt % args):
            super().log_message(fmt, *args)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get("PORT") or 4173)
    handler = partial(NoCacheHandler, directory=str(ROOT))
    print(f"Academy running at http://localhost:{port}  (serving {ROOT})")
    ThreadingHTTPServer(("", port), handler).serve_forever()
