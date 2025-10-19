import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';

// Template interface för komponenten
export interface ITemplate {
  id: string;
  name: string;
  file: ArrayBuffer;
}

// Utökad placeholder data structure för numrerade QR-koder
export interface TemplateData {
  CUSTOM_TITLE: string;
  CUSTOM_TEXT: string;
  QR_CODE_1?: string;
  QR_TEXT_1?: string;
  QR_CODE_2?: string; 
  QR_TEXT_2?: string;
  QR_CODE_3?: string;
  QR_TEXT_3?: string;
  QR_CODE_4?: string;
  QR_TEXT_4?: string;
  QR_CODE_5?: string;
  QR_TEXT_5?: string;
  // Lägg till fler vid behov...
}

// Legacy interface för bakåtkompatibilitet
export interface WordTemplateOptions {
  qrText: string;
  customTitle: string;
  customText: string;
  patientName?: string;
  qrCodeBase64?: string;
}

export interface TemplateFile {
  name: string;
  displayName: string;
  file: ArrayBuffer;
}

// Template manager för React komponenten
export class TemplateManager {
  private templates: Map<string, ITemplate> = new Map();

  async uploadTemplate(file: File): Promise<ITemplate> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const arrayBuffer = event.target.result as ArrayBuffer;
          const templateId = Date.now().toString(); // Simple ID generation
          const template: ITemplate = {
            id: templateId,
            name: file.name,
            file: arrayBuffer
          };
          
