const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require(process.env.SHARP_MODULE || 'sharp');
const assets = [
  {
    "name": "jade-horizon",
    "prompt": "Create a production illustration plate for the approved Waisery homepage, wide landscape 1536 x 1024. Reference 1 is the approved architectural composition; reference 2 anchors the same ivory and gold world. Reconstruct ONLY the cinematic environment, with absolutely NO text, letters, logos, UI, buttons, borders, project previews or navigation. Preserve the grand Chinese white-jade palace on the RIGHT, dark elegant upturned eaves, fine pale-gold openwork and sheer silk curtains. A long curved polished terrace sweeps from the right across the lower part, above endless clouds and distant Chinese mountain pavilions. Most of the LEFT half, especially upper-left, is calm luminous ivory sky and very soft cloud mist with little detail, reserved for semantic dark title text. Warm restrained gold sunset, photorealistic celestial architecture, stately and refined, not yellow saturation or clutter. The lower edge softly recedes to luminous ivory cloud mist so it can merge with a warm ivory page. Match scale, light, camera and palette so it can dissolve seamlessly into the figure-led second reference. No people in this opening plate.",
    "refs": [
      "E:\\A_SYNU\\Web Data Management Application\\Capstone\\.impeccable\\mocks\\white-jade\\03-jade-horizon.png",
      "E:\\A_SYNU\\Web Data Management Application\\Capstone\\.impeccable\\mocks\\white-jade\\02-veil-of-light.png"
    ],
    "source": "exec-3462a4f9-2e3a-4fc8-9576-467c4136d786.png"
  },
  {
    "name": "veil-of-light",
    "prompt": "Create a production illustration plate for the approved Waisery homepage, wide landscape 1536 x 1024. Reference 1 is the PRIMARY approved composition and visual identity; reference 2 anchors the same architectural setting. Render ONLY the background artwork, no text, letters, logos, UI, buttons, navigation, borders or project thumbnails. Preserve the exquisite anonymous Chinese celestial figure on the RIGHT half, in solemn side profile facing left, dark hair and delicate warm dark silhouette, pale ivory layered silk with extremely fine translucent gold openwork flowing toward the right edge. The left half, especially upper-left and center-left, must be very calm luminous warm ivory cloud mist with low detail, reserved for dark semantic title text. Behind the figure, a curved white-jade Chinese palace corridor floats in cloud seas with distant traditional Chinese eaves and mountains, warm golden backlight. The art is sophisticated cinematic Chinese fantasy, dignified and astonishing, never generic anime, not a portrait of the site owner. Avoid heavy ornaments entering the LEFT title area; detail belongs to the figure and right-side palace. Match the opening architectural reference's lighting, ivory palette and camera for a natural image dissolve. The lower edge softly becomes luminous ivory cloud mist, not a hard rectangular image edge. No project section.",
    "refs": [
      "E:\\A_SYNU\\Web Data Management Application\\Capstone\\.impeccable\\mocks\\white-jade\\02-veil-of-light.png",
      "E:\\A_SYNU\\Web Data Management Application\\Capstone\\.impeccable\\mocks\\white-jade\\03-jade-horizon.png"
    ],
    "source": "exec-496abb66-1f02-4f50-8f7c-ba18b5f49b07.png"
  },
  {
    "name": "stillwater",
    "prompt": "Create a cinematic project-cover artwork for a sample project called Stillwater in Waisery's Chinese celestial white-jade portfolio. Landscape 1536 x 1024, no text, letters, logos, labels, UI, borders or watermarks. A quiet white-jade Chinese pavilion and refined curved bridge over perfectly still cloud-reflecting water, distant layered mountains, a single gnarled pine with delicate warm gold leaves, pale ivory sky and muted gold sunrise. Draw directly from the reference image's refined white-jade and gold architectural language, but compose this as a standalone close, contemplative environment. Exquisite polished stone, authentic upturned Chinese rooflines, broad horizontal calm, photorealistic cinematic craft and precise material detail. Restrained tones, no fantasy character, no garish saturated yellow. A beautiful real artwork to use as a portfolio thumbnail at multiple aspect ratios.",
    "refs": [
      "E:\\A_SYNU\\Web Data Management Application\\Capstone\\.impeccable\\mocks\\white-jade\\03-jade-horizon.png"
    ],
    "source": "exec-6e4a4908-bc7c-480d-8633-e37288fba03e.png"
  },
  {
    "name": "fieldnotes",
    "prompt": "Create an exquisite cinematic project-cover artwork for a sample project called Fieldnotes in Waisery's Chinese celestial white-jade portfolio. Landscape 1536 x 1024, no readable text, letters, logos, captions, UI, borders or watermarks. An open ivory sketchbook with delicate non-letter botanical and architectural line drawings on a dark polished Chinese scholar's desk, one fine brush and a small pale-jade object, luminous flowering plum branch, a sheer ivory silk curtain catching warm gold light, distant cloud-wrapped Chinese palace visible through a broad opening. Warm ivory pages and pale gold highlights against solemn dark wood, beautiful layered depth, sophisticated cinematic realism, a moment of quiet thought. Reference carries the approved ivory/gold lighting and intricate refined Chinese visual world, not its person or website layout. No figure, no copied subtitles, no fake Chinese characters, no illegible pseudo-writing. Keep primary objects near center for responsive portfolio thumbnail crops.",
    "refs": [
      "E:\\A_SYNU\\Web Data Management Application\\Capstone\\.impeccable\\mocks\\white-jade\\02-veil-of-light.png"
    ],
    "source": "exec-9f44eede-c708-4804-a8d1-497ce7909417.png"
  }
];
(async () => {
  const out = path.join(__dirname, '../client/public/images');
  await fs.mkdir(out, { recursive: true });
  for (const asset of assets) {
    const source = path.join(process.env.GENERATED_ASSET_DIR, asset.source);
    await sharp(source).webp({ quality: 88 }).withExif({ IFD0: { ImageDescription: asset.prompt, Software: 'Built-in ImageGen; encoded with Sharp' } }).toFile(path.join(out, asset.name + '.webp'));
  }
  await fs.writeFile(path.join(__dirname, '../ASSET_PROVENANCE.json'), JSON.stringify({ tool: 'built-in image_gen', assets }, null, 2) + '\n');
  console.log('Prepared ' + assets.length + ' production WebP assets with embedded generation prompts.');
})().catch(err => { console.error(err); process.exitCode = 1; });

