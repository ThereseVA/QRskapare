# Excel Import Format for QR Code Generator

## 🔧 Excel File Configuration Options

The solution automatically detects whether your Excel file has headers or not!

### **Option 1: With Headers (Recommended)**
```
| URL1                    | URL2                      | URL3                | Text                     | Header          |
|-------------------------|---------------------------|---------------------|--------------------------|-----------------|
| https://example.com     | https://contact.site.com  | mailto:info@site.com| Visit our website       | Company Info    |
| https://another.com     | https://support.site.com  |                     | Contact us today         | Another Company |
```

### **Option 2: Without Headers (Positional)**
```
| A                       | B                         | C                   | D                        | E               |
|-------------------------|---------------------------|---------------------|--------------------------|-----------------|
| https://example.com     | https://contact.site.com  | mailto:info@site.com| Visit our website       | Company Info    |
| https://another.com     | https://support.site.com  |                     | Contact us today         | Another Company |
```

## 📋 Column Structure

| Position | Accepted Headers | Description | Required | Example |
|----------|------------------|-------------|----------|---------|
| A (Col 1) | `URL1`, `url1`, `URL`, `url` | Primary URL for main QR code | ✅ **Yes** | https://example.com |
| B (Col 2) | `URL2`, `url2` | Secondary URL (QR KOD HÄR2) | ❌ Optional | https://contact.example.com |
| C (Col 3) | `URL3`, `url3` | Third URL (QR CODE HERE3) | ❌ Optional | https://support.example.com |
| D (Col 4) | `URL4`, `url4` | Fourth URL (QR KOD HÄR4) | ❌ Optional | https://shop.example.com |
| E (Col 5) | `URL5`, `url5` | Fifth URL (QR CODE HERE5) | ❌ Optional | https://blog.example.com |
| F (Col 6) | `Text`, `text`, `TEXT` | Main body text | ❌ Optional* | Visit our website for more information |
| G (Col 7) | `Header`, `header`, `HEADER`, `Rubrik`, `rubrik` | Header/title text | ❌ Optional* | Company Information |

*If Text or Header columns are empty, the default values from the web part will be used.

## Example Excel Content

```
URL1                    | URL2                      | URL3 | URL4 | URL5 | Text                           | Header
https://gustafkliniken.se | https://booking.gustav.se |      |      |      | Book your appointment today    | Gustaf Kliniken
https://example.com      | https://support.example.com| mailto:info@example.com |    |      | Contact us for more info       | Example Company
```

## Template Placeholders

The following placeholders in templates will be replaced:

### Swedish Placeholders:
- `RUBRIK HÄR` → Header text
- `TEXT HÄR` → Main body text  
- `QR KOD HÄR` → First QR code (URL1)
- `QR KOD HÄR2` → Second QR code (URL2)
- `QR KOD HÄR3` → Third QR code (URL3)
- `QR KOD HÄR4` → Fourth QR code (URL4)
- `QR KOD HÄR5` → Fifth QR code (URL5)

### English Placeholders:
- `HEADER HERE` → Header text
- `TEXT HERE` → Main body text
- `QR CODE HERE` → First QR code (URL1)
- `QR CODE HERE2` → Second QR code (URL2)
- `QR CODE HERE3` → Third QR code (URL3)
- `QR CODE HERE4` → Fourth QR code (URL4)
- `QR CODE HERE5` → Fifth QR code (URL5)

## 🎯 QR Code Size Customization

- **Size Range:** 25mm to 100mm (adjustable via slider)
- **Default Size:** 50mm 
- **PDF:** Direct millimeter sizing
- **Word:** Automatically converts to appropriate Word document units
- **Multiple QR Codes:** All QR codes in the same document use the same size setting

## 📄 Template Support

**Templates work for BOTH PDF and Word documents:**
- ✅ **PDF Generation:** Templates are fully supported with proper formatting
- ✅ **Word Generation:** Templates are fully supported with native Word formatting
- ✅ **Consistent Layout:** Same template produces consistent results in both formats
- ✅ **Font Support:** Custom fonts and sizes apply to both PDF and Word
- ✅ **QR Code Placement:** Numbered placeholders work identically in both formats

## ⚙️ Processing Behavior

1. **Smart Header Detection:** Automatically detects if Row 1 contains headers or data
2. **Row Processing:** Each row generates one PDF (and optionally one Word document)
3. **Empty URLs:** If URL2-URL5 are empty, corresponding QR code placeholders are removed
4. **Default Values:** Empty Text/Header columns use web part default values
5. **File Naming:** Unique timestamp-based filenames prevent overwrites
6. **Download Location:** All files download to browser's default folder ("Downloads" / "Hämtningar")
7. **Batch Processing:** Includes progress indication and error handling

## Batch Generation Features

✅ **Multiple QR codes per document** (up to 5)  
✅ **Automatic file naming with timestamps**  
✅ **Both PDF and Word document generation**  
✅ **Swedish and English language support**  
✅ **Customizable fonts and font sizes**  
✅ **Template-based layout system**  
✅ **Progress indication during batch processing**  

## Tips for Best Results

1. **Keep URLs valid** - Invalid URLs will be skipped
2. **Use descriptive headers** - They help identify generated documents
3. **Test with small batches first** - Try 2-3 rows before processing large files
4. **Check templates** - Use the preview feature to verify layout before batch processing
5. **Browser performance** - Large batches (100+ documents) may take time to process