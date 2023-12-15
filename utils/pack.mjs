import fs from "fs";
import path from "path";
import { compilePack, extractPack } from "@foundryvtt/foundryvtt-cli";

const PACK_SRC = "./packs"

const folders = fs.readdirSync(PACK_SRC, { withFileTypes: true }).filter(file =>
    file.isDirectory()
);

for ( const folder of folders ) {
    const src = path.join(PACK_SRC, folder.name, "_source");
    const dest = path.join(PACK_SRC, folder.name);
    console.log(`Compiling pack ${folder.name}`);
    await compilePack(src, dest, { recursive: true, log: true, yaml: true });
}