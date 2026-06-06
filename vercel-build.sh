#!/bin/bash
echo "Installing Go..."
# Download and extract Go for Linux AMD64 (Vercel's environment)
curl -sL https://go.dev/dl/go1.22.4.linux-amd64.tar.gz | tar -xz

# Set up Go environment variables
export PATH=$PWD/go/bin:$PATH
export GOROOT=$PWD/go

# Verify installation
go version

# Run the build scripts
echo "Building engine..."
npm run build:engine

echo "Building project..."
npm run build
