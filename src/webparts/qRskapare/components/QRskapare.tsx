import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './QRskapare.module.scss';
import type { IQRskapareProps } from './IQRskapareProps';
import { 
  TextField, 
  PrimaryButton,
  DefaultButton,
  Dropdown, 
  IDropdownOption,
  Slider,
  Checkbox,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  Stack,
  Text
} from '@fluentui/react';
import * as QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { generateGustafKlinikenTemplate } from './GustafTemplate';
import { Document, Packer, Paragraph, ImageRun, TextRun, HeadingLevel } from 'docx';
import * as XLSX from 'xlsx';

// Template definitions with Swedish and English placeholders
interface ITemplate {
  id: string;
  name: string;
  content: string;
}

// Excel data structure for batch processing
interface IExcelRow {
  url1: string;
  url2?: string;
  url3?: string;
  url4?: string;
  url5?: string;
  text?: string;
  header?: string;
}

const templates: ITemplate[] = [
  {
    id: 'basic',
    name: 'Basic Template / Grundmall',
    content: `RUBRIK HÄR

TEXT HÄR

QR KOD HÄR`
  },
  {
    id: 'business',
    name: 'Business Card / Visitkort',
    content: `HEADER HERE

Contact Information:
TEXT HERE

Scan QR code for more details:
QR CODE HERE`
  },
  {
    id: 'event',
    name: 'Event Invitation / Eventinbjudan',
    content: `RUBRIK HÄR

EVENT DETAILS:
TEXT HÄR

Register by scanning:
QR KOD HÄR`
  },
  {
    id: 'multi',
    name: 'Multiple QR Codes / Flera QR-koder',
    content: `RUBRIK HÄR

TEXT HÄR

Primary QR Code:
QR KOD HÄR

Secondary QR Code:
QR KOD HÄR2

Additional codes:
QR CODE HERE3
QR KOD HÄR4
QR CODE HERE5`
  }
];

const fontOptions: IDropdownOption[] = [
  { key: 'Segoe UI', text: 'Segoe UI' },
  { key: 'Arial', text: 'Arial' },
  { key: 'Calibri', text: 'Calibri' },
  { key: 'Times New Roman', text: 'Times New Roman' },
  { key: 'Helvetica', text: 'Helvetica' }
];

