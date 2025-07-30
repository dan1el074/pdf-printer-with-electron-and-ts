interface Data {
    path: string;
    fileName: string;
    printers: Array<Printable>;
    codes: Array<Array<string>>;
    order: string;
    repeatMapper: Array<Array<number>>;
    temporaryFile: string;
    sufixMapper: Array<Array<string>>
}
