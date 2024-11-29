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
            if (onlyCodes) {
                let rowCode: Array<string> = [];
                rowCode.push(String(currentRow[0]));
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

export async function insertDETs(codes: Array<Array<string>>, detNumbers: number, fileName: string): Promise<Array<Array<string>>> {
    return new Promise((resolve, reject) => {
        let projectNumber = String(fileName.split('.')[0]);
        let index: number = codes.findIndex(code => {
            return code[0] == projectNumber;
        })

        if(index == -1) {
            reject('Código com detalhamento não encontrado!')
        }

        const newDetCodes: Array<Array<string>> = [];

        for(let i: number = 0; i < detNumbers; i++) {
            newDetCodes.push([
                `${projectNumber}-DET${i + 1}`,
                codes[index][1],
                codes[index][2],
                codes[index][3],
                codes[index][4]
            ])
        }

        let newCodes: Array<Array<string>> = codes;
        newCodes.splice(index, 1, ...newDetCodes);

        resolve(newCodes);
    });
}
