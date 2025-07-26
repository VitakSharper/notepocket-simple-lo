#!/bin/bash

# Copy SQL.js WASM files to public directory for proper serving
echo "Copying SQL.js WASM files..."

# Create public directory if it doesn't exist
mkdir -p public

# Copy WASM files
cp node_modules/sql.js/dist/sql-wasm.wasm public/
cp node_modules/sql.js/dist/sql-wasm.js public/

echo "SQL.js WASM files copied successfully!"