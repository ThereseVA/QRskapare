// Simple Gustaf Kliniken template generation - NO external dependencies!
// This version works like the HTML test - guaranteed to work in browser!

export const generateGustafKlinikenTemplate = async (): Promise<Blob> => {
  
  // Create simple text template content - same as working HTML test
  const templateContent = `
GUSTAF KLINIKEN
===============
Kvalitet • Omsorg • Trygghet


DOKUMENTMALL
============

PATIENTINFORMATION:
==================
Namn: ___________________________
Personnummer: ___________________
Adress: _________________________
         _________________________
Telefon: ________________________
E-post: _________________________

KONTAKTORSAK:
=============
Datum: __________________________
Tid: ____________________________
Läkare: _________________________

ANTECKNINGAR:
=============
_____________________________________
_____________________________________
_____________________________________
_____________________________________
_____________________________________
_____________________________________
_____________________________________
_____________________________________

ÅTGÄRDER:
=========
_____________________________________
_____________________________________
_____________________________________

NÄSTA BESÖK:
============
Datum: __________________________
Tid: ____________________________
Läkare: _________________________

ÖVRIG INFORMATION:
==================
_____________________________________
_____________________________________


-------------------------------------------
Gustaf Kliniken
Telefon: 08-123 456 78
E-post: info@gustafkliniken.se
Webb: www.gustafkliniken.se

© ${new Date().getFullYear()} Gustaf Kliniken
Alla rättigheter förbehållna
-------------------------------------------
  `;

  // Create blob - this ALWAYS works in browser, same as HTML test
  return new Blob([templateContent], { 
    type: 'text/plain;charset=utf-8'
  });
};