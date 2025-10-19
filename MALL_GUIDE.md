# 📄 GUIDE: Skapa Word-Mallar för QRskapare

## � **VIKTIGT: Systemet bevarar ALL formatering!**

### ✅ **Vad som bevaras:**
- �🎨 **Headers & Footers** - Sidhuvuden och sidfötter
- 🖼️ **Loggor & Bilder** - Alla bilder bevaras exakt
- 🎨 **Fonts & Färger** - All textformatering bibehålls
- 📐 **Layout & Tabeller** - Struktur förändras inte
- 🏢 **Företagsdesign** - Din branding är säker

### ❌ **Vad som ERSÄTTS:**
- Endast text inom `{PLACEHOLDER}` ersätts
- Allt annat förblir exakt som du designat

---

## 🎨 Så här skapar du perfekta mallar:

### **1. Skapa din Word-mall (.docx):**

1. **Öppna Microsoft Word**
2. **Designa din mall EXAKT** som du vill att slutdokumentet ska se ut:
   - Headers och footers med loggor
   - Färger och typsnitt som passar Gustaf Kliniken
   - Tabeller och layout
   - Företagets branding och styling

### **2. Lägg till placeholders:**

Använd dessa exakta placeholders där du vill ha dynamisk data:

**Grundläggande placeholders:**
```
{CUSTOM_TITLE}      - Titel från webpart
{CUSTOM_TEXT}       - Text från webpart
```

**Numrerade QR-kod placeholders (1-5 st):**
```
{QR_CODE_1}         - Första QR-koden (faktisk QR-kod bild)
{QR_TEXT_1}         - Beskrivande text för första QR-koden

{QR_CODE_2}         - Andra QR-koden (faktisk QR-kod bild)  
{QR_TEXT_2}         - Beskrivande text för andra QR-koden

{QR_CODE_3}         - Tredje QR-koden (faktisk QR-kod bild)
{QR_TEXT_3}         - Beskrivande text för tredje QR-koden

...och så vidare upp till QR_CODE_5/QR_TEXT_5
```

**VIKTIGT:** 
- `{QR_CODE_X}` ersätts med **faktisk QR-kod bild** (inte URL-text)
- `{QR_TEXT_X}` ersätts med beskrivande text om QR-koden
- Numren 1-5 motsvarar URL-fälten i webpart (URL 1 → QR_CODE_1, etc.)

**OBS:** Använd `{PLACEHOLDER}` - INTE `{{PLACEHOLDER}}`

### **3. Exempel på mallstruktur:**

```
GUSTAF KLINIKEN
Rubrik: {CUSTOM_TITLE}

Beskrivning: {CUSTOM_TEXT}

=== QR-KODER ===

Första QR-koden:
{QR_CODE_1}
{QR_TEXT_1}

Andra QR-koden:  
{QR_CODE_2}
{QR_TEXT_2}

Tredje QR-koden:
{QR_CODE_3}
{QR_TEXT_3}

Kontakta oss: info@gustafkliniken.se
```

**Resultat efter processing:**
```
GUSTAF KLINIKEN  
Rubrik: Patientinformation

Beskrivning: QR-koder för snabb åtkomst

=== QR-KODER ===

Första QR-koden:
[■■■■■■■■■] <- Faktisk QR-kod bild
[■■■■■■■■■]    (inte URL-text)
[■■■■■■■■■]
QR-kod 1: https://gustafkliniken.se/patient/123

Andra QR-koden:
[■■■■■■■■■] <- Faktisk QR-kod bild  
[■■■■■■■■■]
[■■■■■■■■■]
QR-kod 2: tel:+46812345678

Tredje QR-koden:
[■■■■■■■■■] <- Faktisk QR-kod bild
[■■■■■■■■■]
[■■■■■■■■■]  
QR-kod 3: mailto:info@gustafkliniken.se

Kontakta oss: info@gustafkliniken.se
```

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