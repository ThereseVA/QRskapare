import { Document, Paragraph, TextRun, Header, Footer, AlignmentType, Packer } from 'docx';

// Generate Gustaf Kliniken template programmatically - much simpler than loading files!
export const generateGustafKlinikenTemplate = async (): Promise<ArrayBuffer> => {
  const doc = new Document({
    sections: [{
      properties: {},
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "🏥 GUSTAF KLINIKEN",
                  bold: true,
                  size: 24,
                  color: "1f4e79",
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Kvalitet • Omsorg • Trygghet",
                  size: 16,
                  color: "666666",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Gustaf Kliniken AB | Storgatan 123, 111 22 Stockholm | Tel: 08-123 456 78 | info@gustafkliniken.se",
                  size: 16,
                  color: "666666",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200 },
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: "QR-kod Dokument",
              bold: true,
              size: 32,
              color: "1f4e79",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Dokumenttyp: ",
              bold: true,
            }),
            new TextRun({
              text: "{DOCUMENT_TYPE}",
              highlight: "yellow",
            }),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Patient: ",
              bold: true,
            }),
            new TextRun({
              text: "{PATIENT_NAME}",
              highlight: "yellow",
            }),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Datum: ",
              bold: true,
            }),
            new TextRun({
              text: "{DATE}",
              highlight: "yellow",
            }),
          ],
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "QR-kod:",
              bold: true,
            }),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "[QR-kod kommer här]",
              italics: true,
              color: "888888",
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Innehåll:",
              bold: true,
            }),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Detta är en Gustaf Kliniken QR-kod mall med korrekt header och footer.",
              color: "333333",
            }),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Mallen innehåller:",
              bold: true,
            }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "• Professionell Gustaf Kliniken header",
            }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "• QR-kod plats",
            }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "• Gustaf Kliniken footer med kontaktuppgifter",
            }),
          ],
          spacing: { after: 200 },
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
};