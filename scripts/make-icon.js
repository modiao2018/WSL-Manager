const sharp = require('sharp')
const { default: pngToIco } = require('png-to-ico')
const fs = require('fs')
const path = require('path')

async function main() {
  const src = path.join(__dirname, '..', 'build', 'icon.png')
  const icoPath = path.join(__dirname, '..', 'build', 'icon.ico')
  const croppedPath = path.join(__dirname, '..', 'build', 'icon-cropped.png')
  const sizes = [16, 24, 32, 48, 64, 128, 256]
  const tmpFiles = []

  // Step 1: Trim whitespace first
  const trimmedPath = path.join(__dirname, '..', 'build', 'icon-trimmed.png')
  await sharp(src).trim().png().toFile(trimmedPath)

  // Step 2: Make it square with transparent padding
  const meta2 = await sharp(trimmedPath).metadata()
  const side = Math.max(meta2.width, meta2.height)
  await sharp(trimmedPath)
    .resize(side, side, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(croppedPath)
  console.log(`Cropped: ${meta2.width}x${meta2.height} -> ${side}x${side} square`)

  for (const size of sizes) {
    const tmpPath = path.join(__dirname, '..', 'build', `icon-${size}.png`)
    await sharp(croppedPath)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(tmpPath)
    tmpFiles.push(tmpPath)
  }

  console.log('Generated PNGs for sizes:', sizes.join(', '))

  const ico = await pngToIco(tmpFiles)
  fs.writeFileSync(icoPath, ico)
  console.log('Created icon.ico with', sizes.length, 'sizes')

  // Clean up temp files
  for (const f of tmpFiles) {
    fs.unlinkSync(f)
  }
}

main().catch(console.error)
