import { jsPDF } from 'jspdf';
import { ColoringBook } from '../types/book';

// Helper to convert an image URL (data URI or remote) to an HTMLImageElement for dimensions
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

// Convert SVG data URL to PNG data URL using canvas so jsPDF can embed cleanly
async function svgToPngDataUrl(svgDataUrl: string): Promise<string> {
  const img = await loadImage(svgDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return svgDataUrl;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

export async function generateColoringBookPdf(book: ColoringBook): Promise<void> {
  // Standard US Letter dimensions in mm: 215.9 x 279.4 (approx 216 x 280)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // ==========================================
  // PAGE 1: FRONT COVER
  // ==========================================
  
  // Outer double border
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(1.5);
  doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2, 'S');
  doc.setLineWidth(0.6);
  doc.rect(margin + 2.5, margin + 2.5, pageWidth - (margin + 2.5) * 2, pageHeight - (margin + 2.5) * 2, 'S');

  // Decorative corner rosettes
  const corners = [
    [margin + 5, margin + 5],
    [pageWidth - margin - 5, margin + 5],
    [margin + 5, pageHeight - margin - 5],
    [pageWidth - margin - 5, pageHeight - margin - 5],
  ];
  doc.setFillColor(30, 41, 59);
  corners.forEach(([x, y]) => {
    doc.circle(x, y, 1.8, 'F');
  });

  // Top Subheader
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text('OFFICIAL CHILDREN\'S COLORING ADVENTURE', pageWidth / 2, margin + 14, { align: 'center' });

  // Main Book Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(book.bookTitle.toUpperCase(), pageWidth - margin * 2 - 20);
  doc.text(titleLines, pageWidth / 2, margin + 25, { align: 'center' });

  const titleBottomY = margin + 25 + (titleLines.length * 8);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  doc.text(book.bookSubtitle, pageWidth / 2, titleBottomY + 2, { align: 'center' });

  // "Created especially for [Child's Name]" Badge
  const badgeY = titleBottomY + 12;
  const badgeWidth = 140;
  const badgeHeight = 12;
  const badgeX = (pageWidth - badgeWidth) / 2;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 3, 3, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`★  SPECIALLY CREATED FOR ${book.childName.toUpperCase()}  ★`, pageWidth / 2, badgeY + 8, { align: 'center' });

  // Cover Image
  const coverImgSrc = book.coverImageUrl || (book.pages[0]?.imageUrl);
  if (coverImgSrc) {
    try {
      let finalImg = coverImgSrc;
      if (coverImgSrc.startsWith('data:image/svg+xml')) {
        finalImg = await svgToPngDataUrl(coverImgSrc);
      }
      const imgY = badgeY + 18;
      const imgWidth = 140;
      const imgHeight = 120;
      const imgX = (pageWidth - imgWidth) / 2;

      // Draw border frame for cover image
      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(1.2);
      doc.rect(imgX - 1, imgY - 1, imgWidth + 2, imgHeight + 2, 'S');

      doc.addImage(finalImg, 'PNG', imgX, imgY, imgWidth, imgHeight);
    } catch (e) {
      console.warn('Could not render cover image in PDF', e);
    }
  }

  // Dedication box at bottom
  const bottomBoxY = pageHeight - margin - 35;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin + 10, bottomBoxY, pageWidth - (margin + 10) * 2, 28, 3, 3, 'FD');

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const dedLines = doc.splitTextToSize(`"${book.dedication}"`, pageWidth - (margin + 14) * 2);
  doc.text(dedLines, pageWidth / 2, bottomBoxY + 8, { align: 'center' });

  // Signature lines
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('MASTER ARTIST: ________________________   DATE: _______________', pageWidth / 2, bottomBoxY + 22, { align: 'center' });

  // ==========================================
  // PAGES 2 - 6: THE 5 COLORING PAGES
  // ==========================================
  for (let i = 0; i < book.pages.length; i++) {
    const page = book.pages[i];
    doc.addPage('letter', 'portrait');

    // Page Border
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(1.2);
    doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2, 'S');

    // Header Title Banner
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(`PAGE ${page.pageNumber}: ${page.title.toUpperCase()}`, pageWidth / 2, margin + 11, { align: 'center' });

    // Decorative line under title
    doc.setLineWidth(0.5);
    doc.setDrawColor(148, 163, 184);
    doc.line(margin + 20, margin + 14, pageWidth - margin - 20, margin + 14);

    // Main Coloring Image
    const imgSrc = page.imageUrl || (page.status === 'completed' ? page.imageUrl : null);
    if (imgSrc) {
      try {
        let finalImg = imgSrc;
        if (imgSrc.startsWith('data:image/svg+xml')) {
          finalImg = await svgToPngDataUrl(imgSrc);
        }
        // Coloring image printable area
        const imgWidth = 175;
        const imgHeight = 180;
        const imgX = (pageWidth - imgWidth) / 2;
        const imgY = margin + 18;

        doc.setDrawColor(30, 41, 59);
        doc.setLineWidth(0.8);
        doc.rect(imgX - 0.5, imgY - 0.5, imgWidth + 1, imgHeight + 1, 'S');

        doc.addImage(finalImg, 'PNG', imgX, imgY, imgWidth, imgHeight);
      } catch (e) {
        console.warn(`Could not add image for page ${page.pageNumber}`, e);
      }
    }

    // Story Caption Box
    const captionY = pageHeight - margin - 38;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin + 6, captionY, pageWidth - (margin + 6) * 2, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);
    const captionLines = doc.splitTextToSize(page.caption, pageWidth - (margin + 12) * 2);
    doc.text(captionLines, pageWidth / 2, captionY + 6.5, { align: 'center' });

    // Coloring Tip
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.text(`★ Barnaby's Tip: ${page.coloringTip}`, pageWidth / 2, captionY + 16.5, { align: 'center' });

    // Page Number Footer
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`- Page ${page.pageNumber} of ${book.pages.length} -`, pageWidth / 2, pageHeight - margin - 4, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(`Coloring Book for ${book.childName}`, pageWidth - margin - 10, pageHeight - margin - 4, { align: 'right' });
  }

  // ==========================================
  // PAGE 7: BONUS CERTIFICATE OF COMPLETION
  // ==========================================
  doc.addPage('letter', 'portrait');

  // Ornate certificate border
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(2.5);
  doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2, 'S');
  doc.setLineWidth(0.8);
  doc.rect(margin + 3, margin + 3, pageWidth - (margin + 3) * 2, pageHeight - (margin + 3) * 2, 'S');

  // Certificate Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(180, 83, 9);
  doc.text('★ ★ ★ OFFICIAL CERTIFICATE OF CREATIVITY ★ ★ ★', pageWidth / 2, margin + 28, { align: 'center' });

  doc.setFontSize(28);
  doc.setTextColor(15, 23, 42);
  doc.text('MASTER COLORING ARTIST', pageWidth / 2, margin + 44, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(71, 85, 105);
  doc.text('THIS PRESTIGIOUS AWARD IS PROUDLY PRESENTED TO:', pageWidth / 2, margin + 62, { align: 'center' });

  // Child's Name Banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(37, 99, 235);
  doc.text(book.childName.toUpperCase(), pageWidth / 2, margin + 82, { align: 'center' });

  // Underline
  doc.setLineWidth(1.2);
  doc.setDrawColor(37, 99, 235);
  const nameWidth = doc.getTextWidth(book.childName.toUpperCase()) + 30;
  doc.line((pageWidth - nameWidth) / 2, margin + 86, (pageWidth + nameWidth) / 2, margin + 86);

  // Body text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  const certBody = `For tremendous imagination, colorful bravery, and outstanding artistry shown while completing all 5 pages of the "${book.theme.toUpperCase()}" coloring book!`;
  const certLines = doc.splitTextToSize(certBody, 150);
  doc.text(certLines, pageWidth / 2, margin + 104, { align: 'center' });

  // Medal graphic
  const medalY = margin + 145;
  doc.setDrawColor(217, 119, 6);
  doc.setFillColor(254, 243, 199);
  doc.setLineWidth(1.5);
  doc.circle(pageWidth / 2, medalY, 18, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(180, 83, 9);
  doc.text('TOP', pageWidth / 2, medalY - 3, { align: 'center' });
  doc.text('ARTIST', pageWidth / 2, medalY + 5, { align: 'center' });
  doc.setFontSize(16);
  doc.text('★', pageWidth / 2, medalY + 12, { align: 'center' });

  // Signature Blocks
  const sigY = pageHeight - margin - 40;
  doc.setLineWidth(0.8);
  doc.setDrawColor(15, 23, 42);
  
  // Left line
  doc.line(margin + 20, sigY, margin + 75, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('Child Artist Signature', margin + 47.5, sigY + 6, { align: 'center' });

  // Right line
  doc.line(pageWidth - margin - 75, sigY, pageWidth - margin - 20, sigY);
  doc.text('Proud Parent / Teacher', pageWidth - margin - 47.5, sigY + 6, { align: 'center' });

  // Date
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Awarded on ${today}`, pageWidth / 2, sigY + 18, { align: 'center' });

  // Save the PDF
  const sanitizedName = book.childName.replace(/[^a-zA-Z0-9]/g, '_');
  const sanitizedTheme = book.theme.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${sanitizedName}_${sanitizedTheme}_Coloring_Book.pdf`);
}
