import fs from 'fs';
export class Loader {
    static PATH_TO_REFLEX_LIBRARY = __dirname + "\\..\\lib\\";
    getContents(filename: string): string {
        let str = filename; //disambiguateString(filename);
        // console.log("GET CONTENTS", { given: str })
        if (!str.endsWith(".reflex")) {
            str += ".reflex";
        }
        let paths = [
            Loader.PATH_TO_REFLEX_LIBRARY + str,
            process.cwd() + "\\" + str,
        ];
        let path = paths.find(p => fs.existsSync(p));
        if (path) {
            let contents: string = fs.readFileSync(path).toString();
            return contents;
        }
        else {
            throw new Error("Could find find path " + str);
        }
    }
}
