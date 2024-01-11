import yaml from "js-yaml";
import path from "path";
import fs from "fs";

const PACK_SRC = "./packs"

const folders = fs.readdirSync(PACK_SRC, { withFileTypes: true }).filter(file =>
    file.isDirectory()
);

for ( const folder of folders ) {
    const srcFolder = path.join(PACK_SRC, folder.name, "_source");
    console.log(`Searching Actors in source files ${folder.name}`);
    fs.readdirSync(srcFolder, {}).forEach(filename => {
        const filePath = path.join(srcFolder, filename);
        const doc = yaml.load(fs.readFileSync(filePath, 'utf8'))
        if (doc.prototypeToken) {
            console.log(`Fixing names in Actor file ${filePath}`);
            doc.prototypeToken.name = doc.name;
            doc.prototypeToken.prependAdjective = true;
            doc.prototypeToken.displayName = 30;
            fs.writeFileSync(filePath, yaml.dump(doc)+"\n")
        }
    })
}

