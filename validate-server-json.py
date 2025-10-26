#!/usr/bin/env python3
"""Validate server.json against MCP Registry schema"""

import json
import sys
import urllib.request

SCHEMA_URL = "https://static.modelcontextprotocol.io/schemas/2025-10-17/server.schema.json"
SERVER_JSON = "server.json"

def validate():
    try:
        # Try to import jsonschema
        try:
            from jsonschema import validate, ValidationError
        except ImportError:
            print("Installing jsonschema...")
            import subprocess
            subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "jsonschema"])
            from jsonschema import validate, ValidationError

        # Fetch schema
        print(f"Fetching schema from {SCHEMA_URL}...")
        with urllib.request.urlopen(SCHEMA_URL) as response:
            schema = json.loads(response.read())

        # Load server.json
        print(f"Loading {SERVER_JSON}...")
        with open(SERVER_JSON, 'r') as f:
            server_config = json.load(f)

        # Validate
        print("Validating...")
        validate(instance=server_config, schema=schema)

        print("\n✓ Validation successful!")
        print(f"  Name: {server_config.get('name')}")
        print(f"  Version: {server_config.get('version')}")
        print(f"  Packages: {len(server_config.get('packages', []))}")

        return 0

    except ValidationError as e:
        print(f"\n✗ Validation failed:")
        print(f"  {e.message}")
        if e.path:
            print(f"  Path: {'.'.join(str(p) for p in e.path)}")
        return 1
    except Exception as e:
        print(f"\n✗ Error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(validate())
