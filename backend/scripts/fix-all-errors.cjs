const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function walkDir(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkDir(fp));
    else if (entry.name.endsWith('.ts')) files.push(fp);
  }
  return files;
}

function fixContent(content) {
  // 1. Simple field name fixes
  const fieldFixes = [
    ['fechaCreacion', 'fecha_creacion'],
    ['fechaLectura', 'fecha_lectura'],
    ['fechaInicio', 'fecha_inicio'],
    ['comparacionId', 'comparacion_id'],
    ['actualizadoEn', 'actualizado_en'],
  ];
  for (const [a, b] of fieldFixes) {
    content = content.split(a).join(b);
  }

  // 2. Fix prisma.barrios -> prisma.barrio (model name)
  content = content.replace(/prisma\.barrios(?!\w)/g, 'prisma.barrio');

  // 3. Fix barrios/include: barrios: -> barrio: when on ubicacion_inmueble
  //    This is the include under properties.repository.ts
  //    Simple: replace 'barrios:' in include/select context
  //    But NOT in zona_geografica context
  
  // 4. Fix old auto-generated relation names in locations files
  content = content.replace(/provincia_municipio_provinciaToprovincia/g, 'provincia');
  content = content.replace(/departamento_provincia_departamentoTodepartamento/g, 'departamento');
  content = content.replace(/municipio_zona_geografica_municipioTomunicipio/g, 'municipio');
  content = content.replace(/provincia_provincia_departamentoTodepartamento/g, 'provincias');

  // 5. Fix FK filter names: { municipio: number } -> { municipio_id: number }
  content = content.replace(/where:\s*\{\s*municipio:\s*Number/g, 'where: { municipio_id: Number');
  // More generic: any() where { someRelation: number -> someRelation_id: number
  // But be careful - only when it's a FK filter, not a relation filter

  // 6. Fix telefono queries: usuario_id -> usuarioId where appropriate
  //    telefono does NOT have usuario_id, it has usuarioId
  //    Fix in where/create input for telefono model
  content = content.replace(/(prisma\.telefono\.[^(]+\([^)]*?)usuario_id([^)])/g, '$1usuarioId$2');

  // 7. Fix barrio: -> barrios: in include for zona_geografica model
  //    Only when it's on zona_geografica queries
  //    This is harder to detect. Let me just fix the specific file.

  return content;
}

const files = walkDir(srcDir);
let count = 0;

for (const fp of files) {
  const c = fs.readFileSync(fp, 'utf8');
  const f = fixContent(c);
  if (c !== f) {
    fs.writeFileSync(fp, f, 'utf8');
    count++;
  }
}

console.log(`Fixed ${count} files`);
