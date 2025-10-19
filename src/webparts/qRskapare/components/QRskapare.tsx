import * as React from 'react';
import { useState } from 'react';
import styles from './QRskapare.module.scss';
import type { IQRskapareProps } from './IQRskapareProps';
import { 
  TextField, 
  PrimaryButton,
  DefaultButton,
  Slider,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  Stack,
  Text,
  ChoiceGroup
} from '@fluentui/react';
import * as QRCode from 'qrcode';
import { saveAs } from 'file-saver';
import { TemplateManager } from './WordTemplateManager';
import * as XLSX from 'xlsx';

// QR Code entry interface
interface IQRCodeEntry {
  id: number;
  url: string;
  title: string;
}

// Excel batch data structure (max 10 QR codes per document)
interface IExcelBatchRow {
  URL_QR1: string;
  TITLE_QR1: string;
  URL_QR2?: string;
  TITLE_QR2?: string;
  URL_QR3?: string;
  TITLE_QR3?: string;
  URL_QR4?: string;
  TITLE_QR4?: string;
  URL_QR5?: string;
  TITLE_QR5?: string;
  URL_QR6?: string;
  TITLE_QR6?: string;
  URL_QR7?: string;
  TITLE_QR7?: string;
  URL_QR8?: string;
  TITLE_QR8?: string;
  URL_QR9?: string;
  TITLE_QR9?: string;
  URL_QR10?: string;
  TITLE_QR10?: string;
}

// Supported placeholders in Word documents
interface IWordPlaceholders {
  TITLE_PLACEHOLDER: string;
  BODY_PLACEHOLDER: string;
  [key: string]: string; // For dynamic QR placeholders like QR_CODE_1, QR_TITLE_1, etc.
}