const QRskapare: React.FC<IQRskapareProps> = (props) => {
  const [urls, setUrls] = useState<string[]>(['', '', '', '', '']); // Up to 5 QR codes
  const [text, setText] = useState<string>('');
  const [headerText, setHeaderText] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('basic');
  const [selectedFont, setSelectedFont] = useState<string>('Segoe UI');
  const [headerFontSize, setHeaderFontSize] = useState<number>(24);
  const [bodyFontSize, setBodyFontSize] = useState<number>(14);
  const [qrCodeSize, setQrCodeSize] = useState<number>(50); // QR code size in mm/points
  const [createWordVersion, setCreateWordVersion] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: MessageBarType } | null>(null);
  const [qrCodeDataUrls, setQrCodeDataUrls] = useState<string[]>(['', '', '', '', '']);
  const [excelData, setExcelData] = useState<IExcelRow[]>([]);
  const [isProcessingExcel, setIsProcessingExcel] = useState<boolean>(false);
  const [showBatchMode, setShowBatchMode] = useState<boolean>(false);

  // Generate QR code previews for all URLs
  useEffect(() => {
    const generatePreviews = async () => {
      const newDataUrls: string[] = [];
      
      for (let i = 0; i < urls.length; i++) {
        if (urls[i].trim()) {
          try {
            const dataUrl = await QRCode.toDataURL(urls[i], {
              width: 200,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              }
            });
            newDataUrls[i] = dataUrl;
          } catch (err) {
            console.error(`QR Code generation error for URL ${i + 1}:`, err);
            newDataUrls[i] = '';
          }
        } else {
          newDataUrls[i] = '';
        }
      }
      
      setQrCodeDataUrls(newDataUrls);
    };

    generatePreviews();
  }, [urls]);

  const getCurrentTemplate = (): ITemplate => {
    return templates.find(t => t.id === selectedTemplate) || templates[0];
  };

  const processTemplate = (template: string, header: string, body: string, urlsArray: string[]): string => {
    let processed = template
      .replace(/HEADER HERE|RUBRIK HÄR/gi, header)
      .replace(/TEXT HERE|TEXT HÄR/gi, body);
    
    // Handle numbered QR code placeholders
    for (let i = 1; i <= 5; i++) {
      const patterns = [
        new RegExp(`QR CODE HERE${i > 1 ? i : ''}`, 'gi'),
        new RegExp(`QR KOD HÄR${i > 1 ? i : ''}`, 'gi')
      ];
      
      patterns.forEach(pattern => {
        if (urlsArray[i - 1] && urlsArray[i - 1].trim()) {
          processed = processed.replace(pattern, `QR_CODE_PLACEHOLDER_${i}`);
        } else {
          processed = processed.replace(pattern, '');
        }
      });
    }
    
    return processed;
  };

  const generatePDF = async (urlsArray: string[], headerOverride?: string, textOverride?: string): Promise<void> => {
    const template = getCurrentTemplate();
    const processedContent = processTemplate(
      template.content, 
      headerOverride || headerText, 
      textOverride || text, 
      urlsArray
    );
    
    // Generate high-quality QR codes for PDF
    const qrDataUrls: string[] = [];
    for (let i = 0; i < urlsArray.length; i++) {
      if (urlsArray[i] && urlsArray[i].trim()) {
        try {
          const qrDataUrl = await QRCode.toDataURL(urlsArray[i], {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          qrDataUrls[i] = qrDataUrl;
        } catch (error) {
          console.error(`Error generating QR code ${i + 1}:`, error);
          qrDataUrls[i] = '';
        }
      }
    }

    // Create PDF
    const pdf = new jsPDF();
    pdf.setFont(selectedFont.toLowerCase().replace(' ', ''), 'normal');
    
    const lines = processedContent.split('\n');
    let yPosition = 20;
    
    for (const line of lines) {
      if (line.trim() === '') {
        yPosition += 10;
        continue;
      }
      
      // Check for QR code placeholders
      const qrPlaceholderMatch = line.match(/QR_CODE_PLACEHOLDER_(\d+)/);
      if (qrPlaceholderMatch) {
        const qrIndex = parseInt(qrPlaceholderMatch[1]) - 1;
        if (qrDataUrls[qrIndex]) {
          // Add QR code with custom size
          const xPosition = 20 + (qrIndex % 2) * (qrCodeSize + 10); // Alternate horizontal position for multiple QR codes
          pdf.addImage(qrDataUrls[qrIndex], 'PNG', xPosition, yPosition, qrCodeSize, qrCodeSize);
          
          // Add URL label below QR code
          pdf.setFontSize(8);
          const urlText = pdf.splitTextToSize(urlsArray[qrIndex], 80);
          pdf.text(urlText, xPosition, yPosition + qrCodeSize + 5);
          
          if ((qrIndex + 1) % 2 === 0 || qrIndex === urlsArray.filter(u => u.trim()).length - 1) {
            yPosition += qrCodeSize + 20; // Move to next row
          }
        }
      } else {
        // Regular text line
        const isHeader = line === (headerOverride || headerText) || 
                        lines.indexOf(line) === 0 || 
                        line.toUpperCase() === line;
        
        pdf.setFontSize(isHeader ? headerFontSize : bodyFontSize);
        
        // Handle text wrapping
        const splitText = pdf.splitTextToSize(line, 170);
        pdf.text(splitText, 20, yPosition);
        yPosition += splitText.length * (isHeader ? headerFontSize * 0.5 : bodyFontSize * 0.5);
      }
    }
    
    // Save PDF
    const fileName = `QR_Document_${new Date().getTime()}.pdf`;
    pdf.save(fileName);
  };

  const generateWord = async (urlsArray: string[], headerOverride?: string, textOverride?: string): Promise<void> => {
    const template = getCurrentTemplate();
    const processedContent = processTemplate(
      template.content, 
      headerOverride || headerText, 
      textOverride || text, 
      urlsArray
    );
    
    // Generate QR codes as buffers for Word
    const qrBuffers: ArrayBuffer[] = [];
    for (let i = 0; i < urlsArray.length; i++) {
      if (urlsArray[i] && urlsArray[i].trim()) {
        try {
          const qrDataUrl = await QRCode.toDataURL(urlsArray[i], {
            width: 300,
            margin: 2
          });
          const response = await fetch(qrDataUrl);
          const qrBuffer = await response.arrayBuffer();
          qrBuffers[i] = qrBuffer;
        } catch (error) {
          console.error(`Error generating QR code ${i + 1} for Word:`, error);
        }
      }
    }

    const paragraphs: Paragraph[] = [];
    const lines = processedContent.split('\n');
    
    for (const line of lines) {
      if (line.trim() === '') {
        paragraphs.push(new Paragraph({}));
        continue;
      }
      
      // Check for QR code placeholders
      const qrPlaceholderMatch = line.match(/QR_CODE_PLACEHOLDER_(\d+)/);
      if (qrPlaceholderMatch) {
        const qrIndex = parseInt(qrPlaceholderMatch[1]) - 1;
        if (qrBuffers[qrIndex]) {
          // Add QR code
          paragraphs.push(
            new Paragraph({
              children: [
                new ImageRun({
                data: new Uint8Array(qrBuffers[qrIndex]),
                transformation: {
                  width: qrCodeSize * 4, // Convert to Word units (approximately)
                  height: qrCodeSize * 4,
                },
                type: 'png'
              }),
              ],
            })
          );
          
          // Add URL text
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: urlsArray[qrIndex],
                  size: bodyFontSize,
                  font: selectedFont,
                }),
              ],
            })
          );
        }
      } else {
        // Determine if this is a header
        const isHeader = line === headerText || 
                        lines.indexOf(line) === 0 || 
                        line.toUpperCase() === line;
        
        paragraphs.push(
          new Paragraph({
            heading: isHeader ? HeadingLevel.HEADING_1 : undefined,
            children: [
              new TextRun({
                text: line,
                size: isHeader ? headerFontSize * 2 : bodyFontSize * 2, // Word uses half-points
                font: selectedFont,
              }),
            ],
          })
        );
      }
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    const fileName = `QR_Document_${new Date().getTime()}.docx`;
    saveAs(new Blob([new Uint8Array(buffer)]), fileName);
  };

  // Excel file processing - handles both with and without headers
  const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingExcel(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // First, try to read with headers
        const jsonDataWithHeaders = XLSX.utils.sheet_to_json(worksheet);
        const jsonDataArray = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const processedData: IExcelRow[] = [];
        let startRow = 0;
        
        // Check if first row contains headers by looking for common header patterns
        const firstRowArray = jsonDataArray[0] as string[];
        const hasHeaders = firstRowArray && (
          firstRowArray.some(cell => 
            cell && typeof cell === 'string' && 
            (cell.toLowerCase().includes('url') || 
             cell.toLowerCase().includes('text') || 
             cell.toLowerCase().includes('header') ||
             cell.toLowerCase().includes('rubrik'))
          )
        );
        
        if (hasHeaders) {
          startRow = 1; // Skip header row
          console.log('Excel file has headers, processing from row 2');
        } else {
          startRow = 0; // Start from first row
          console.log('Excel file has no headers, processing from row 1');
        }
        
        // Process data rows
        for (let i = startRow; i < jsonDataArray.length; i++) {
          const row = jsonDataArray[i] as string[];
          if (row && row[0]) { // Must have at least URL1
            
            // Try to map by headers first if they exist
            let processedRow: IExcelRow;
            
            if (hasHeaders && jsonDataWithHeaders[i - 1]) {
              const headerRow = jsonDataWithHeaders[i - 1] as any;
              processedRow = {
                url1: headerRow['URL1'] || headerRow['url1'] || headerRow['URL'] || headerRow['url'] || row[0] || '',
                url2: headerRow['URL2'] || headerRow['url2'] || row[1] || '',
                url3: headerRow['URL3'] || headerRow['url3'] || row[2] || '',
                url4: headerRow['URL4'] || headerRow['url4'] || row[3] || '',
                url5: headerRow['URL5'] || headerRow['url5'] || row[4] || '',
                text: headerRow['Text'] || headerRow['text'] || headerRow['TEXT'] || row[5] || text,
                header: headerRow['Header'] || headerRow['header'] || headerRow['HEADER'] || headerRow['Rubrik'] || headerRow['rubrik'] || row[6] || headerText
              };
            } else {
              // Fallback to positional mapping
              processedRow = {
                url1: row[0] || '',
                url2: row[1] || '',
                url3: row[2] || '',
                url4: row[3] || '',
                url5: row[4] || '',
                text: row[5] || text, // Use default if not provided
                header: row[6] || headerText // Use default if not provided
              };
            }
            
            processedData.push(processedRow);
          }
        }
        
        setExcelData(processedData);
        setShowBatchMode(true);
        setMessage({ 
          text: `Excel file processed! ${processedData.length} rows loaded / Excel-fil bearbetad! ${processedData.length} rader laddade`, 
          type: MessageBarType.success 
        });
      } catch (error) {
        console.error('Excel processing error:', error);
        setMessage({ 
          text: 'Error processing Excel file / Fel vid bearbetning av Excel-fil', 
          type: MessageBarType.error 
        });
      } finally {
        setIsProcessingExcel(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Generate documents from Excel data
  const handleBatchGenerate = async (): Promise<void> => {
    if (excelData.length === 0) {
      setMessage({ text: 'No Excel data to process / Ingen Excel-data att bearbeta', type: MessageBarType.error });
      return;
    }

    setIsGenerating(true);
    setMessage(null);

    try {
      for (let i = 0; i < excelData.length; i++) {
        const row = excelData[i];
        const rowUrls = [row.url1, row.url2 || '', row.url3 || '', row.url4 || '', row.url5 || ''];
        
        // Generate PDF for each row
        await generatePDF(rowUrls, row.header, row.text);
        
        // Generate Word if requested
        if (createWordVersion) {
          await generateWord(rowUrls, row.header, row.text);
        }
        
        // Small delay to prevent overwhelming the browser
        if (i < excelData.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      const successMessage = createWordVersion 
        ? `${excelData.length} PDF and Word documents generated! / ${excelData.length} PDF- och Word-dokument skapade!`
        : `${excelData.length} PDF documents generated! / ${excelData.length} PDF-dokument skapade!`;
      
      setMessage({ text: successMessage, type: MessageBarType.success });
    } catch (error) {
      console.error('Batch generation error:', error);
      setMessage({ 
        text: 'Error generating batch documents / Fel vid skapande av batch-dokument', 
        type: MessageBarType.error 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async (): Promise<void> => {
    const activeUrls = urls.filter(u => u.trim());
    
    if (activeUrls.length === 0) {
      setMessage({ text: 'Please enter at least one URL / Vänligen ange minst en URL', type: MessageBarType.error });
      return;
    }
    
    if (!text.trim()) {
      setMessage({ text: 'Please enter text content / Vänligen ange textinnehåll', type: MessageBarType.error });
      return;
    }

    setIsGenerating(true);
    setMessage(null);

    try {
      // Generate PDF
      await generatePDF(urls);
      
      // Generate Word document if requested
      if (createWordVersion) {
        await generateWord(urls);
      }
      
      const successMessage = createWordVersion 
        ? 'Documents generated successfully! Check your downloads folder / Dokument skapade framgångsrikt! Kolla din nedladdningsmapp'
        : 'PDF generated successfully! Check your downloads folder / PDF skapad framgångsrikt! Kolla din nedladdningsmapp';
      
      setMessage({ text: successMessage, type: MessageBarType.success });
    } catch (error) {
      console.error('Generation error:', error);
      setMessage({ 
        text: 'Error generating documents / Fel vid skapande av dokument', 
        type: MessageBarType.error 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Gustaf Kliniken template document
  const handleGenerateGustafTemplate = async (): Promise<void> => {
    try {
      setIsGenerating(true);
      
      console.log('🏥 Generating Gustaf Kliniken template document');
      
      // Generate the template (now returns Blob directly)
      const templateBlob = await generateGustafKlinikenTemplate();
      
      // Save the document as text file (works like HTML test)
      const fileName = `Gustaf_Kliniken_Mall_${new Date().toISOString().split('T')[0]}.txt`;
      saveAs(templateBlob, fileName);
      
      setMessage({
        text: '✅ Gustaf Kliniken mall genererad framgångsrikt! Textfilen har laddats ner med komplett mall.',
        type: MessageBarType.success
      });
      
    } catch (error) {
      console.error('❌ Error generating Gustaf template:', error);
      setMessage({
        text: `❌ Fel vid generering av Gustaf Kliniken mall: ${error.message}`,
        type: MessageBarType.error
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateUrl = (index: number, value: string): void => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  // Generate and download Excel template
  const downloadExcelTemplate = (): void => {
    try {
      // Create template data with headers and example rows
      const templateData = [
        // Header row
        ['URL1', 'URL2', 'URL3', 'URL4', 'URL5', 'Text', 'Header'],
        // Example row 1
        ['https://gustafkliniken.sharepoint.com/sites/Gustafkliniken', 'https://gustafkliniken.se', 'mailto:info@gustafkliniken.se', '', '', 'Visit our SharePoint site and main website for more information', 'Gustaf Kliniken'],
        // Example row 2  
        ['https://example.com', 'https://support.example.com', 'tel:+46123456789', '', '', 'Contact us through our website or call support', 'Example Company'],
        // Example row 3 - minimal
        ['https://minimal-example.com', '', '', '', '', 'Simple example with just one URL', 'Minimal Example'],
        // Empty rows for user input
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '']
      ];

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(templateData);

      // Set column widths for better readability
      const columnWidths = [
        { wch: 40 }, // URL1
        { wch: 40 }, // URL2  
        { wch: 30 }, // URL3
        { wch: 20 }, // URL4
        { wch: 20 }, // URL5
        { wch: 50 }, // Text
        { wch: 25 }  // Header
      ];
      worksheet['!cols'] = columnWidths;

      // Style the header row (make it bold - basic styling)
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:G1');
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
        if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
        worksheet[cellAddress].s.font = { bold: true };
      }

      // Add the worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'QR Generator Template');

      // Generate and download the file
      const fileName = `QR_Generator_Template_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      setMessage({
        text: `Excel template downloaded: ${fileName} / Excel-mall nedladdad: ${fileName}`,
        type: MessageBarType.success
      });

    } catch (error) {
      console.error('Excel template generation error:', error);
      setMessage({
        text: 'Error creating Excel template / Fel vid skapande av Excel-mall',
        type: MessageBarType.error
      });
    }
  };

  const { hasTeamsContext } = props;

  return (
    <section className={`${styles.qRskapare} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.container}>
        <Text variant="xxLarge" className={styles.title}>
          QR Code Document Generator / QR-kod dokumentgenerator
        </Text>
        
        {message && (
          <MessageBar messageBarType={message.type} onDismiss={() => setMessage(null)}>
            {message.text}
          </MessageBar>
        )}

        <Stack tokens={{ childrenGap: 20 }}>
          {/* Mode Selection */}
          <Stack horizontal tokens={{ childrenGap: 20 }}>
            <PrimaryButton
              text="Single Document / Enskilt dokument"
              onClick={() => setShowBatchMode(false)}
              disabled={!showBatchMode}
            />
            <DefaultButton
              text="Batch from Excel / Batch från Excel"
              onClick={() => setShowBatchMode(true)}
              disabled={showBatchMode}
            />
          </Stack>

          {!showBatchMode ? (
            // Single document mode
            <>
              {/* Multiple URL Inputs */}
              <Stack tokens={{ childrenGap: 10 }}>
                <Text variant="large">URLs for QR Codes / URLs för QR-koder:</Text>
                {urls.map((url, index) => (
                  <TextField
                    key={index}
                    label={`URL ${index + 1} ${index === 0 ? '(Required / Obligatorisk)' : '(Optional / Valfri)'}`}
                    placeholder={`Enter URL ${index + 1} / Ange URL ${index + 1}`}
                    value={url}
                    onChange={(_, newValue) => updateUrl(index, newValue || '')}
                    required={index === 0}
                  />
                ))}
              </Stack>

              {/* Header Text Input */}
              <TextField
                label="Header Text / Rubriktext"
                placeholder="Enter header text / Ange rubriktext"
                value={headerText}
                onChange={(_, newValue) => setHeaderText(newValue || '')}
                required
              />

              {/* Main Text Input */}
              <TextField
                label="Main Text / Huvudtext"
                placeholder="Enter main content / Ange huvudinnehåll"
                value={text}
                onChange={(_, newValue) => setText(newValue || '')}
                multiline
                rows={4}
                required
              />
            </>
          ) : (
            // Excel batch mode
            <Stack tokens={{ childrenGap: 15 }}>
              <Text variant="large">Excel Import / Excel-import:</Text>
              
              {/* Download Template Button */}
              <Stack horizontal tokens={{ childrenGap: 10 }} style={{ alignItems: 'center' }}>
                <DefaultButton
                  text="📥 Download Excel Template / Ladda ner Excel-mall"
                  onClick={downloadExcelTemplate}
                  iconProps={{ iconName: 'Download' }}
                  style={{ backgroundColor: '#e3f2fd', border: '1px solid #2196f3' }}
                />
                <Text style={{ fontSize: '12px', color: '#666' }}>
                  Get a pre-configured Excel file with examples / Få en förkonfigurerad Excel-fil med exempel
                </Text>
              </Stack>

              <div>
                <Text><strong>Excel Configuration Options / Excel-konfigurationsalternativ:</strong></Text>
                <br />
                <Text><strong>Option 1 - With Headers (Recommended):</strong></Text>
                <Text>Row 1: URL1 | URL2 | URL3 | URL4 | URL5 | Text | Header</Text>
                <Text>Row 2+: Your data...</Text>
                <br />
                <Text><strong>Option 2 - Without Headers:</strong></Text>
                <Text>Row 1: data | data | data | data | data | data | data</Text>
                <Text>Column order: A=URL1, B=URL2, C=URL3, D=URL4, E=URL5, F=Text, G=Header</Text>
                <br />
                <Text style={{ fontSize: '12px', fontStyle: 'italic' }}>
                  Headers can be: URL1/url1, URL2/url2, Text/text, Header/header/Rubrik/rubrik
                </Text>
              </div>
              
              <div>
                <Text><strong>Upload Your Excel File / Ladda upp din Excel-fil:</strong></Text>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelImport}
                  style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '5px' }}
                />
              </div>
              
              {isProcessingExcel && <Spinner size={SpinnerSize.medium} label="Processing Excel file..." />}
              
              {excelData.length > 0 && (
                <div className={styles.preview}>
                  <Text variant="large">Excel Data Preview / Excel-data förhandsvisning:</Text>
                  <Text>{excelData.length} rows loaded / rader laddade</Text>
                  <div style={{ maxHeight: '200px', overflow: 'auto', marginTop: '10px' }}>
                    {excelData.slice(0, 5).map((row, index) => (
                      <div key={index} style={{ padding: '5px', borderBottom: '1px solid #eee' }}>
                        <strong>Row {index + 1}:</strong> URLs: {[row.url1, row.url2, row.url3, row.url4, row.url5].filter(Boolean).length}, 
                        Header: {row.header?.substring(0, 30) || 'Default'}..., 
                        Text: {row.text?.substring(0, 50) || 'Default'}...
                      </div>
                    ))}
                    {excelData.length > 5 && <Text>...and {excelData.length - 5} more rows</Text>}
                  </div>
                </div>
              )}
            </Stack>
          )}

          {/* Template Selection */}
          <Dropdown
            label="Template / Mall"
            options={templates.map(t => ({ key: t.id, text: t.name }))}
            selectedKey={selectedTemplate}
            onChange={(_, option) => setSelectedTemplate(option?.key as string || 'basic')}
          />

          {/* Font Selection */}
          <Dropdown
            label="Font / Typsnitt"
            options={fontOptions}
            selectedKey={selectedFont}
            onChange={(_, option) => setSelectedFont(option?.key as string || 'Segoe UI')}
          />

          <Stack horizontal tokens={{ childrenGap: 15 }}>
            {/* Header Font Size */}
            <Stack.Item grow>
              <Text>Header Font Size / Rubriktypsnittsstorlek: {headerFontSize}px</Text>
              <Slider
                min={16}
                max={48}
                step={2}
                value={headerFontSize}
                onChange={(value) => setHeaderFontSize(value)}
              />
            </Stack.Item>

            {/* Body Font Size */}
            <Stack.Item grow>
              <Text>Body Font Size / Brödtextstorlek: {bodyFontSize}px</Text>
              <Slider
                min={10}
                max={24}
                step={1}
                value={bodyFontSize}
                onChange={(value) => setBodyFontSize(value)}
              />
            </Stack.Item>

            {/* QR Code Size */}
            <Stack.Item grow>
              <Text>QR Code Size / QR-kodstorlek: {qrCodeSize}mm</Text>
              <Slider
                min={25}
                max={100}
                step={5}
                value={qrCodeSize}
                onChange={(value) => setQrCodeSize(value)}
              />
            </Stack.Item>
          </Stack>

          {/* Create Word Version Option */}
          <Checkbox
            label="Also create editable Word document / Skapa även redigerbart Word-dokument"
            checked={createWordVersion}
            onChange={(_, checked) => setCreateWordVersion(checked || false)}
          />

          {/* QR Code Previews */}
          {!showBatchMode && qrCodeDataUrls.some(url => url) && (
            <div className={styles.preview}>
              <Text variant="large">QR Code Previews / QR-kod förhandsvisningar:</Text>
              <Stack horizontal wrap tokens={{ childrenGap: 10 }}>
                {qrCodeDataUrls.map((dataUrl, index) => dataUrl && (
                  <div key={index} style={{ textAlign: 'center' }}>
                    <Text>QR {index + 1}</Text>
                    <img src={dataUrl} alt={`QR Code ${index + 1}`} className={styles.qrPreview} />
                  </div>
                ))}
              </Stack>
            </div>
          )}

          {/* Template Preview */}
          {!showBatchMode && headerText && text && (
            <div className={styles.templatePreview}>
              <Text variant="large">Template Preview / Mallförhandsvisning:</Text>
              <div className={styles.previewContent} style={{ fontFamily: selectedFont }}>
                <pre>{processTemplate(getCurrentTemplate().content, headerText, text, urls)}</pre>
              </div>
            </div>
          )}

          {/* Generate Buttons */}
          <Stack horizontal tokens={{ childrenGap: 10 }}>
            {!showBatchMode ? (
              <PrimaryButton
                text={isGenerating ? "Generating... / Genererar..." : "Generate Documents / Generera dokument"}
                onClick={handleGenerate}
                disabled={isGenerating || !urls[0].trim() || !text.trim() || !headerText.trim()}
              />
            ) : (
              <PrimaryButton
                text={isGenerating ? "Generating Batch... / Genererar batch..." : "Generate All Documents / Generera alla dokument"}
                onClick={handleBatchGenerate}
                disabled={isGenerating || excelData.length === 0}
              />
            )}
            
            {/* Gustaf Kliniken Template Button */}
            <DefaultButton
              text="🏥 Gustaf Kliniken Mall"
              onClick={handleGenerateGustafTemplate}
              disabled={isGenerating}
              title="Generera Gustaf Kliniken Word-mall med korrekt header och footer"
            />
            
            {isGenerating && <Spinner size={SpinnerSize.medium} />}
          </Stack>
        </Stack>
      </div>
    </section>
  );
};

export default QRskapare;
