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