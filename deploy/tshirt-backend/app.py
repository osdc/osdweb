#!/usr/bin/env python3
import argparse
import json
import sqlite3
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

DB_PATH = Path(__file__).with_name("registrations.sqlite3")
DESIGNS = {"open-source-tees-design-1", "cosmic-expansion-design-2"}
SIZES = {"XS", "S", "M", "L", "XL", "XXL"}

def initialize_database():
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute("""CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL,
            name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL,
            address TEXT NOT NULL, design TEXT NOT NULL, size TEXT NOT NULL,
            source_ip TEXT NOT NULL
        )""")

class Handler(BaseHTTPRequestHandler):
    server_version = "OSDCTshirtAPI/1.0"

    def headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS, GET")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()

    def reply(self, status, payload):
        self.headers(status)
        self.wfile.write(json.dumps(payload).encode())

    def do_OPTIONS(self):
        self.headers(204)

    def do_GET(self):
        if self.path.rstrip("/") in {"", "/health"}:
            self.reply(200, {"status": "ok", "service": "osdc-tshirt-registration"})
        else:
            self.reply(404, {"error": "Not found"})

    def do_POST(self):
        if self.path.rstrip("/") not in {"/api/tshirt", "/tshirt"}:
            return self.reply(404, {"error": "Not found"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length < 2 or length > 8192:
                return self.reply(400, {"error": "Invalid request size"})
            data = json.loads(self.rfile.read(length))
            if data.get("website"):
                return self.reply(200, {"message": "Received"})
            values = {key: str(data.get(key, "")).strip() for key in ("name", "phone", "email", "address", "design", "size")}
            valid = (2 <= len(values["name"]) <= 100 and 8 <= len(values["phone"]) <= 20
                     and 3 <= len(values["email"]) <= 200 and "@" in values["email"]
                     and 8 <= len(values["address"]) <= 300
                     and values["design"] in DESIGNS and values["size"] in SIZES)
            if not valid:
                return self.reply(400, {"error": "Check the registration details."})
            source_ip = self.headers.get("X-Forwarded-For", self.client_address[0]).split(",")[0].strip()
            with sqlite3.connect(DB_PATH) as connection:
                connection.execute("INSERT INTO registrations (created_at,name,phone,email,address,design,size,source_ip) VALUES (?,?,?,?,?,?,?,?)",
                    (datetime.now(timezone.utc).isoformat(), values["name"], values["phone"], values["email"], values["address"], values["design"], values["size"], source_ip))
            self.reply(201, {"message": "Received"})
        except (ValueError, json.JSONDecodeError):
            self.reply(400, {"error": "Invalid JSON"})
        except Exception:
            self.reply(500, {"error": "Registration could not be saved."})

    def log_message(self, message, *args):
        print(f"{self.address_string()} - {message % args}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=6990, type=int)
    args = parser.parse_args()
    initialize_database()
    ThreadingHTTPServer((args.host, args.port), Handler).serve_forever()
