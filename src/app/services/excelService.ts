export async function findCodes(filePath: string): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
        const XLSX = require("xlsx");
        const workbook = XLSX.readFile(filePath);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const resExcel = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const regex = /\d+-?\d+-?(DET)?\d+/;

        let codes: Array<string> = [];

        resExcel.forEach((arr: Array<string>): void => {
            let onlyCodes = String(arr[0]).match(regex);
            if (onlyCodes) {
                codes.push(onlyCodes.input);
            }
        });

        if (codes.length <= 0) {
            reject('Nenhum código encontrado');
        }

        resolve(codes);
    })
}
