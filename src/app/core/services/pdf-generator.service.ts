import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root',
})
export class PdfGeneratorService {
  generatePDF(elementId: string, fileName: string = 'document.pdf'): void {
    const element = document.getElementById(elementId);
    if (!element) {
      return;
    }

    const clonedElement = element.cloneNode(true) as HTMLElement;

    const noPrintElements = clonedElement.querySelectorAll('.no-print');
    noPrintElements.forEach((el) => el.parentNode?.removeChild(el));

    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '794px';
    tempContainer.style.fontSize = '12px';
    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);

    html2canvas(clonedElement, {
      scale: 2,
      width: 794,
    })
      .then((canvas) => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const margin = 10;
        const imgData = canvas.toDataURL('image/png');

        let yPosition = 0;
        const canvasHeight = canvas.height;
        const canvasWidth = canvas.width;
        const pageHeightInCanvasUnits =
          ((pdfHeight - margin) * canvasWidth) / pdfWidth;

        while (yPosition < canvasHeight) {
          const currentCanvas = document.createElement('canvas');
          currentCanvas.width = canvasWidth;
          currentCanvas.height = Math.min(
            pageHeightInCanvasUnits,
            canvasHeight - yPosition
          );

          const ctx = currentCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(
              canvas,
              0,
              yPosition,
              canvasWidth,
              currentCanvas.height,
              0,
              0,
              canvasWidth,
              currentCanvas.height
            );

            const pageData = currentCanvas.toDataURL('image/png');
            pdf.addImage(
              pageData,
              'PNG',
              0,
              margin / 2,
              pdfWidth,
              (currentCanvas.height * pdfWidth) / canvasWidth
            );
            if (yPosition + pageHeightInCanvasUnits < canvasHeight) {
              pdf.addPage();
            }
          }

          yPosition += pageHeightInCanvasUnits;
        }

        pdf.save(fileName);
        document.body.removeChild(tempContainer);
      })
      .catch(() => {
        document.body.removeChild(tempContainer);
      });
  }
}
