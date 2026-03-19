import * as dotenv from 'dotenv'
import path from 'path'

console.log('--- DBG: Checking ENV Loading ---')
console.log('__dirname:', __dirname)
const envPath = path.resolve(__dirname, '../.env')
console.log('Trying to load .env from:', envPath)

const result = dotenv.config({ path: envPath })

if (result.error) {
  console.log('❌ Error loading .env:', result.error.message)
} else {
  console.log('✅ .env loaded successfully')
}

console.log(
  'DATABASE_URL:',
  process.env.DATABASE_URL
    ? 'FOUND (starts with ' + process.env.DATABASE_URL.substring(0, 10) + ')'
    : 'NOT FOUND'
)
console.log('--- DBG: End ---')
