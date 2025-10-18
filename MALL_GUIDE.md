# 📄 GUIDE: Skapa Word-Mallar för QRskapare

## 🎨 Så här skapar du perfekta mallar:

### **1. Skapa din Word-mall (.docx):**

1. **Öppna Microsoft Word**
2. **Designa din mall** med:
   - Headers och footers
   - Loggor och bilder
   - Färger och typsnitt
   - Tabeller och layout
   - Gustaf Kliniken branding

### **2. Lägg till placeholders:**

Använd dessa exakta placeholders där du vill ha dynamisk data:

```
{{QR_CODE}}           - QR-kod bild (150x150px)
{{QR_TEXT}}           - Texten som QR-koden innehåller
{{CUSTOM_TITLE}}      - Titel från webpart
{{CUSTOM_TEXT}}       - Text från webpart
{{PATIENT_NAME}}      - Patientnamn (om ifyllt)
{{DATE}}              - Dagens datum
{{TIME}}              - Aktuell tid
```

### **3. Exempel på mallstruktur:**

```
╔══════════════════════════════════════════════════════════════╗
║  [LOGGA]              GUSTAF KLINIKEN              [LOGGA]  ║
║                    Kvalitet • Omsorg • Trygghet             ║
╚══════════════════════════════════════════════════════════════╝

Datum: {{DATE}}                              Tid: {{TIME}}

📋 {{CUSTOM_TITLE}}
════════════════════════════════════════════════════════════════

QR-KOD INFORMATION:
┌─────────────────────┐
│                     │    QR-kod innehåll:
│     {{QR_CODE}}     │    {{QR_TEXT}}
│                     │    
└─────────────────────┘

PATIENTINFORMATION:
══════════════════════════════════════════════════════════════
Patient: {{PATIENT_NAME}}

ANTECKNINGAR:
══════════════════════════════════════════════════════════════
{{CUSTOM_TEXT}}


═══════════════════════════════════════════════════════════════
            📞 08-123 456 78 • 🌐 www.gustafkliniken.se
               © 2025 Gustaf Kliniken - Alla rättigheter
═══════════════════════════════════════════════════════════════
```

### **4. Spara mallen:**

- **Filnamn:** `GustavKliniken_Mall.docx`
- **Format:** Word Document (.docx)
- **Placering:** Ladda upp via webpart

### **5. Flera mallar:**

Du kan skapa olika mallar för olika ändamål:
- `PatientJournal_Mall.docx`
- `Recept_Mall.docx`
- `Remiss_Mall.docx`
- `Intyg_Mall.docx`

Varje mall behåller sin unika design och formatering!