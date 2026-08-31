"""A minimal "Hello, World!" web app using only the Python standard library."""

import os
from http.server import BaseHTTPRequestHandler, HTTPServer

MESSAGE = "Hello, World!"


class HelloWorldHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        body = MESSAGE.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8000"))
    server = HTTPServer((host, port), HelloWorldHandler)
    print(f"Serving on http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
