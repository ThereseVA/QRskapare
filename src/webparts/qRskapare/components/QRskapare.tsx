import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './QRskapare.module.scss';
import type { IQRskapareProps } from './IQRskapareProps';
import { 
  TextField, 
  PrimaryButton,
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
import { Document, Packer, Paragraph, ImageRun, TextRun, HeadingLevel } from 'docx';

// Template definitions with Swedish and English placeholders
interface ITemplate {
  id: string;
  name: string;
  content: string;
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
  const [url, setUrl] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [headerText, setHeaderText] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('basic');
  const [selectedFont, setSelectedFont] = useState<string>('Segoe UI');
  const [headerFontSize, setHeaderFontSize] = useState<number>(24);
  const [bodyFontSize, setBodyFontSize] = useState<number>(14);
  const [createWordVersion, setCreateWordVersion] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: MessageBarType } | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Generate QR code preview
  useEffect(() => {
    if (url.trim()) {
      QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      .then(dataUrl => {
        setQrCodeDataUrl(dataUrl);
      })
      .catch(err => {
        console.error('QR Code generation error:', err);
      });
    } else {
      setQrCodeDataUrl('');
    }
  }, [url]);

  const getCurrentTemplate = (): ITemplate => {
    return templates.find(t => t.id === selectedTemplate) || templates[0];
  };

  const processTemplate = (template: string, header: string, body: string): string => {
    return template
      .replace(/HEADER HERE|RUBRIK HÄR/gi, header)
      .replace(/TEXT HERE|TEXT HÄR/gi, body);
  };

  const generatePDF = async (): Promise<void> => {
    const template = getCurrentTemplate();
    const processedContent = processTemplate(template.content, headerText, text);
    
    // Generate high-quality QR code for PDF
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

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
      
      if (line.includes('QR CODE HERE') || line.includes('QR KOD HÄR')) {
        // Add QR code
        pdf.addImage(qrDataUrl, 'PNG', 20, yPosition, 50, 50);
        yPosition += 60;
      } else {
        // Determine if this is a header line
        const isHeader = line === headerText || 
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

  const generateWord = async (): Promise<void> => {
    const template = getCurrentTemplate();
    const processedContent = processTemplate(template.content, headerText, text);
    
    // Generate QR code as data URL and convert to buffer for Word
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2
    });
    
    // Convert data URL to buffer
    const response = await fetch(qrDataUrl);
    const qrBuffer = await response.arrayBuffer();

    const paragraphs: Paragraph[] = [];
    const lines = processedContent.split('\n');
    
    for (const line of lines) {
      if (line.trim() === '') {
        paragraphs.push(new Paragraph({}));
        continue;
      }
      
      if (line.includes('QR CODE HERE') || line.includes('QR KOD HÄR')) {
        // Add QR code
        paragraphs.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: new Uint8Array(qrBuffer),
                transformation: {
                  width: 200,
                  height: 200,
                },
                type: 'png'
              }),
            ],
          })
        );
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

  const handleGenerate = async (): Promise<void> => {
    if (!url.trim()) {
      setMessage({ text: 'Please enter a URL / Vänligen ange en URL', type: MessageBarType.error });
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
      await generatePDF();
      
      // Generate Word document if requested
      if (createWordVersion) {
        await generateWord();
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
          {/* URL Input */}
          <TextField
            label="URL"
            placeholder="Enter URL to encode in QR code / Ange URL att koda i QR-kod"
            value={url}
            onChange={(_, newValue) => setUrl(newValue || '')}
            required
          />

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

          <Stack horizontal tokens={{ childrenGap: 20 }}>
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
          </Stack>

          {/* Create Word Version Option */}
          <Checkbox
            label="Also create editable Word document / Skapa även redigerbart Word-dokument"
            checked={createWordVersion}
            onChange={(_, checked) => setCreateWordVersion(checked || false)}
          />

          {/* QR Code Preview */}
          {qrCodeDataUrl && (
            <div className={styles.preview}>
              <Text variant="large">QR Code Preview / QR-kod förhandsvisning:</Text>
              <img src={qrCodeDataUrl} alt="QR Code Preview" className={styles.qrPreview} />
            </div>
          )}

          {/* Template Preview */}
          {headerText && text && (
            <div className={styles.templatePreview}>
              <Text variant="large">Template Preview / Mallförhandsvisning:</Text>
              <div className={styles.previewContent} style={{ fontFamily: selectedFont }}>
                <pre>{processTemplate(getCurrentTemplate().content, headerText, text)}</pre>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <PrimaryButton
              text={isGenerating ? "Generating... / Genererar..." : "Generate Documents / Generera dokument"}
              onClick={handleGenerate}
              disabled={isGenerating || !url.trim() || !text.trim() || !headerText.trim()}
            />
            {isGenerating && <Spinner size={SpinnerSize.medium} />}
          </Stack>
        </Stack>
      </div>
    </section>
  );
};

export default QRskapare;
