// @ts-check

import fs from "node:fs/promises";

const pkgJson = await fs.readFile("package.json", "utf-8");
const pkg = JSON.parse(pkgJson);

delete pkg.devDependencies;

const newPkgJson = JSON.stringify(pkg, null, 2);
await fs.writeFile("package.json", newPkgJson, "utf-8");
