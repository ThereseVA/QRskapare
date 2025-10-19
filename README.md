# QRskapare - QR Code Document Generator with Word Templates

## Summary

A comprehensive SharePoint Framework (SPFx) web part that generates QR code documents with professional templates. Built with React and TypeScript, this solution provides document generation for both PDF and Word formats with advanced template support.

**Key Features:**
- 📄 **Word Template System**: Upload custom .docx templates with placeholder replacement
- 🔢 **Batch Processing**: Excel import for generating multiple documents
- 🏥 **Gustaf Kliniken Integration**: Pre-built templates for healthcare documentation
- 📱 **Multi-Format Output**: PDF and Word document generation
- 🎯 **Template Management**: Upload, store and reuse Word templates
- 📊 **Excel Integration**: Import data from Excel for batch generation

**Template Features:**
- Upload custom Word (.docx) templates
- Placeholder replacement: `{QR_CODE}`, `{CUSTOM_TITLE}`, `{CUSTOM_TEXT}`
- Preserve original document formatting
- Support for headers, footers, logos, and styling

**Technologies used:**
- SharePoint Framework (SPFx) 1.21.1
- React 17.0.1
- TypeScript 5.3.3
- Fluent UI React 8.106.4
- docx library for Word processing
- jsPDF for PDF generation
- file-saver for downloads

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.21.1-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

> Any special pre-requisites?

## Solution

| Solution    | Author(s)                                               |
| ----------- | ------------------------------------------------------- |
| folder name | Author details (name, company, twitter alias with link) |

## Version history

| Version | Date             | Comments        |
| ------- | ---------------- | --------------- |
| 1.1     | March 10, 2021   | Update comment  |
| 1.0     | January 29, 2021 | Initial release |

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Quick Start

```bash
# Clone repository
git clone https://github.com/ThereseVA/QRskapare.git
cd QRskapare

# Install dependencies
npm install

# Start development server
gulp serve --nobrowser

# Open workbench
# Navigate to: https://localhost:4321/temp/workbench.html
```

## Usage Guide

### 1. Basic QR Code Generation
- Enter text or URL in the input field
- Add custom title and description
- Click "Generate PDF" or generate Word document
- Download the generated document

### 2. Word Template System
- **Create Template**: Design Word document with placeholders `{QR_CODE}`, `{CUSTOM_TITLE}`, `{CUSTOM_TEXT}`
- **Upload Template**: Click "Ladda upp Word-mall" and select your .docx file
- **Generate Document**: Fill in form fields and click "Använd mall" for desired template
- **Download**: Generated document preserves original formatting

### 3. Batch Processing with Excel
- **Download Template**: Click "Ladda ner Excel-mall" for pre-configured spreadsheet
- **Fill Data**: Add URLs, titles, and text in Excel columns
- **Import**: Upload filled Excel file using "Import Excel" button
- **Generate Batch**: Click "Generate Batch" to create multiple documents

### 4. Gustaf Kliniken Templates
- Pre-built healthcare document templates
- Click "🏥 Gustaf Kliniken Mall" for instant template generation
- Includes professional headers, footers, and patient information sections

## Features Deep Dive

### Word Template Management
- **File Upload**: Drag & drop .docx files or click to browse
- **Placeholder System**: Automatic replacement of `{PLACEHOLDER}` syntax
- **Format Preservation**: Maintains fonts, styling, headers, footers, and images
- **Template Library**: Store and reuse multiple templates

### Excel Integration  
- **Smart Import**: Automatic header detection (URL1, URL2, Text, Header, etc.)
- **Flexible Columns**: Support for Swedish and English column names
- **Batch Generation**: Process hundreds of entries simultaneously
- **Error Handling**: Validation and clear error messages

### QR Code Features
- **Multiple Codes**: Up to 5 QR codes per document
- **Size Control**: Adjustable QR code dimensions (25-100mm)
- **Quality**: High-resolution output for professional printing
- **Format Support**: Integration with both PDF and Word outputs

> Share your web part with others through Microsoft 365 Patterns and Practices program to get visibility and exposure. More details on the community, open-source projects and other activities from http://aka.ms/m365pnp.

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
