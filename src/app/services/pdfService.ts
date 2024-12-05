import {degrees, PDFDocument, StandardFonts, rgb} from "pdf-lib";
import fs = require("fs/promises");

export async function pdfJoin(arrayCodePath: Array<string>, temporaryFile: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            const newPDF = await PDFDocument.create();

            for (const filePath of arrayCodePath) {
                const PDFFile = await fs.readFile(filePath);
                const pdf = await PDFDocument.load(PDFFile);
                const pages = await newPDF.copyPages(pdf, pdf.getPageIndices());
                pages.forEach((page) => newPDF.addPage(page));
            }

            const newPDFBytes = await newPDF.save();
            await fs.writeFile(temporaryFile, newPDFBytes);
            await organizePDF(temporaryFile);
            resolve();
        } catch (error) {
            reject([`Erro! Arquivo não encontrado: ${error.path}`, error.path])
        }
    })
}

async function organizePDF(inputPath: string) {
    const outputPath = inputPath;
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

            if (page.getWidth() > 600) {
                page.scale(0.706,0.706);
            }
        }

        const modifiedBytes = await pdfDoc.save();
        await fs.writeFile(outputPath, modifiedBytes);
    } catch (error) {
        console.log(`Erro ao organizar o PDF: ${error}`);
    }
}

export async function addWaterMarker(order: string, codes: Array<Array<String>>, inputPath: string) {
    const outputPath: string = inputPath;

    const existingPdfBytes = await fs.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const HelveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for(let i: number = 0; i < codes.length; i++) {
        if(codes[i][2] == "undefined" || codes[i][3] == "undefined" || codes[i][4] == "undefined") {
            continue;
        }

        const watermarkText: string = `Pedido: ${order} \r\nQuantidade: ${codes[i][3]}${codes[i][2]} \r\nRoteiro: ${codes[i][4]}`;
        let fontSize = 13;
        let lineHeight = 6.8;
        let positionX = 27;

        console.log(pages[i].getSize())

        if(pages[i].getSize().width > 600) {
            fontSize = 12;
            lineHeight = 6.8;
            positionX = 15;
        }

        pages[i].drawText(watermarkText, {
            font: HelveticaFont,
            x: positionX,
            y: 45,
            size: fontSize,
            color: rgb(0, 0, 0),
            lineHeight: lineHeight,
            rotate: degrees(90)
        });
    };

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
}