const QRskapare: React.FC<IQRskapareProps> = (props) => {
  // Core state for the simplified solution
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>('');
  const [bodyText, setBodyText] = useState<string>('');
  const [qrCodes, setQrCodes] = useState<IQRCodeEntry[]>([
    { id: 1, url: '', title: '' }
  ]);
  const [qrSize, setQrSize] = useState<number>(50); // QR code size in mm
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: MessageBarType } | null>(null);
  const [templateManager] = useState<TemplateManager>(() => new TemplateManager());

  // Excel batch functionality state
  const [excelData, setExcelData] = useState<IExcelBatchRow[]>([]);
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [isProcessingExcel, setIsProcessingExcel] = useState<boolean>(false);

  // Handle Word document upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.docx')) {
      setUploadedFile(file);
      setMessage({ 
        text: `Word document "${file.name}" uploaded successfully!`, 
        type: MessageBarType.success 
      });
    } else {
      setMessage({ 
        text: 'Please upload a valid .docx Word document', 
        type: MessageBarType.error 
      });
    }
  };

  // Add new QR code entry
  const addQrCode = (): void => {
    const newId = Math.max(...qrCodes.map(qr => qr.id)) + 1;
    setQrCodes([...qrCodes, { id: newId, url: '', title: '' }]);
  };

  // Remove QR code entry
  const removeQrCode = (id: number): void => {
    if (qrCodes.length > 1) {
      setQrCodes(qrCodes.filter(qr => qr.id !== id));
    }
  };

  // Update QR code entry
  const updateQrCode = (id: number, field: 'url' | 'title', value: string): void => {
    setQrCodes(qrCodes.map(qr => 
      qr.id === id ? { ...qr, [field]: value } : qr
    ));
  };

  // Generate QR codes as image buffers
  const generateQrCodeImages = async (): Promise<{ [key: string]: ArrayBuffer }> => {
    const qrImages: { [key: string]: ArrayBuffer } = {};
    
    for (let i = 0; i < qrCodes.length; i++) {
      const qrCode = qrCodes[i];
      if (qrCode.url.trim()) {
        try {
          // Generate high-quality QR code as data URL (browser-compatible)
          const dataUrl = await QRCode.toDataURL(qrCode.url, {
            width: qrSize * 8, // Higher resolution for better quality in Word
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M'
          });
          
          // PROPER base64 to ArrayBuffer conversion
          const base64Data = dataUrl.split(',')[1]; // Remove data:image/png;base64, prefix
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let j = 0; j < binaryString.length; j++) {
            bytes[j] = binaryString.charCodeAt(j);
          }
          qrImages[`QR_CODE_${i + 1}`] = bytes.buffer;
          
          console.log(`✅ Generated QR code PNG data for QR_CODE_${i + 1}: ${qrCode.url} (${bytes.buffer.byteLength} bytes)`);
        } catch (error) {
          console.error(`❌ Error generating QR code ${i + 1}:`, error);
        }
      }
    }
    
    return qrImages;
  };

  // Download Excel template for batch processing
  const downloadExcelTemplate = (): void => {
    try {
      console.log('📊 Creating Excel template for batch QR code processing...');
      
      // Create header row with max 10 QR codes
      const headers = [];
      for (let i = 1; i <= 10; i++) {
        headers.push(`URL_QR${i}`);
        headers.push(`TITLE_QR${i}`);
      }

      // Create example data rows
      const templateData = [
        headers, // Header row
        // Example row 1 - Gustaf Kliniken
        [
          'https://gustafkliniken.se', 'Hemsida',
          'tel:+46840061616', 'Ring oss',
          'mailto:hej@gustafkliniken.se', 'Email',
          'https://gustafkliniken.sharepoint.com/sites/Gustafkliniken', 'SharePoint',
          '', '', '', '', '', '', '', '', '', '', '', ''
        ],
        // Example row 2 - Multiple services
        [
          'https://example.com', 'Webbplats',
          'https://maps.google.com/?q=Gustaf+Kliniken', 'Hitta hit',
          'https://booking.example.com', 'Boka tid',
          '', '', '', '', '', '', '', '', '', '', '', '', '', ''
        ],
        // Example row 3 - Single QR code
        [
          'https://single-example.com', 'Enkelt exempel',
          '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
        ],
        // Empty rows for user input
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
      ];

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(templateData);

      // Set column widths for better readability
      const columnWidths = [];
      for (let i = 1; i <= 10; i++) {
        columnWidths.push({ wch: 30 }); // URL column
        columnWidths.push({ wch: 20 }); // Title column
      }
      worksheet['!cols'] = columnWidths;

      // Style the header row
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:T1');
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
        if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
        worksheet[cellAddress].s.font = { bold: true };
      }

      // Add the worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'QR Batch Template');

      // Generate and download the file
      const fileName = `QR_Batch_Template_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      setMessage({
        text: `📊 Excel-mall nedladdad: ${fileName}. Fyll i med dina URLs och titlar!`,
        type: MessageBarType.success
      });

    } catch (error) {
      console.error('❌ Excel template generation error:', error);
      setMessage({
        text: '❌ Fel vid skapande av Excel-mall',
        type: MessageBarType.error
      });
    }
  };

  // Handle Excel file upload for batch processing
  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingExcel(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        console.log('📊 Processing Excel file for batch generation...');
        
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        const processedData: IExcelBatchRow[] = [];
        
        for (const row of jsonData) {
          // Check if row has at least one URL
          if (row.URL_QR1 && row.URL_QR1.trim()) {
            const processedRow: IExcelBatchRow = {
              URL_QR1: row.URL_QR1 || '',
              TITLE_QR1: row.TITLE_QR1 || 'QR Code 1',
              URL_QR2: row.URL_QR2 || '',
              TITLE_QR2: row.TITLE_QR2 || '',
              URL_QR3: row.URL_QR3 || '',
              TITLE_QR3: row.TITLE_QR3 || '',
              URL_QR4: row.URL_QR4 || '',
              TITLE_QR4: row.TITLE_QR4 || '',
              URL_QR5: row.URL_QR5 || '',
              TITLE_QR5: row.TITLE_QR5 || '',
              URL_QR6: row.URL_QR6 || '',
              TITLE_QR6: row.TITLE_QR6 || '',
              URL_QR7: row.URL_QR7 || '',
              TITLE_QR7: row.TITLE_QR7 || '',
              URL_QR8: row.URL_QR8 || '',
              TITLE_QR8: row.TITLE_QR8 || '',
              URL_QR9: row.URL_QR9 || '',
              TITLE_QR9: row.TITLE_QR9 || '',
              URL_QR10: row.URL_QR10 || '',
              TITLE_QR10: row.TITLE_QR10 || ''
            };
            processedData.push(processedRow);
          }
        }
        
        setExcelData(processedData);
        setIsBatchMode(true);
        
        console.log(`✅ Excel file processed! ${processedData.length} documents to generate`);
        setMessage({ 
          text: `📊 Excel-fil bearbetad! ${processedData.length} dokument kommer att skapas`, 
          type: MessageBarType.success 
        });
        
      } catch (error) {
        console.error('❌ Excel processing error:', error);
        setMessage({ 
          text: '❌ Fel vid bearbetning av Excel-fil. Kontrollera att filen har rätt format.', 
          type: MessageBarType.error 
        });
      } finally {
        setIsProcessingExcel(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Generate batch documents from Excel data
  const processBatchDocuments = async (): Promise<void> => {
    if (!uploadedFile) {
      setMessage({ text: '❌ Ladda upp en Word-mall först', type: MessageBarType.error });
      return;
    }

    if (!title.trim() || !bodyText.trim()) {
      setMessage({ text: '❌ Fyll i titel och brödtext', type: MessageBarType.error });
      return;
    }

    if (excelData.length === 0) {
      setMessage({ text: '❌ Ladda upp Excel-fil med data först', type: MessageBarType.error });
      return;
    }

    setIsGenerating(true);
    setMessage(null);

    try {
      console.log(`🏭 Starting batch processing of ${excelData.length} documents...`);

      for (let rowIndex = 0; rowIndex < excelData.length; rowIndex++) {
        const row = excelData[rowIndex];
        
        console.log(`📄 Processing document ${rowIndex + 1}/${excelData.length}...`);

        // Prepare placeholders for this row
        const placeholders: IWordPlaceholders = {
          TITLE_PLACEHOLDER: title,
          BODY_PLACEHOLDER: bodyText
        };

        // Add QR code placeholders from Excel row
        const qrCodeData: { [key: string]: ArrayBuffer } = {};
        
        for (let qrIndex = 1; qrIndex <= 10; qrIndex++) {
          const urlKey = `URL_QR${qrIndex}` as keyof IExcelBatchRow;
          const titleKey = `TITLE_QR${qrIndex}` as keyof IExcelBatchRow;
          
          const url = row[urlKey];
          const titleText = row[titleKey];
          
          if (url && url.trim()) {
            placeholders[`QR_CODE_${qrIndex}`] = url;
            placeholders[`QR_TITLE_${qrIndex}`] = titleText || `QR Code ${qrIndex}`;
            
            // Generate QR code image for this URL using PROPER conversion
            try {
              const dataUrl = await QRCode.toDataURL(url, {
                width: qrSize * 8,
                margin: 2,
                color: { dark: '#000000', light: '#FFFFFF' },
                errorCorrectionLevel: 'M'
              });
              
              // PROPER base64 to ArrayBuffer conversion (same as generateQrCodeImages)
              const base64Data = dataUrl.split(',')[1]; // Remove data:image/png;base64, prefix
              const binaryString = atob(base64Data);
              const bytes = new Uint8Array(binaryString.length);
              for (let j = 0; j < binaryString.length; j++) {
                bytes[j] = binaryString.charCodeAt(j);
              }
              qrCodeData[`QR_CODE_${qrIndex}`] = bytes.buffer;
              
              console.log(`✅ Generated QR code for batch processing QR_CODE_${qrIndex}: ${url} (${bytes.buffer.byteLength} bytes)`);
              
            } catch (qrError) {
              console.error(`❌ Error generating QR code ${qrIndex} for document ${rowIndex + 1}:`, qrError);
            }
          }
        }

        // Process the Word document for this row
        const processedDocument = await templateManager.processUploadedDocument(
          uploadedFile,
          placeholders,
          qrCodeData,
          qrSize
        );

        // Download with sequential filename
        const fileName = `Document_${rowIndex + 1}_${new Date().getTime()}.docx`;
        saveAs(processedDocument, fileName);

        console.log(`✅ Document ${rowIndex + 1} generated: ${fileName}`);
        
        // Small delay to prevent overwhelming the browser
        if (rowIndex < excelData.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      setMessage({ 
        text: `🎉 Alla ${excelData.length} dokument har genererats och laddats ner!`, 
        type: MessageBarType.success 
      });

    } catch (error) {
      console.error('❌ Batch processing error:', error);
      setMessage({ 
        text: `❌ Fel vid batch-generering: ${error.message}`, 
        type: MessageBarType.error 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const processWordDocument = async (): Promise<void> => {
    if (!uploadedFile) {
      setMessage({ text: 'Please upload a Word document first', type: MessageBarType.error });
      return;
    }

    if (!title.trim()) {
      setMessage({ text: 'Please enter a title', type: MessageBarType.error });
      return;
    }

    if (!bodyText.trim()) {
      setMessage({ text: 'Please enter body text', type: MessageBarType.error });
      return;
    }

    const validQrCodes = qrCodes.filter(qr => qr.url.trim());
    if (validQrCodes.length === 0) {
      setMessage({ text: 'Please enter at least one QR code URL', type: MessageBarType.error });
      return;
    }

    setIsGenerating(true);
    setMessage(null);

    try {
      // Prepare placeholder data
      const placeholders: IWordPlaceholders = {
        TITLE_PLACEHOLDER: title,
        BODY_PLACEHOLDER: bodyText
      };

      // Add QR code placeholders
      for (let i = 0; i < validQrCodes.length; i++) {
        const qrCode = validQrCodes[i];
        placeholders[`QR_CODE_${i + 1}`] = qrCode.url;
        placeholders[`QR_TITLE_${i + 1}`] = qrCode.title || `QR Code ${i + 1}`;
      }

      console.log('📋 Placeholder data prepared:', placeholders);

      // Generate QR code images
      const qrImages = await generateQrCodeImages();

      // Process the uploaded Word document with placeholders
      const processedDocument = await templateManager.processUploadedDocument(
        uploadedFile,
        placeholders,
        qrImages,
        qrSize
      );

      // Download the processed document
      const fileName = `Processed_${uploadedFile.name.replace('.docx', '')}_${new Date().getTime()}.docx`;
      saveAs(processedDocument, fileName);

      setMessage({ 
        text: `Document "${fileName}" generated successfully!`, 
        type: MessageBarType.success 
      });

    } catch (error) {
      console.error('Error processing document:', error);
      setMessage({ 
        text: `Error processing document: ${error.message}`, 
        type: MessageBarType.error 
      });
    } finally {
      setIsGenerating(false);
    }
  };









  return (
    <section className={`${styles.qRskapare} ${props.hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.container}>
        <Text variant="xxLarge" className={styles.title}>
          QR Code Document Generator
        </Text>
        
        {message && (
          <MessageBar messageBarType={message.type} onDismiss={() => setMessage(null)}>
            {message.text}
          </MessageBar>
        )}

        <Stack tokens={{ childrenGap: 20 }}>
          {/* Mode Toggle */}
          <div style={{ padding: '15px', border: '1px solid #edebe9', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
            <Text variant="mediumPlus" style={{ marginBottom: '10px', display: 'block' }}>
              📋 Processing Mode
            </Text>
            <ChoiceGroup
              options={[
                { key: 'single', text: 'Single Document - Manual QR input' },
                { key: 'batch', text: 'Batch Processing - Excel data source' }
              ]}
              selectedKey={isBatchMode ? 'batch' : 'single'}
              onChange={(_, option: any) => setIsBatchMode(option?.key === 'batch')}
            />
          </div>

          {/* Batch Mode - Excel Upload Section */}
          {isBatchMode && (
            <div style={{ 
              border: '2px dashed #ff6b35', 
              borderRadius: '8px', 
              padding: '20px', 
              textAlign: 'center',
              backgroundColor: '#fff8f5'
            }}>
              <Text variant="large" style={{ marginBottom: '15px', display: 'block', color: '#ff6b35', fontWeight: 'bold' }}>
                📊 Excel Batch Processing
              </Text>
              
              <div style={{ marginBottom: '15px' }}>
                <DefaultButton
                  text="📥 Download Excel Template"
                  onClick={downloadExcelTemplate}
                  style={{ 
                    marginRight: '10px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none'
                  }}
                />
                <Text variant="small" style={{ display: 'block', marginTop: '10px', color: '#666' }}>
                  Download template with columns: URL_QR1, TITLE_QR1, ... URL_QR10, TITLE_QR10
                </Text>
              </div>

              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                style={{ 
                  padding: '10px', 
                  border: '1px solid #ff6b35', 
                  borderRadius: '4px',
                  backgroundColor: 'white'
                }}
              />
              
              {excelData.length > 0 && (
                <Text style={{ marginTop: '15px', color: '#4CAF50', fontWeight: 'bold' }}>
                  ✓ Excel loaded: {excelData.length} documents ready for processing
                </Text>
              )}
              
              {isProcessingExcel && (
                <div style={{ marginTop: '10px' }}>
                  <Spinner size={SpinnerSize.small} label="Processing Excel file..." />
                </div>
              )}
            </div>
          )}

          {/* Word Document Upload */}
          <div style={{ 
            border: '2px dashed #ccc', 
            borderRadius: '8px', 
            padding: '20px', 
            textAlign: 'center',
            backgroundColor: '#f9f9f9'
          }}>
            <Text variant="large" style={{ marginBottom: '10px', display: 'block' }}>
              📄 Upload Word Document
            </Text>
            <input
              type="file"
              accept=".docx"
              onChange={handleFileUpload}
              style={{ 
                padding: '10px', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                backgroundColor: 'white'
              }}
            />
            <Text variant="small" style={{ display: 'block', marginTop: '10px', color: '#666' }}>
              Upload a .docx file with placeholders: TITLE_PLACEHOLDER, BODY_PLACEHOLDER, QR_CODE_1, QR_TITLE_1, etc.
            </Text>
            {uploadedFile && (
              <Text style={{ marginTop: '10px', color: '#0078d4', fontWeight: 'bold' }}>
                ✓ File uploaded: {uploadedFile.name}
              </Text>
            )}
          </div>

          {/* Title Input */}
          <TextField
            label="Document Title"
            placeholder="Enter the document title"
            value={title}
            onChange={(_, newValue) => setTitle(newValue || '')}
            required
          />

          {/* Body Text Input */}
          <TextField
            label="Body Text"
            placeholder="Enter the main content for the document"
            value={bodyText}
            onChange={(_, newValue) => setBodyText(newValue || '')}
            multiline
            rows={4}
            required
          />

          {/* QR Codes Section - Single Mode Only */}
          {!isBatchMode && (
            <div style={{ border: '1px solid #edebe9', borderRadius: '4px', padding: '15px' }}>
              <Text variant="large" style={{ marginBottom: '15px', display: 'block' }}>
                🔗 QR Codes
              </Text>
              
              {qrCodes.map((qrCode) => (
                <Stack key={qrCode.id} horizontal tokens={{ childrenGap: 10 }} style={{ marginBottom: '10px' }}>
                  <TextField
                    label={`QR Code ${qrCode.id} URL`}
                    placeholder="Enter URL for QR code"
                    value={qrCode.url}
                    onChange={(_, newValue) => updateQrCode(qrCode.id, 'url', newValue || '')}
                    style={{ flex: 2 }}
                  />
                  <TextField
                    label={`QR Code ${qrCode.id} Title`}
                    placeholder="Enter title/description"
                    value={qrCode.title}
                    onChange={(_, newValue) => updateQrCode(qrCode.id, 'title', newValue || '')}
                    style={{ flex: 1 }}
                  />
                  {qrCodes.length > 1 && (
                    <DefaultButton
                      text="Remove"
                      onClick={() => removeQrCode(qrCode.id)}
                      style={{ alignSelf: 'end', marginBottom: '4px' }}
                    />
                  )}
                </Stack>
              ))}
              
              <DefaultButton
                text="+ Add QR Code"
                onClick={addQrCode}
                style={{ marginTop: '10px' }}
              />
            </div>
          )}

          {/* QR Code Size Slider */}
          <div>
            <Text>QR Code Size: {qrSize}mm</Text>
            <Slider
              min={25}
              max={100}
              step={5}
              value={qrSize}
              onChange={(value) => setQrSize(value)}
            />
          </div>

          {/* Generate Button - Company Green */}
          <PrimaryButton
            text={isGenerating ? "Processing..." : (isBatchMode ? "Generate Batch Documents" : "Send")}
            onClick={isBatchMode ? processBatchDocuments : processWordDocument}
            disabled={
              isGenerating || 
              !uploadedFile || 
              !title.trim() || 
              !bodyText.trim() || 
              (isBatchMode && excelData.length === 0)
            }
            style={{ 
              backgroundColor: '#4CAF50', 
              border: 'none',
              fontSize: '16px',
              padding: '12px 24px',
              fontWeight: 'bold'
            }}
          />
          
          {isGenerating && (
            <div>
              <Spinner size={SpinnerSize.medium} label={
                isBatchMode 
                  ? `Processing batch documents... This may take a while.`
                  : "Processing document..."
              } />
              {isBatchMode && (
                <Text variant="small" style={{ marginTop: '10px', color: '#666', textAlign: 'center' }}>
                  Generating {excelData.length} documents. Each document will download automatically.
                </Text>
              )}
            </div>
          )}
        </Stack>
      </div>
    </section>
  );
};

export default QRskapare;
