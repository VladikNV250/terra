GOOS=js GOARCH=wasm go build -o ../public/main.wasm ./main.go

cp "$(go env GOROOT)/lib/wasm/wasm_exec.js" ../src/worker/

echo "Build finished!"