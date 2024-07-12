export async function findCodePath(path: string, codes: Array<string>): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
        if(codes.length <= 0) {
            reject('Não é possível buscar diretórios sem códigos');
        }

        let codeFolders: Array<string> = [];
        let startCode: string;
        const arrayDirPath: Array<string> = path.split("\\");
        let dirPath: string = arrayDirPath.pop();
        dirPath = arrayDirPath.join("\\");
        dirPath = dirPath + "\\";

        codes.forEach((code: string): void => {
            startCode = code;

            if (code.includes("-")) {
                startCode = code.split("-")[0];
            }

            let subPathName: string = startCode.slice(0, -3);

            if (subPathName.length == 1) {
                subPathName = "0" + subPathName;
            }

            const foundFilePath: string = `${dirPath}${subPathName}000\\${code}.pdf`;
            codeFolders.push(foundFilePath);
        });

        resolve(codeFolders);
    })
}
