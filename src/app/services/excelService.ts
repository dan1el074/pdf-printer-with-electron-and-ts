export async function findCodes(filePath: string): Promise<Array<Array<string>>> {
    return new Promise((resolve, reject) => {
        const XLSX = require("xlsx");
        const workbook = XLSX.readFile(filePath);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const resExcel = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const regex = /\d+-?\d+-?(DET)?\d+/;

        let codes: Array<Array<string>> = [];

        resExcel.forEach((currentRow: Array<string>): void => {
            let onlyCodes = String(currentRow[0]).match(regex);
            if (onlyCodes && onlyCodes.index <= 1) {
                let rowCode: Array<string> = [];
                rowCode.push(String(currentRow[0]).match(regex).input);
                rowCode.push(String(currentRow[1]));
                rowCode.push(String(currentRow[2]));
                rowCode.push(String(currentRow[3]));
                rowCode.push(String(currentRow[4]));

                codes.push(rowCode);
            }
        });

        if (codes.length <= 0) {
            reject('Nenhum código encontrado');
        }

        resolve(codes);
    })
}

export async function insertDETs(codes: Array<Array<string>>, codePath: Array<string>, detNumbers: number, fileName: string): Promise<void> {
    return new Promise((resolve, reject) => {
        let projectNumber = String(fileName.split('.')[0]);
        let index: number = codes.findIndex(code => {
            return code[0] == projectNumber;
        })

        if(index == -1) {
            reject('Código com detalhamento não encontrado!')
        }

        const detPaths: Array<string> = [];
        const detCodes: Array<Array<string>> = [];

        for(let i=0; i<detNumbers; i++) {
            const arr = codePath[index].split("\\");
            let currentCode = arr[arr.length - 1].split(".")[0];
            arr.pop();

            detPaths.push(`${arr.join("\\")}\\${currentCode}-DET${i + 1}.pdf`);
            detCodes.push([`${projectNumber}-DET${i + 1}`, codes[index][1], codes[index][2], codes[index][3], codes[index][4]]);
        }

        codePath.splice(index, 1, ...detPaths);
        codes.splice(index, 1, ...detCodes);

        resolve();
    });
}
