import { degrees, PDFDocument } from "pdf-lib";
import fs = require("fs/promises");
export async function pdfJoin(arrayCodePath: Array<string>, temporaryFile: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try{
            const newPDF = await PDFDocument.create();

            for (const filePath of arrayCodePath) {
                const PDFFile = await fs.readFile(filePath);
                const pdf = await PDFDocument.load(PDFFile);
                const pages = await newPDF.copyPages(pdf, pdf.getPageIndices());
                pages.forEach((page) => newPDF.addPage(page));
            }

            const newPDFBytes = await newPDF.save();
            await fs.writeFile(temporaryFile, newPDFBytes);
            await organizePDF(temporaryFile, temporaryFile);
            resolve();
        } catch (error) {
            reject([`Erro! Arquivo não encontrado: ${error.path}`, error.path])
        }
    })
}

async function organizePDF(inputPath: string, outputPath: string) {
    try {
        const inputBytes = await fs.readFile(inputPath);
        const pdfDoc = await PDFDocument.load(inputBytes);
        const numPages = pdfDoc.getPageCount();

        for (let i = 0; i < numPages; i++) {
            const page = pdfDoc.getPage(i);
            const isRetrato = page.getSize().width > page.getSize().height;

            if (isRetrato) {
                page.setRotation(degrees(90));
            }
        }

        const modifiedBytes = await pdfDoc.save();
        await fs.writeFile(outputPath, modifiedBytes);
    } catch (error) {
        console.log(`Erro ao organizar o PDF: ${error}`);
    }
}
