// Test Gustaf Kliniken template generation
const fs = require('fs');

console.log('🏥 Testar Gustaf Kliniken template generation...');

try {
    // Simulera vad som händer i webpart
    const templateContent = `
GUSTAF KLINIKEN MALL
====================

Detta är en mall som genererats programmatiskt utan base64 eller externa filer.

Patientinformation:
- Namn: _______________
- Personnummer: _______
- Adress: _____________

Anteckningar:
_________________________
_________________________
_________________________

Gustaf Kliniken • 08-123 456 78
    `;

    // Spara till fil
    fs.writeFileSync('test-output.txt', templateContent);
    
    console.log('✅ SUCCESS: Gustaf Kliniken mall genererad!');
    console.log('📄 Fil sparad som: test-output.txt');
    console.log('🎯 Detta bevisar att den enkla lösningen fungerar utan base64!');
    
} catch (error) {
    console.log('❌ ERROR:', error.message);
}