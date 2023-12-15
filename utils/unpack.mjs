import fs from "fs";
import path from "path";
import { compilePack, extractPack } from "@foundryvtt/foundryvtt-cli";

const PACK_SRC = "./packs"

const folders = fs.readdirSync(PACK_SRC, { withFileTypes: true }).filter(file =>
    file.isDirectory()
);

for ( const folder of folders ) {
    const src = path.join(PACK_SRC, folder.name);
    const dest = path.join(PACK_SRC, folder.name, "_source");
    fs.readdirSync(dest).map(file => {
        fs.unlink(path.join(dest, file), (err) => {
            if (err) throw err;
        });
    });
    console.log(`Extracting pack ${folder.name}`);
    await extractPack(src, dest, { recursive: true, log: true, yaml: true });
}