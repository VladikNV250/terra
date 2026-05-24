import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.chdir(__dirname);

console.log("Building Terra engine (WebAssembly)...");

try {
    execSync("go build -o ../public/main.wasm ./main.go", {
        env: { ...process.env, GOOS: "js", GOARCH: "wasm" },
        stdio: "inherit",
    });

    const goroot = execSync("go env GOROOT", { encoding: "utf8" }).trim();
    
    let wasmExecPath = path.join(goroot, "lib", "wasm", "wasm_exec.js");
    if (!fs.existsSync(wasmExecPath)) {
        wasmExecPath = path.join(goroot, "misc", "wasm", "wasm_exec.js");
    }

    fs.copyFileSync(wasmExecPath, path.join("..", "src", "worker", "wasm_exec.js"));
    
    console.log("Build finished successfully!");
} catch (error) {
    console.error("Build failed:", error.message);
    process.exit(1);
}
