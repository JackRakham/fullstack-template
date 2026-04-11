---
description: Estándar para la generación de documentos PDF en el Backend usando jsPDF y sharp
---

# Generación de Documentos PDF (Backend)

Al requerir la generación de documentos en formato PDF desde el servidor (por ejemplo, compilando imágenes para un POD o una Factura), se debe utilizar la librería `jspdf` en conjunto con `sharp` para optimizar el peso de los entregables a través de red. 

Sin embargo, debido a limitaciones subyacentes del entorno Node.js, hay **restricciones críticas** a seguir.

## Reglas Críticas

### 1. NUNCA usar JPEGs progresivos 
La librería `jsPDF` en entornos Node.js **no es capaz de procesar** un `Buffer` o `Base64` de un JPEG generado con el flag `progressive`:

```typescript
// ❌ INCORRECTO: jsPDF colapsará con "Error creating PDF"
const buffer = await sharp(image).jpeg({ quality: 85, progressive: true }).toBuffer(); 

// ✅ CORRECTO: Generar JPEG basal
const buffer = await sharp(image).jpeg({ quality: 85 }).toBuffer(); 
```

### 2. Importación segura (CommonJS vs ESM)
Asegúrate de importar los módulos de la manera que interopere correctamente en NestJS:

```typescript
// ❌ INCORRECTO: Puede arrojar 'sharp_1.default is not a function'
import sharp from 'sharp';

// ✅ CORRECTO: Importación segura
import * as sharp from 'sharp';
import { jsPDF } from 'jspdf';
```

## Ejemplo Básico de Generación de un PDF

```typescript
import * as sharp from 'sharp';
import { jsPDF } from 'jspdf';
import { Buffer } from 'buffer';

export async function createStandardPDF(images: string[]): Promise<Buffer> {
  const processedImages = [];
  
  // 1. Optimización iterativa segura
  for (const img of images) {
    const meta = await sharp(img).metadata();
    const buffer = await sharp(img)
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 }) // NUNCA usar progressive: true aquí
      .toBuffer();
      
    processedImages.push({ buffer, meta });
  }
  
  // 2. Creación del Lienzo
  const first = processedImages[0];
  const pdf = new jsPDF({
    orientation: (first.meta.width || 0) > (first.meta.height || 0) ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // 3. Pintado e Incrustado
  processedImages.forEach((img, idx) => {
    if (idx > 0) {
      const orientation = (img.meta.width || 0) > (img.meta.height || 0) ? 'landscape' : 'portrait';
      pdf.addPage('a4', orientation);
    }
    
    // Convertir el JPEG en data URI crudo
    const base64Image = img.buffer.toString('base64');
    
    // ... Calcular proporciones ...
    const x = 10;
    const y = 10;
    const width = 190;
    const height = 277;
    
    pdf.addImage(`data:image/jpeg;base64,${base64Image}`, 'JPEG', x, y, width, height);
  });
  
  // 4. Salida Segura hacia Buffer de Node.js
  const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
  return pdfBuffer;
}
```
