const PDFDocument = require("pdfkit");

function streamCoverLetterPdf({ text, personalDetails }, stream) {
  const doc = new PDFDocument({
    margins: { top: 56, bottom: 56, left: 56, right: 56 },
    size: "LETTER",
  });
  doc.pipe(stream);

  const details = personalDetails || {};
  const fullName = String(details.fullName || "Candidate").trim();
  const contactLine = [details.email, details.phone, details.location].filter(Boolean).join(" • ");
  const linksLine = [details.linkedin, details.website].filter(Boolean).join(" • ");
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  doc.font("Helvetica-Bold").fontSize(17).fillColor("#111827").text(fullName, { width, align: "left" });
  if (contactLine) {
    doc.moveDown(0.25).font("Helvetica").fontSize(10).fillColor("#4b5563").text(contactLine, { width, align: "left" });
  }
  if (linksLine) {
    doc.moveDown(0.15).font("Helvetica").fontSize(10).fillColor("#4b5563").text(linksLine, { width, align: "left" });
  }

  doc.moveDown(0.9);
  doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).lineWidth(0.8).strokeColor("#e5e7eb").stroke();
  doc.moveDown(0.9);
  doc.font("Helvetica").fontSize(11).fillColor("#1f2937").text((text || "").trim() || " ", {
    width,
    align: "left",
    lineGap: 2,
    paragraphGap: 6,
  });

  doc.end();
}

module.exports = { streamCoverLetterPdf };
