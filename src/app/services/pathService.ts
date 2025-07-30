import { joinLevelProjects } from '../services/pdfService'
import * as fs from 'fs';

export async function findCodePath(codes: Array<Array<string>>, projectPath: string, sufixMapper: Array<Array<string>>, temporaryFile: string): Promise<Array<string>> {
    if (codes.length <= 0) {
        return new Promise((resolve, reject) => {
            reject('Não é possível buscar diretórios sem códigos');
        });
    }

    const codeFolders: Array<string> = [];
    let startCode: string;

    codes.forEach((code: Array<string>): void => {
        startCode = code[0];

        if (code[0].includes('-')) {
            startCode = code[0].split('-')[0];
        }

        let subPathName: string = startCode.slice(0, -3);

        if (subPathName.length == 1) {
            subPathName = '0' + subPathName;
        }

        const foundFilePath: string = `${projectPath}${subPathName}000\\${code[0]}.pdf`;
        codeFolders.push(foundFilePath);
    });

    await renameProjectsWithTempFiles(sufixMapper, codes, codeFolders, temporaryFile)

    return new Promise((resolve, reject) => {
        resolve(codeFolders);
    });
}

export async function renameProjectsWithTempFiles(sufixMapper: Array<Array<string>>, codes: Array<Array<string>>, codeFolders: Array<string>, temporaryFile: string) {
    const tempPathArray = temporaryFile.split("\\");
    tempPathArray.pop();
    const tempPath = tempPathArray.join("\\") + "\\";

    for (let i=sufixMapper.length - 1; i>=0; i--) {
        const arrSufix = sufixMapper[i][0].split("\\").pop().split("_")
        const projectCode = arrSufix[0];

        const tempArr = [...codeFolders]
        for (let j=tempArr.length - 1; j>=0; j--) {
            if (tempArr[j].includes("000\\" + projectCode)) {
                codeFolders[j] = tempPath + arrSufix.join("_");
                break;
            }

            if (tempArr[j].includes("temp\\" + projectCode + "_")) {
                codeFolders.splice(j + 1, 0, (tempPath + arrSufix.join("_")));

                for (let x=0; x<codes.length; x++) {
                    if (codes[x][0] == projectCode) {
                        codes.splice(x + 1, 0, codes[x]);
                        break;
                    }
                }

                break;
            }
        }
    }
}

export async function checkSuffix(codes: Array<Array<string>>, projectPath: string, temporaryFile: string): Promise<Array<Array<string>>> {
    const suffixMapper: Array<Array<string>> = [];
    let startCode: string;

    for (let i=0; i<codes.length; i++) {
        startCode = codes[i][0];
        if (codes[i][0].includes('-')) {
            startCode = codes[i][0].split('-')[0];
        }

        let subPathName: string = startCode.slice(0, -3);
        if (subPathName.length == 1) {
            subPathName = '0' + subPathName;
        }

        let currentPath: string = `${projectPath}${subPathName}000\\`;
        const files = fs.readdirSync(currentPath);
        const matchFiles = files.filter(arquivo => arquivo.includes(codes[i][0] + "_"));

        for (let j=0; j<matchFiles.length; j++) {
            let currentSufix = matchFiles[j].split("_")[1].split(".")[0];
            let isfist = false;

            if(currentSufix.charAt(currentSufix.length - 1) == "1") {
                currentSufix = currentSufix.slice(0, -1);
                isfist = true;
            }

            let find = false;
            for (let x=0; x<suffixMapper.length; x++) {
                if (suffixMapper[x][0].split("_")[1].split(".")[0].includes(currentSufix)) {
                    if (isfist) {
                        suffixMapper[x].unshift(`${projectPath}${subPathName}000\\${matchFiles[j]}`);
                    } else {
                        suffixMapper[x].push(`${projectPath}${subPathName}000\\${matchFiles[j]}`);
                    }

                    find = true;
                    break;
                }
            }

            if (!find) {
                suffixMapper.push([`${projectPath}${subPathName}000\\${matchFiles[j]}`])
            }
        }
    };

    removeUnusedCodes(codes, suffixMapper)
    removeSingleAdd(suffixMapper);
    await joinLevelProjects(suffixMapper, temporaryFile)

    return new Promise((resolve, reject) => resolve(suffixMapper));
}

function removeUnusedCodes(codes: Array<Array<string>>, suffixMapper: Array<Array<string>>): void {
    for (let i=0; i<suffixMapper.length; i++) {
        for (let j=0; j<suffixMapper[i].length; j++) {
            let sufix = suffixMapper[i][j].split("_")[1].split(".")[0];
            if (sufix.charAt(sufix.length - 1) != "1") {
                for (let x=0; x<codes.length; x++) {
                    let matchstring = "000\\" + codes[x][0]
                    if (suffixMapper[i][j].includes(matchstring)) {
                        codes.splice(x, 1);
                        break;
                    }
                }
            }
        }
    }
}

function removeSingleAdd(arr: Array<Array<string>>): void {
    const arrTemp = [...arr]
    for (let i=arrTemp.length - 1; i>=0; i--) {
        let find = false;

        for (let j=0; j<arrTemp[i].length; j++) {
            let sufix: string = arrTemp[i][j].split("_")[1].split(".")[0];
            if (sufix.charAt(sufix.length - 1) == "1") {
                find = true;
                break;
            }
        }

        if(!find) {
            arr.splice(i, 1);
        }
    }
}
