import { degrees, PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { log } from "./logService";
import fs = require("fs/promises");

export async function pdfJoin(arrayCodePath: Array<string>, temporaryFile: string): Promise<Array<Array<number>>> {
    return new Promise(async (resolve, reject) => {
        try {
            const newPDF = await PDFDocument.create();
            const repeatMapper: Array<Array<number>> = [];

            for (let i=0; i<arrayCodePath.length; i++) {
                const PDFFile = await fs.readFile(arrayCodePath[i]);
                const pdf = await PDFDocument.load(PDFFile);
                const pdfSize = await pdf.getPageCount();

                if(pdfSize > 1) {
                    repeatMapper.push([i, pdfSize]);
                }

                const pages = await newPDF.copyPages(pdf, pdf.getPageIndices());
                pages.forEach((page) => newPDF.addPage(page));
            }

            const newPDFBytes = await newPDF.save();
            await fs.writeFile(temporaryFile, newPDFBytes);
            await organizePDF(temporaryFile);
            resolve(repeatMapper);
        } catch (error) {
            reject([`Erro! Arquivo não encontrado: ${error.path}`, error.path])
        }
    })
}

async function organizePDF(inputPath: string) {
    try {
        const inputBytes = await fs.readFile(inputPath);
        const pdfDoc = await PDFDocument.load(inputBytes);
        const numPages = pdfDoc.getPageCount();

        for (let i = 0; i < numPages; i++) {
            const page = pdfDoc.getPage(i);
            page.setRotation(degrees(0));

            if (page.getSize().width > page.getSize().height) {
                page.setRotation(degrees(90));

                if (page.getWidth() > 1190 && page.getWidth() < 1193) {
                    page.scale(0.706,0.706);
                }

                if (page.getWidth() > 1680 && page.getWidth() < 1685) {
                    page.scale(0.5,0.5);
                }
            }
        }

        const modifiedBytes = await pdfDoc.save();
        await fs.writeFile(inputPath, modifiedBytes);
    } catch (error) {
        log(`Erro ao organizar o PDF: ${error}`);
    }
}

export async function addWaterMarker(order: string, codes: Array<Array<String>>, inputPath: string, repeatMapper: Array<Array<number>>) {
    const existingPdfBytes = await fs.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const HelveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let pageIndex = 0;

    for(let i: number = 0; i < codes.length; i++) {
        let executionTimes = 1;

        if(codes[i][2] == "undefined" || codes[i][3] == "undefined" || codes[i][4] == "undefined") {
            continue;
        }

        for(const currentRepeatMapper of repeatMapper) {
            if(currentRepeatMapper[0] == i) {
                executionTimes = currentRepeatMapper[1];
            }
        }

        for(let j=0; j<executionTimes; j++) {
            const watermarkText: string = `Pedido: ${order} \r\nQuantidade: ${codes[i][3]}${codes[i][2]} \r\nRoteiro: ${codes[i][4]}`;
            let fontSize = 12;
            let lineHeight = 6.8;
            let positionX = 27;

            if(pages[pageIndex].getSize().width > 600) {
                fontSize = 11;
                lineHeight = 6.8;
                positionX = 15;
            }

            pages[pageIndex].drawText(watermarkText, {
                font: HelveticaFont,
                x: positionX,
                y: 30,
                size: fontSize,
                color: rgb(0, 0, 0),
                lineHeight: lineHeight,
                rotate: degrees(90)
            });

            pageIndex++;
        }
    };

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(inputPath, pdfBytes);
}

export async function joinLevelProjects(suffixMapper: Array<Array<string>>, temporaryFile: string) {
    const tempPathArray = temporaryFile.split("\\");
    tempPathArray.pop();
    const tempPath = tempPathArray.join("\\") + "\\";

    for (let i=0; i<suffixMapper.length; i++) {
        for (let j=0; j<suffixMapper[i].length; j++) {
            let projectArray: Array<string> = suffixMapper[i][0].split("\\");
            let projectName: string = projectArray[projectArray.length - 1];

            if (j == 0) {
                await fs.copyFile(suffixMapper[i][j], tempPath + projectName);
                await organizePDF(tempPath + projectName);
                continue;
            }

            const mainPDFBytes = await fs.readFile(tempPath + projectName);
            const mainPdfDoc = await PDFDocument.load(mainPDFBytes);
            const mainPage = mainPdfDoc.getPage(0);
            const overlayPDFBytes = await fs.readFile(suffixMapper[i][j]);
            const overlayPdfDoc = await PDFDocument.load(overlayPDFBytes);
            const overlayPage = overlayPdfDoc.getPage(0);

            if (overlayPage.getSize().width > overlayPage.getSize().height) {
                overlayPage.setRotation(degrees(90));

                if (overlayPage.getWidth() > 1190 && overlayPage.getWidth() < 1193) {
                    overlayPage.scale(0.706,0.706);
                }

                if (overlayPage.getWidth() > 1680 && overlayPage.getWidth() < 1685) {
                    overlayPage.scale(0.5,0.5);
                }
            }

            const embeddedPage = await mainPdfDoc.embedPage(overlayPage);
            mainPage.drawPage(embeddedPage, {
                x: 0,
                y: 0,
                width: mainPage.getWidth(),
                height: mainPage.getHeight(),
            });


            const modifiedPdfBytes = await mainPdfDoc.save();
            await fs.writeFile(tempPath + projectName, modifiedPdfBytes);
        }
    }
}
