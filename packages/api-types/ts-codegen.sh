#!/bin/bash

# Function to check if server is running
check_server() {
    local url=$1
    local name=$2
    
    if curl -s -f --max-time 5 "$url" > /dev/null 2>&1; then
        return 0
    else
        echo "⚠️  SKIPPED: $name server is not running at $url"
        return 1
    fi
}

# Chuni Web
echo "Checking Chuni Web server..."
if check_server "http://localhost:5173/api/docs/openapi.json" "Chuni Web"; then
    echo "Generating types for Chuni Web..."
    pnpm openapi-typescript http://localhost:5173/api/docs/openapi.json -o src/chuni-web.d.ts
fi

# maimai Web
echo "Checking maimai Web server..."
if check_server "http://localhost:5174/api/docs/openapi.json" "maimai Web"; then
    echo "Generating types for maimai Web..."
    pnpm openapi-typescript http://localhost:5174/api/docs/openapi.json -o src/maimai-web.d.ts
fi

echo "✓ Code generation completed"
