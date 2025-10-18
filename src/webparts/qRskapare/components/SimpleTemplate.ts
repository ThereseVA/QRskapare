// Absolute simplest solution - show template text directly in webpart
export const getGustafKlinikenTemplate = (): string => {
  return `
╔══════════════════════════════════════════════════════════════════════════════╗
║                                GUSTAF KLINIKEN                              ║
║                            Kvalitet • Omsorg • Trygghet                     ║
╚══════════════════════════════════════════════════════════════════════════════╝

📋 DOKUMENTMALL
═══════════════

👤 PATIENTINFORMATION:
━━━━━━━━━━━━━━━━━━━━━━
Namn: ________________________________
Personnummer: ________________________
Adress: ______________________________
       ______________________________
Telefon: _____________________________
E-post: ______________________________

📅 BESÖKSINFORMATION:
━━━━━━━━━━━━━━━━━━━━━━
Datum: _______________________________
Tid: _________________________________
Läkare/Personal: _____________________
Avdelning: ___________________________

📝 ANTECKNINGAR:
━━━━━━━━━━━━━━━━
__________________________________________________________________
__________________________________________________________________
__________________________________________________________________
__________________________________________________________________
__________________________________________________________________
__________________________________________________________________

🔬 ÅTGÄRDER/BEHANDLING:
━━━━━━━━━━━━━━━━━━━━━━━
__________________________________________________________________
__________________________________________________________________
__________________________________________________________________

📞 UPPFÖLJNING:
━━━━━━━━━━━━━━━
Nästa besök: _________________________
Datum: _______________________________
Tid: _________________________________
Kommentarer: _________________________
____________________________________

═══════════════════════════════════════════════════════════════════════════════
🏥 GUSTAF KLINIKEN
📞 Telefon: 08-123 456 78
📧 E-post: info@gustafkliniken.se
🌐 Webb: www.gustafkliniken.se

© ${new Date().getFullYear()} Gustaf Kliniken - Alla rättigheter förbehållna
═══════════════════════════════════════════════════════════════════════════════
  `.trim();
};

// Even simpler - just copy to clipboard
export const copyGustafTemplateToClipboard = async (): Promise<boolean> => {
  try {
    const template = getGustafKlinikenTemplate();
    await navigator.clipboard.writeText(template);
    return true;
  } catch (error) {
    console.error('Could not copy to clipboard:', error);
    return false;
  }
};