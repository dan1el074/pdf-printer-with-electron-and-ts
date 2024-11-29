export async function findCodePath(codes: Array<Array<string>>): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
        if(codes.length <= 0) {
            reject('Não é possível buscar diretórios sem códigos');
        }

        let codeFolders: Array<string> = [];
        let startCode: string;
        let dirPath: string = "\\\\metaro-server\\Projetos\\";

        codes.forEach((code: Array<string>): void => {
            startCode = code[0];

            if (code[0].includes("-")) {
                startCode = code[0].split("-")[0];
            }

            let subPathName: string = startCode.slice(0, -3);

            if (subPathName.length == 1) {
                subPathName = "0" + subPathName;
            }

            const foundFilePath: string = `${dirPath}${subPathName}000\\${code[0]}.pdf`;
            codeFolders.push(foundFilePath);
        });

        resolve(codeFolders);
    })
}
