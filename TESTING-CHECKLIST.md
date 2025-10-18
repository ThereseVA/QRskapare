# QR Generator - Testing Checklist
## Gustaf Kliniken SharePoint Testing

### Environment Setup ✅
- [x] Port 4321 checked and cleaned
- [x] Development certificate trusted
- [x] Server started successfully on https://localhost:4321
- [x] SharePoint test URL configured correctly
- [x] Build completed with only minor lint warnings (no blocking errors)

### Test URLs
1. **Main Test Page**: https://gustafkliniken.sharepoint.com/sites/Gustafkliniken/SitePages/Testsida.aspx?debug=true&noredir=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js
2. **SharePoint Workbench**: https://gustafkliniken.sharepoint.com/_layouts/15/workbench.aspx?debug=true&noredir=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js

### Core Functionality Testing

#### ✅ Single Document Mode
- [ ] Test basic document generation with PDF
- [ ] Test basic document generation with Word
- [ ] Test QR code generation (up to 5 codes)
- [ ] Test URL validation
- [ ] Test real-time QR preview
- [ ] Test custom header and body text
- [ ] Test template upload (Word/PDF/Excel)
- [ ] Test README button functionality

#### ✅ Batch Mode (Excel)
- [ ] Test Excel template download
- [ ] Test Excel file upload (.xlsx, .xls, .csv)
- [ ] Test batch document generation
- [ ] Test Excel data processing
- [ ] Test multiple QR codes per row
- [ ] Test error handling for invalid Excel data

#### ✅ Template Upload Features
- [ ] Test Word template upload (.docx, .doc)
- [ ] Test PDF template upload
- [ ] Test Excel template upload (.xlsx, .xls)
- [ ] Test placeholder replacement
- [ ] Test Excel template as batch mode
- [ ] Test file type validation

#### ✅ User Interface
- [ ] Test mode switching (Single/Batch)
- [ ] Test README button (main and secondary)
- [ ] Test help text and tooltips
- [ ] Test error messages and validation
- [ ] Test loading states and spinners
- [ ] Test responsive design

#### ✅ README/Help System
- [ ] Test main README button (📚 Läs instruktioner)
- [ ] Test secondary help button (❓ Hjälp)
- [ ] Test README file download
- [ ] Verify comprehensive guide content
- [ ] Test inline help text

### Browser Compatibility Testing
- [ ] Test in Microsoft Edge
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test QR code scanning with mobile device

### Security & Performance
- [ ] Test URL validation security
- [ ] Test file upload security
- [ ] Test large Excel file handling
- [ ] Test memory usage with multiple documents
- [ ] Test error handling and recovery

### SharePoint Integration
- [ ] Test web part installation in SharePoint
- [ ] Test permissions and access
- [ ] Test file downloads in SharePoint context
- [ ] Test multiple users accessing simultaneously

### Known Issues to Monitor
1. **Word Generation**: Browser compatibility issue with docx library resolved
2. **Excel Templates**: New feature - ensure proper error handling
3. **Port Management**: Verify clean startup/shutdown
4. **File Downloads**: Test all download functionality (PDF, Word, Excel, README)

### Test Data Examples

#### Single Document URLs:
- https://gustafkliniken.se
- https://gustafkliniken.se/kontakt
- https://gustafkliniken.se/tjanster
- https://gustafkliniken.se/om-oss
- https://gustafkliniken.se/bokning

#### Excel Test Data:
```
url1: https://gustafkliniken.se
url2: https://gustafkliniken.se/kontakt
titel: Hemsida
titel2: Kontakt
header: Gustaf Kliniken
text: Välkommen till Gustaf Kliniken - din hälsopartner
```

### Performance Benchmarks
- [ ] Single document generation: < 3 seconds
- [ ] Batch generation (10 rows): < 30 seconds
- [ ] Excel template download: < 2 seconds
- [ ] README download: < 1 second
- [ ] QR code preview: < 1 second

### Post-Testing Actions
- [ ] Document any issues found
- [ ] Test fixes for any problems
- [ ] Update user guide if needed
- [ ] Prepare deployment checklist
- [ ] Create user training materials

### Deployment Readiness
- [ ] All tests passed
- [ ] Performance acceptable
- [ ] User guide comprehensive
- [ ] Error handling robust
- [ ] SharePoint integration verified

---
**Test Date**: October 18, 2025
**Tester**: Development Team
**Environment**: Gustaf Kliniken SharePoint + localhost:4321
**Version**: 2.0 (with Excel templates and README functionality)