          this.templates.set(templateId, template);
          resolve(template);
        } else {
          reject(new Error('Kunde inte läsa fil'));
        }
      };
      
      reader.onerror = () => reject(new Error('Fel vid filläsning'));
      reader.readAsArrayBuffer(file);
    });
  }

  async processTemplate(templateId: string, placeholderData: Record<string, string>): Promise<Blob> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error('Mall kunde inte hittas');
    }

    try {
      console.log('🔄 Processing Word template with placeholder replacement...');
      
      // Läs docx fil som ZIP (Word-filer är ZIP-arkiv)
      const zip = new JSZip();
      const docxZip = await zip.loadAsync(template.file);
      
      // Hämta document.xml som innehåller huvudtexten
      const documentXml = docxZip.file('word/document.xml');
      if (!documentXml) {
        throw new Error('Kunde inte hitta document.xml i Word-filen');
      }
      
      let xmlContent = await documentXml.async('text');
      console.log('📄 XML content loaded, processing placeholders...');
      
      // Process alla placeholders
      for (const [key, value] of Object.entries(placeholderData)) {
        const placeholder = `{${key}}`;
        
        if (key.startsWith('QR_CODE_') && value) {
          // För nu ersätter vi QR-kod placeholders med [QR: URL] format
          // TODO: Implementera faktisk QR-kod bild insertion senare
          console.log(`🔳 Processing QR code placeholder ${key}: ${value}`);
          
          const qrPlaceholderText = `[QR-KOD: ${value}]`;
          const escapedValue = this.escapeXmlText(qrPlaceholderText);
          
          xmlContent = xmlContent.replace(
            new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), 
            escapedValue
          );
          
          console.log(`✅ QR code placeholder ${key} replaced with text format`);
          
        } else if (value) {
          // Detta är en text placeholder
          const escapedValue = this.escapeXmlText(value);
          xmlContent = xmlContent.replace(
            new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), 
            escapedValue
          );
          console.log(`✅ Replaced text ${placeholder} with: ${value}`);
        }
      }
      
      // Uppdatera document.xml
      docxZip.file('word/document.xml', xmlContent);
      
      // Generera nytt docx-arkiv
      const newDocxBuffer = await docxZip.generateAsync({
        type: 'arraybuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
      
      console.log('✅ Word template processed successfully with placeholder replacement!');
      console.log('ℹ️ QR codes shown as text format - image insertion coming in next iteration');
      
      return new Blob([newDocxBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
    } catch (error) {
      console.error('❌ Fel vid docx processing:', error);
      
      // Fallback: returnera original fil utan placeholder replacement
      console.warn('⚠️ Fallback: returnerar original fil utan placeholder replacement');
      
      return new Blob([template.file], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
    }
  }

  // Process uploaded document with placeholders and QR codes
  async processUploadedDocument(
    file: File, 
    placeholders: Record<string, string>, 
    qrImages: { [key: string]: ArrayBuffer },
    qrSize: number
  ): Promise<Blob> {
    try {
      console.log('🚀 WordTemplateManager v2.1 - DEBUGGING PLACEHOLDER ISSUE');
      console.log('Processing uploaded Word document with placeholders...');
      
      // Read the uploaded file
      const arrayBuffer = await file.arrayBuffer();
      
      // Load docx as ZIP
      const zip = new JSZip();
      const docxZip = await zip.loadAsync(arrayBuffer);
      
      // Get document.xml
      const documentXml = docxZip.file('word/document.xml');
      if (!documentXml) {
        throw new Error('Could not find document.xml in Word file');
      }
      
      let xmlContent = await documentXml.async('text');
      console.log('Processing placeholders...');

      // Debug: Log the XML content around QR placeholders
      if (xmlContent.includes('{{QR_CODE_1}}')) {
        const qrPosition = xmlContent.indexOf('{{QR_CODE_1}}');
        const context = xmlContent.substring(Math.max(0, qrPosition - 100), qrPosition + 200);
        console.log('🔍 Found {{QR_CODE_1}} placeholder in XML context:', context);
      } else {
        console.log('❌ {{QR_CODE_1}} placeholder NOT FOUND in XML');
        // Check for other possible formats
        if (xmlContent.includes('QR_CODE_1')) {
          console.log('🔍 But found QR_CODE_1 text somewhere in XML');
        }
      }

      // CRITICAL: Ensure document has all required namespaces for images
      if (!xmlContent.includes('xmlns:wp=')) {
        // Add missing namespace declarations to the document root element
        xmlContent = xmlContent.replace(
          '<w:document',
          '<w:document xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
        );
        console.log('✅ Added missing XML namespaces for image support');
      }

      // Track relationships for images
      let relationshipCounter = 1000; // Start high to avoid conflicts

      // Get existing relationships and find the highest ID
      let relationshipsXml = '';
      const relationshipsFile = docxZip.file('word/_rels/document.xml.rels');
      if (relationshipsFile) {
        relationshipsXml = await relationshipsFile.async('text');
        
        // Find highest existing relationship ID to avoid conflicts
        const existingIds = relationshipsXml.match(/Id="rId(\d+)"/g);
        if (existingIds) {
          const maxId = Math.max(...existingIds.map(id => {
            const match = id.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          }));
          relationshipCounter = maxId + 1;
          console.log(`📋 Found existing relationships, starting from rId${relationshipCounter}`);
        }
      } else {
        // Create basic relationships file if it doesn't exist
        relationshipsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;
        console.log('📋 Created new relationships file');
      }

      // Process all placeholders with proper format
      for (const [key, value] of Object.entries(placeholders)) {
        if (value) {
          console.log(`Processing placeholder ${key}: ${value}`);
          
          let replacementValue: string;
          
          if (key.startsWith('QR_CODE_') && qrImages[key]) {
            // PROPER QR CODE IMAGE EMBEDDING
            console.log(`Embedding QR code image for ${key}`);
            
            try {
              // Generate unique IDs
              const imageId = `qr_${key.toLowerCase().replace('qr_code_', '')}`;
              const relationshipId = `rId${relationshipCounter++}`;
              const imageName = `${imageId}.png`;
              
              // Add image to media folder in ZIP
              // Ensure media directory structure exists
              const mediaPath = `word/media/${imageName}`;
              docxZip.file(mediaPath, qrImages[key]);
              
              console.log(`📁 Added image to ZIP: ${mediaPath} (${qrImages[key].byteLength} bytes)`);
              
              // Add relationship for the image
              const imageRelationship = `  <Relationship Id="${relationshipId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${imageName}"/>`;
              
              // Insert relationship before closing tag
              relationshipsXml = relationshipsXml.replace(
                '</Relationships>',
                `${imageRelationship}\n</Relationships>`
              );
              
              console.log(`🔗 Added relationship: ${relationshipId} -> media/${imageName}`);
              
              // Calculate image size in EMU (English Metric Units: 1 inch = 914400 EMU)
              // Convert mm to inches, then to EMU
              const sizeInInches = qrSize / 25.4; // mm to inches
              const sizeInEmu = Math.round(sizeInInches * 914400);
              
              console.log(`📏 Image size: ${qrSize}mm = ${sizeInInches}"= ${sizeInEmu} EMU`);
              
              // Create proper Word image XML with complete OOXML structure
              const docPrId = relationshipId.replace('rId', ''); // Use relationship number as ID
              
              const imageXml = `<w:p>
  <w:r>
    <w:drawing>
      <wp:inline distT="0" distB="0" distL="0" distR="0">
        <wp:extent cx="${sizeInEmu}" cy="${sizeInEmu}"/>
        <wp:effectExtent l="0" t="0" r="0" b="0"/>
        <wp:docPr id="${docPrId}" name="${imageName}"/>
        <wp:cNvGraphicFramePr>
          <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
        </wp:cNvGraphicFramePr>
        <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:nvPicPr>
                <pic:cNvPr id="${docPrId}" name="${imageName}"/>
                <pic:cNvPicPr/>
              </pic:nvPicPr>
              <pic:blipFill>
                <a:blip r:embed="${relationshipId}"/>
                <a:stretch>
                  <a:fillRect/>
                </a:stretch>
              </pic:blipFill>
              <pic:spPr>
                <a:xfrm>
                  <a:off x="0" y="0"/>
                  <a:ext cx="${sizeInEmu}" cy="${sizeInEmu}"/>
                </a:xfrm>
                <a:prstGeom prst="rect">
                  <a:avLst/>
                </a:prstGeom>
              </pic:spPr>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>
  </w:r>
</w:p>`;
              
              replacementValue = imageXml;
              
              console.log(`🖼️ Created Word image XML for ${key} -> ${imageName}`);
              
            } catch (imageError) {
              console.error('❌ Error embedding QR image:', imageError);
              // Fallback to text representation
              replacementValue = `[QR-CODE: ${value} - Image embedding failed]`;
            }
            
          } else if (key.startsWith('QR_TITLE_')) {
            // For QR titles, add prefix for better visibility
            replacementValue = `QR: ${value}`;
          } else {
            replacementValue = this.escapeXmlText(value);
          }
          
          // Replace placeholder in XML content
          // For images, use a simple but effective replacement
          if (key.startsWith('QR_CODE_') && qrImages[key]) {
            // Use {{}} format like in the Word document
            const placeholderPattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            xmlContent = xmlContent.replace(placeholderPattern, replacementValue);
            console.log(`🖼️ Replaced QR code placeholder {{${key}}} with image XML`);
          } else {
            // For text placeholders, use {{}} format
            const placeholderPattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            xmlContent = xmlContent.replace(placeholderPattern, replacementValue);
            console.log(`📝 Replaced text placeholder {{${key}}} with: ${value.substring(0, 50)}...`);
          }
        }
      }
      
      // Update the document.xml in the ZIP
      docxZip.file('word/document.xml', xmlContent);
      
      // Update the relationships file
      docxZip.file('word/_rels/document.xml.rels', relationshipsXml);
      
      // Ensure Content_Types.xml includes PNG images
      let contentTypesXml = '';
      const contentTypesFile = docxZip.file('[Content_Types].xml');
      if (contentTypesFile) {
        contentTypesXml = await contentTypesFile.async('text');
        // Add PNG default if not present
        if (!contentTypesXml.includes('Extension="png"')) {
          contentTypesXml = contentTypesXml.replace(
            '</Types>',
            '  <Default Extension="png" ContentType="image/png"/>\n</Types>'
          );
          docxZip.file('[Content_Types].xml', contentTypesXml);
        }
      }
      
      // Generate the updated docx file
      const updatedDocx = await docxZip.generateAsync({ type: 'blob' });
      console.log('✅ Document processing completed successfully with embedded images');
      
      return updatedDocx;
      
    } catch (error) {
      console.error('❌ Error processing document:', error);
      throw new Error(`Error processing document: ${error.message}`);
    }
  }

  // Hjälpfunktion för att escape XML text
  private escapeXmlText(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

// Template manager för att hantera uppladdade mallar
export class WordTemplateManager {
  private templates: Map<string, TemplateFile> = new Map();

  // Lägg till mall
  addTemplate(name: string, displayName: string, file: ArrayBuffer): void {
    this.templates.set(name, {
      name,
      displayName,
      file
    });
  }

  // Hämta alla mallar
  getTemplates(): TemplateFile[] {
    return Array.from(this.templates.values());
  }

  // Hämta specifik mall
  getTemplate(name: string): TemplateFile | undefined {
    return this.templates.get(name);
  }

  // Processera mall med data
  async processTemplate(templateName: string, options: WordTemplateOptions): Promise<Blob> {
    const template = this.getTemplate(templateName);
    if (!template) {
      throw new Error(`Mall "${templateName}" hittades inte`);
    }

    try {
      // Konvertera ArrayBuffer till bearbetbar text för enkel ersättning
      // För riktig Word-processing skulle vi använda docx-library
      const decoder = new TextDecoder('utf-8');
      let content = decoder.decode(template.file);

      // Ersätt placeholders med verklig data
      const replacements = {
        '{{QR_CODE}}': options.qrCodeBase64 
          ? `[QR-KOD: ${options.qrText}]` 
          : '[QR-KOD]',
        '{{QR_TEXT}}': options.qrText,
        '{{CUSTOM_TITLE}}': options.customTitle,
        '{{CUSTOM_TEXT}}': options.customText,
        '{{PATIENT_NAME}}': options.patientName || '________________________',
        '{{DATE}}': new Date().toLocaleDateString('sv-SE'),
        '{{TIME}}': new Date().toLocaleTimeString('sv-SE', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };

      // Utför ersättningar
      Object.entries(replacements).forEach(([placeholder, value]) => {
        const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
        content = content.replace(regex, value);
      });

      // Returnera som blob med korrekt MIME-type för Word
      const encoder = new TextEncoder();
      const processedBuffer = encoder.encode(content);
      
      return new Blob([processedBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

    } catch (error) {
      throw new Error(`Fel vid bearbetning av mall: ${error.message}`);
    }
  }
}

// Global template manager instance
export const templateManager = new WordTemplateManager();

// Hjälpfunktion för att ladda upp mall-fil
export const uploadTemplate = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        const arrayBuffer = event.target.result as ArrayBuffer;
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Ta bort filändelse
        const displayName = fileName.replace(/_/g, ' '); // Ersätt _ med mellanslag
        
        templateManager.addTemplate(fileName, displayName, arrayBuffer);
        resolve(fileName);
      } else {
        reject(new Error('Kunde inte läsa fil'));
      }
    };
    
    reader.onerror = () => reject(new Error('Fel vid filläsning'));
    reader.readAsArrayBuffer(file);
  });
};

// Generera dokument från mall
export const generateDocumentFromTemplate = async (
  templateName: string, 
  options: WordTemplateOptions
): Promise<void> => {
  try {
    const processedDoc = await templateManager.processTemplate(templateName, options);
    const fileName = `${templateName}_${new Date().toISOString().split('T')[0]}.docx`;
    
    saveAs(processedDoc, fileName);
  } catch (error) {
    throw new Error(`Kunde inte generera dokument: ${error.message}`);
  }
};