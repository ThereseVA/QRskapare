# Assets - Gustaf Kliniken QR Generator

## DOTX Mall

Placera din Gustaf Kliniken DOTX-mall här:

**Filnamn:** `gustaf-kliniken-mall.dotx`

### Instruktioner:

1. **Skapa din DOTX-mall** i Microsoft Word
2. **Använd platshållare** som:
   - `{header}` - För huvudrubrik
   - `{body}` - För brödtext
   - `{date}` - För dagens datum
   - `{qrCodes[0].title}` - Titel för första QR-koden
   - `{qrCodes[0].url}` - URL för första QR-koden
   - `{qrCodes[1].title}` - Titel för andra QR-koden
   - `{qrCodes[1].url}` - URL för andra QR-koden
   - ...och så vidare upp till 5 QR-koder

3. **Spara som DOTX** (Word-mall format)
4. **Ladda upp filen** här med namnet `gustaf-kliniken-mall.dotx`
5. **Bygg om projektet** med `npm run build`

### QR-kod platshållare exempel:

```
{header}

{body}

QR-kod 1: {qrCodes[0].title}
URL: {qrCodes[0].url}

QR-kod 2: {qrCodes[1].title}  
URL: {qrCodes[1].url}

Datum: {date}
```

### När filen är uppladdad:

Användare kan välja "🏥 Gustaf Kliniken Officiell Mall (DOTX)" från dropdown-menyn för att använda din officiella mall med exakt formatering bevarad!