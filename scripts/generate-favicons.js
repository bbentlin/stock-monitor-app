const sharp = require("sharp");
const path = require("path");

const inputSvg = path.join(__dirname, "../public/favicon.svg");
const outputDir = path.join(__dirname, "../public");

async function generate() {
  // favicon.ico (32x32 PNG — browsers accept PNG in .ico)
  await sharp(inputSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(outputDir, "favicon.ico"));
  console.log("✅ favicon.ico (32x32)");

  // icon-192.png
  await sharp(inputSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(outputDir, "icon-192.png"));
  console.log("✅ icon-192.png");

  // icon-512.png
  await sharp(inputSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, "icon-512.png"));
  console.log("✅ icon-512.png");

  // apple-touch-icon.png (180x180)
  await sharp(inputSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(outputDir, "apple-touch-icon.png"));
  console.log("✅ apple-touch-icon.png (180x180)");

  console.log("\n🎉 All favicons generated in /public");
}

generate().catch(console.error);