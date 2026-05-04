const PDFDocument = require("pdfkit");

/**
 * Streams a professional PDF built from resume plain text.
 */
function streamResumePdf(text, stream) {
  const doc = new PDFDocument({
    margins: { top: 56, bottom: 56, left: 56, right: 56 },
    size: "LETTER",
  });
  doc.pipe(stream);

  const pageWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;

  doc.font("Helvetica").fontSize(11).fillColor("#1f2937");
  doc.text((text || "").trim() || " ", {
    width: pageWidth,
    align: "left",
    lineGap: 2,
    paragraphGap: 6,
  });

  doc.end();
}

module.exports = { streamResumePdf };
