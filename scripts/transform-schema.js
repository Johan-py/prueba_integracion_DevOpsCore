import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, '..', 'backend', 'prisma', 'schema.prisma');
const raw = readFileSync(schemaPath, 'utf-8');
const lines = raw.split(/\r?\n/);

function toSnake(str) {
  return str
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
}

const modelRenames = new Map();  // oldModelName -> newModelName
const reverseModel = new Map();  // newModelName -> oldModelName
const fieldRenames = new Map();  // modelName (OLD) -> Map(oldField -> newField)
const enumRenames = new Map();   // oldEnumName -> newEnumName

// === First pass: Collect all rename maps ===
let currentModel = null;
let currentFields = new Set();

function flushModelFields() {
  if (!currentModel || currentFields.size === 0) return;
  const info = { model: currentModel, fields: new Map() };
  fieldRenames.set(currentModel, info.fields);

  // For each line in the model, find fields with @map
  // We'll re-scan lines later; just track collision set
}

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  const modelMatch = line.match(/^model\s+(\w+)\s*\{$/);
  if (modelMatch) {
    currentModel = modelMatch[1];
    currentFields = new Set();
    continue;
  }
  if (line.match(/^\}/)) {
    // Process field renames for this model
    if (currentModel && currentFields.size > 0) {
      const fm = new Map();
      // Re-scan backwards to find @map lines
      for (let j = i - 1; j >= 0; j--) {
        const l = lines[j];
        if (l.match(/^model\s+\w+\s*\{$/)) break;
        const mapRe = l.match(/^\s+(\w+)\s+\S+(?:\s+[^@]\S+(?:\s*\([^)]*\))?)*?\s+@map\("([^"]+)"\)/);
        // Actually simpler: just find @map("...") on the line and extract field name
        const mapRe2 = l.match(/^\s+(\w+)\s+/);
        const mapVal = l.match(/@map\("([^"]+)"\)/);
        if (mapVal && mapRe2) {
          const oldF = mapRe2[1];
          const newF = mapVal[1];
          if (oldF !== newF && !currentFields.has(newF)) {
            fm.set(oldF, newF);
          } else if (oldF !== newF && currentFields.has(newF)) {
            console.log(`  SKIP ${currentModel}.${oldF} -> ${newF} (collision)`);
          }
        }
      }
      fieldRenames.set(currentModel, fm);
    }
    currentModel = null;
    continue;
  }
  // Collect field names
  const fieldMatch = line.match(/^\s+(\w+)\s+\S/);
  if (fieldMatch) currentFields.add(fieldMatch[1]);
}

// Model renames
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const m = line.match(/^model\s+(\w+)\s*\{$/);
  if (!m) continue;
  const name = m[1];
  // Look for @@map in subsequent lines until }
  let mapMatch = null;
  for (let j = i + 1; j < lines.length; j++) {
    if (lines[j].match(/^\}/)) break;
    const mm = lines[j].match(/@@map\("([^"]+)"\)/);
    if (mm) { mapMatch = mm[1]; break; }
  }
  const newName = mapMatch || (name !== toSnake(name) ? toSnake(name) : null);
  if (newName && name !== newName) { modelRenames.set(name, newName); reverseModel.set(newName, name); }
}

// Enum renames
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const m = line.match(/^enum\s+(\w+)\s*\{$/);
  if (!m) continue;
  const name = m[1];
  let mapMatch = null;
  for (let j = i + 1; j < lines.length; j++) {
    if (lines[j].match(/^\}/)) break;
    const mm = lines[j].match(/@@map\("([^"]+)"\)/);
    if (mm) { mapMatch = mm[1]; break; }
  }
  if (mapMatch && name !== mapMatch) enumRenames.set(name, mapMatch);
}

console.log('=== Model renames ===');
for (const [o, n] of modelRenames) console.log(`  ${o} -> ${n}`);
console.log('\n=== Field renames ===');
for (const [mn, fm] of fieldRenames) {
  if (fm.size > 0) {
    console.log(`  Model ${mn}:`);
    for (const [o, n] of fm) console.log(`    ${o} -> ${n}`);
  }
}
console.log('\n=== Enum renames ===');
for (const [o, n] of enumRenames) console.log(`  ${o} -> ${n}`);

