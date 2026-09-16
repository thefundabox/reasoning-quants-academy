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

    def log_message(self, fmt, *args):        # keep the console readable
        if "404" in (fmt % args):
            super().log_message(fmt, *args)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get("PORT") or 4173)
    handler = partial(NoCacheHandler, directory=str(ROOT))
    print(f"Academy running at http://localhost:{port}  (serving {ROOT})")
    ThreadingHTTPServer(("", port), handler).serve_forever()
