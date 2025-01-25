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
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(fileName);

        document.body.removeChild(tempContainer);
      })
      .catch(() => {
        document.body.removeChild(tempContainer);
      });
  }
}
