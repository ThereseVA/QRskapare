// Gustaf Kliniken Template Processor med font och size-kontroll
export interface TemplateOptions {
  qrText: string;
  qrCodeBase64?: string;           // Base64 QR-kod bild
  customTitle: string;             // Titel för custom section
  customText: string;              // Text för custom section
  patientName?: string;
  
  // Font och storlek-inställningar
  titleSize?: number;              // Storlek på titel (px) - default 24
  titleFont?: string;              // Font för titel - default 'Arial Black'
  textSize?: number;               // Storlek på text (px) - default 16  
  textFont?: string;               // Font för text - default 'Arial'
}

export const processGustafTemplate = (options: TemplateOptions): string => {
  // Default värden
  const defaults = {
    titleSize: 24,
    titleFont: 'Arial Black, sans-serif',
    textSize: 16,
    textFont: 'Arial, sans-serif',
    patientName: '________________________'
  };
  
  const config = { ...defaults, ...options };
  
  // HTML template (förenklade placeholders)
  const template = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Gustaf Kliniken Mall</title>
    <style>
        @page { size: A4; margin: 20mm; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: white; color: #333; }
        .header { text-align: center; border: 3px solid #2E5090; padding: 20px; margin-bottom: 30px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); }
        .clinic-name { font-size: 32px; font-weight: bold; color: #2E5090; margin: 0; letter-spacing: 2px; }
        .clinic-motto { font-size: 16px; color: #666; margin: 10px 0 0 0; font-style: italic; }
        .content { max-width: 100%; margin: 0 auto; }
        .qr-section { display: flex; align-items: center; margin: 30px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #f8f9fa; }
        .qr-code { width: 150px; height: 150px; border: 2px solid #2E5090; margin-right: 30px; display: flex; align-items: center; justify-content: center; background: white; font-size: 12px; color: #666; }
        .qr-info { flex: 1; }
        .qr-text { font-size: 14px; color: #666; margin: 0; word-break: break-word; }
        .custom-section { margin: 30px 0; padding: 20px; border-left: 4px solid #2E5090; background: #f8f9fa; }
        .custom-title { font-size: ${config.titleSize}px; font-family: ${config.titleFont}; font-weight: bold; color: #2E5090; margin: 0 0 15px 0; line-height: 1.2; }
        .custom-text { font-size: ${config.textSize}px; font-family: ${config.textFont}; color: #333; line-height: 1.6; margin: 0; white-space: pre-wrap; }
        .patient-info { margin: 30px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .info-row { margin: 10px 0; font-size: 14px; }
        .info-label { font-weight: bold; color: #2E5090; display: inline-block; width: 150px; }
        .footer { text-align: center; margin-top: 50px; padding: 20px; border-top: 2px solid #2E5090; font-size: 12px; color: #666; }
        .contact-info { margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="clinic-name">GUSTAF KLINIKEN</h1>
        <p class="clinic-motto">Kvalitet • Omsorg • Trygghet</p>
    </div>
    
    <div class="content">
        <div class="info-row">
            <span class="info-label">Datum:</span> ${new Date().toLocaleDateString('sv-SE')}
        </div>
        
        <div class="qr-section">
            <div class="qr-code">
                ${config.qrCodeBase64 ? `<img src="data:image/png;base64,${config.qrCodeBase64}" style="max-width: 140px; max-height: 140px;">` : 'QR-kod'}
            </div>
            <div class="qr-info">
                <p><strong>QR-kod innehåll:</strong></p>
                <p class="qr-text">${config.qrText}</p>
            </div>
        </div>
        
        <div class="custom-section">
            <h2 class="custom-title">${config.customTitle}</h2>
            <div class="custom-text">${config.customText}</div>
        </div>
        
        <div class="patient-info">
            <h3 style="color: #2E5090; margin-top: 0;">Patientinformation</h3>
            <div class="info-row">
                <span class="info-label">Namn:</span> ${config.patientName}
            </div>
            <div class="info-row">
                <span class="info-label">Personnummer:</span> ________________________
            </div>
            <div class="info-row">
                <span class="info-label">Telefon:</span> ________________________
            </div>
        </div>
    </div>
    
    <div class="footer">
        <div class="contact-info">🏥 <strong>Gustaf Kliniken</strong></div>
        <div class="contact-info">📞 Telefon: 08-123 456 78 • 📧 E-post: info@gustafkliniken.se • 🌐 Webb: www.gustafkliniken.se</div>
        <div class="contact-info">© ${new Date().getFullYear()} Gustaf Kliniken - Alla rättigheter förbehållna</div>
    </div>
</body>
</html>`;

  return template;
};

// Exempel på användning med olika font och storlekar:
export const createGustafTemplate = (
  qrText: string, 
  title: string, 
  text: string, 
  options?: Partial<TemplateOptions>
): string => {
  return processGustafTemplate({
    qrText,
    customTitle: title,
    customText: text,
    ...options
  });
};