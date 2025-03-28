#!/usr/bin/env python
import webbrowser
import sys
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler

def serve_web_app():
    server_address = ('', 8000)
    handler = SimpleHTTPRequestHandler
    print("Starting server at http://localhost:8000")
    httpd = HTTPServer(server_address, handler)
    
    # Try to open the browser
    try:
        webbrowser.open('http://localhost:8000')
    except:
        print("Could not automatically open browser. Please navigate to http://localhost:8000 manually.")
    
    try:
        print("Server running. Press Ctrl+C to stop.")
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server")
        httpd.server_close()

if __name__ == "__main__":
    serve_web_app() 
