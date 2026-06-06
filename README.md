# Terra
<p align="center">
  <img width="498" height="128" alt="logo256-big" src="https://github.com/user-attachments/assets/7d720c2e-3e84-4dd6-a235-5b6eff0a62c5" />
</p>

The 2D terrain generator based on Perlin noise that runs directly in the browser. It features the ability to customize world configurations and includes dynamic zoom capabilities. The application is fully responsive and optimized for mobile devices.

<div align="left">
  <img alt="Static Badge: Version is v1.0.1" src="https://img.shields.io/badge/version-v1.0.1-white?style=for-the-badge">
  <img alt="Static Badge: License is MIT" src="https://img.shields.io/badge/License-MIT-brightgreen?style=for-the-badge">
  <img alt="Static Badge: Stack are React, Typescript, Go" src="https://img.shields.io/badge/stack-typescript_%7C_react_%7C_go-%235ec9e0?style=for-the-badge">
  <a href="https://terra-gray.vercel.app/">
    <img alt="Static Badge: Live Demo, clickable link" src="https://img.shields.io/badge/Live_Demo-Watch-red?style=for-the-badge">
  </a>
</div>

## Table of contents
- [Dependencies](#dependencies)
- [Browser Support](#browser-support)
- [Installation](#installation)
- [How to use](#how-to-use)
- [How to run locally](#how-to-run-locally)

## Dependencies
* **[React](https://react.dev/)** (`^19.2.6`)
* **[TypeScript](https://www.typescriptlang.org/)** (`~6.0.2`)
* **[Vite](https://vitejs.dev/)** (`^8.0.12`)
* **[Tailwind CSS](https://tailwindcss.com/)** (`^4.3.0`)
* **[@radix-ui/themes](https://www.radix-ui.com/)** (`^3.3.0`)
* **[Lucide React](https://lucide.dev/)** (`^1.16.0`)
* **[Lodash](https://lodash.com/)** (`^4.18.1`)
* **[Mitt](https://github.com/developit/mitt)** (`^3.0.1`)

## Browser Support
This application relies on a custom engine compiled to **WebAssembly (Wasm)**. Because of this, it requires a modern browser with WebAssembly support enabled.
| Browser | Supported | Minimum Version |
| :--- | :---: | :--- |
| **Google Chrome** | ✅ | v57+ |
| **Mozilla Firefox** | ✅ | v52+ |
| **Apple Safari** | ✅ | v11+ |
| **Microsoft Edge** | ✅ | v16+ |
| **Internet Explorer** | ❌ | Not Supported |
*(Note: Ensure that you are not running the browser in a highly restrictive environment that explicitly disables WebAssembly).*

## Installation
Download the repository archive and decompress it
Or use bash command to clone repository:
```bash
git clone https://github.com/VladikNV250/terra.git
```

Open the terminal and go to the project folder and run these commands. It will compile Perlin noise engine and install necessary dependencies:
```bash
npm install
npm run build:engine
```
## How to use
You can open [Live Demo](https://terra-gray.vercel.app/) and see how it works:
- **Try** dragging with a mouse to generate new terrain chunks
- **Try** changing engine settings to customize topography, temperature and moisture zones generating different worlds.
- **Try** scrolling to change scale of terrain
## How to run locally
First, [install](#installation) the project on your computer
After, you can run it locally using this bash command:
```bash
npm run dev
```
If you need to test the project in production, you can build the project and run production version using bash command:
```bash
npm run build:engine
npm run build
npm run preview
```
