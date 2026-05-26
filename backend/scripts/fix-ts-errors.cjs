const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function walkDir(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, fileList);
    } else if (entry.name.endsWith('.ts')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function fixContent(content) {
  const orig = content;

  // 1. Simple global string replacements
  const simple = [
    ['usuarioId_inmueble_id', 'usuario_id_inmueble_id'],
    ['fechaExpiracion', 'fecha_expiracion'],
    ['codigoHash', 'codigo_hash'],
    ['idExterno', 'id_externo'],
    ['correoProveedor', 'correo_proveedor'],
    ['vinculadoEn', 'vinculado_en'],
    ['passwordHash', 'password_hash'],
    ['telefono_telefono_usuarioidTousuario', 'telefono_telefono_usuario_idTousuario'],
    ['promotedAt', 'promoted_at'],
    ['promotedExpiresAt', 'promoted_expires_at'],
  ];
  for (const [a, b] of simple) {
    content = content.split(a).join(b);
  }

  // 2. Fix publicacion -> publicaciones as relation name
  //    Match standalone word "publicacion" when it's a relation access
  //    But NOT "prisma.publicacion" (model reference)
  content = content.replace(/(?<!prisma)(\.publicacion)(?![a-zA-Z_])/g, '.publicaciones');
  // Match object key publicacion: in any context (including multi-line)
  content = content.replace(/publicacion(:?\s*[:\n])/g, (m) => m.replace('publicacion', 'publicaciones'));
  // Match 'publicacion' or "publicacion" as string key
  content = content.replace(/['"]publicacion['"]/g, "'publicaciones'");

  // 3. Fix ubicacion_inmueble -> ubicacion as relation name
  //    But NOT prisma.ubicacion_inmueble (model reference) - this is complex
  //    Strategy: Replace all ".ubicacion_inmueble" then fix prisma ones back
  
  // Only change .ubicacion_inmueble when it's a property access (not after prisma)
  content = content.replace(/\.ubicacion_inmueble/g, (match, offset) => {
    // Check what's before the dot
    const before = content.slice(Math.max(0, offset - 30), offset);
    if (before.endsWith('prisma')) {
      return '.ubicacion_inmueble'; // keep as-is
    }
    return '.ubicacion';
  });

  // Fix ubicacion_inmueble: as object key -> ubicacion:
  content = content.replace(/ubicacion_inmueble(\s*:)/g, 'ubicacion$1');
  // Fix 'ubicacion_inmueble' or "ubicacion_inmueble" string keys
  content = content.replace(/['"]ubicacion_inmueble['"]/g, "'ubicacion'");

  // 4. Fix barrio -> barrios as relation name (on zona_geografica)
  content = content.replace(/\.barrio(?![a-zA-Z_])/g, '.barrios');
  content = content.replace(/\bbarrio(\s*:)/g, 'barrios$1');

  // 5. Fix prisma.ubicacion -> prisma.ubicacion_inmueble
  //    (but not prisma.ubicacion_maestra)
  content = content.replace(/prisma\.ubicacion(?![a-zA-Z_])/g, (match) => {
    // Check the next ~20 chars to see if it could be ubicacion_maestra
    const idx = content.indexOf(match);
    const next = content.slice(idx, idx + 30);
    if (next.startsWith('prisma.ubicacion_maestra') || next.startsWith('prisma.ubicacion_inmueble')) {
      return match;
    }
    return 'prisma.ubicacion_inmueble';
  });

  return content;
}

const files = walkDir(srcDir);
let changedCount = 0;

console.log(`Found ${files.length} .ts files`);

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fixed = fixContent(content);
  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    changedCount++;
    console.log(`  Fixed: ${path.relative(srcDir, filePath)}`);
  }
}

console.log(`\nChanged ${changedCount} files`);
console.log('Done! Run tsc --noEmit to check remaining errors.');