// === Second pass: Apply transformations ===
let result = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];

  // Model declaration rename
  const modelDecl = line.match(/^model\s+(\w+)\s*\{$/);
  if (modelDecl && modelRenames.has(modelDecl[1])) {
    line = line.replace(modelDecl[1], modelRenames.get(modelDecl[1]));
    result.push(line);
    continue;
  }

  // Remove @@map line
  const mapLine = line.match(/^\s*@@map\("/);
  if (mapLine) continue; // Skip @@map lines (they already served their purpose)

  // Field rename: replace field name and remove @map attribute
  // For lines containing @map
  if (line.includes('@map(')) {
    const fieldMatch = line.match(/^(\s+)(\w+)\s+/);
    if (fieldMatch) {
      const leading = fieldMatch[1];
      const fieldName = fieldMatch[2];
      
      // Check if current model has a rename for this field
      // We need to know which model we're in
      let modelForField = null;
      for (let j = i - 1; j >= 0; j--) {
        const l = lines[j];
        const mm = l.match(/^model\s+(\w+)\s*\{$/);
        if (mm) { 
          const newName = mm[1];
          modelForField = reverseModel.get(newName) || newName;
          break; 
        }
        if (l.match(/^\}/)) break;
      }
      
      if (modelForField && fieldRenames.has(modelForField)) {
        const fm = fieldRenames.get(modelForField);
        if (fm && fm.has(fieldName)) {
          const newFieldName = fm.get(fieldName);
          // Replace field name at start of line
          line = line.replace(/^(\s+)(\w+)/, `$1${newFieldName}`);
          // Remove @map("...")
          line = line.replace(/\s+@map\("[^"]*"\)/, '');
        }
      }
    }
  }

  // Model type reference updates
  for (const [oldName, newName] of modelRenames) {
    // Match as a type reference: preceded by space, followed by []/?/space/end/comma
    line = line.replace(
      new RegExp(`(?<=\\s)${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\[\\]|\\?)`, 'g'),
      `${newName}$1`
    );
    line = line.replace(
      new RegExp(`(?<=\\s)${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=\\s|$|,)`, 'g'),
      newName
    );
  }

  // Enum reference updates
  for (const [oldName, newName] of enumRenames) {
    // Replace enum type references
    line = line.replace(
      new RegExp(`(?<=\\s)${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\[\\]|\\?)`, 'g'),
      `${newName}$1`
    );
    line = line.replace(
      new RegExp(`(?<=\\s)${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=\\s|$|,)`, 'g'),
      newName
    );
    // Also replace enum declaration
    const enumDecl = line.match(/^enum\s+(\w+)\s*\{$/);
    if (enumDecl && enumDecl[1] === oldName) {
      line = line.replace(oldName, newName);
    }
  }

  // Update fields:[...] and references:[...]
  for (const [, fm] of fieldRenames) {
    for (const [oldF, newF] of fm) {
      const escapedOld = oldF.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      line = line.replace(new RegExp(`(fields:\\s*\\[)${escapedOld}(\\])`, 'g'), `$1${newF}$2`);
      line = line.replace(new RegExp(`(references:\\s*\\[)${escapedOld}(\\])`, 'g'), `$1${newF}$2`);
      line = line.replace(new RegExp(`(map:\\s*")${escapedOld}(")`, 'g'), `$1${newF}$2`);
    }
  }

  // Update @@index references
  for (const [, fm] of fieldRenames) {
    for (const [oldF, newF] of fm) {
      const eo = oldF.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      line = line.replace(new RegExp(`@@index\\(\\[${eo}\\(`, 'g'), `@@index([${newF}(`);
      line = line.replace(new RegExp(`@@index\\(\\[${eo}\\]`, 'g'), `@@index([${newF}]`);
    }
  }

  result.push(line);
}

// Clean up blank lines
let output = result.join('\n');
output = output.replace(/\n{3,}/g, '\n\n');

writeFileSync(schemaPath, output, 'utf-8');
console.log('\n✓ Schema transformed successfully!');
