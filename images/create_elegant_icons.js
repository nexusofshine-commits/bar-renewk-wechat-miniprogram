const fs = require('fs');

function createElegantPNG(width, height, type, isActive) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    const table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[n] = c;
    }
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function createChunk(type, data) {
    const typeBuffer = Buffer.from(type);
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const crcData = Buffer.concat([typeBuffer, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcData));
    return Buffer.concat([length, typeBuffer, data, crc]);
  }

  // Elegant color palette
  const inactiveColor = [128, 128, 128, 255]; // #808080
  const activeColor = [212, 175, 55, 255];    // #d4af37 - gold
  const bgColor = [26, 26, 26, 255];          // #1a1a1a - dark bg
  
  const color = isActive ? activeColor : inactiveColor;

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Create elegant icon shapes
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0);
    for (let x = 0; x < width; x++) {
      let r = bgColor[0], g = bgColor[1], b = bgColor[2], a = bgColor[3];
      
      const cx = width / 2;
      const cy = height / 2;
      
      if (type === 'select') {
        // Wine glass shape
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Bowl of glass
        if (y > cy - 8 && y < cy + 4) {
          if (Math.abs(dx) < 10 - (y - (cy - 8)) * 0.5) {
            [r, g, b, a] = color;
          }
        }
        // Stem
        if (y >= cy + 4 && y < cy + 16 && Math.abs(dx) < 2) {
          [r, g, b, a] = color;
        }
        // Base
        if (y >= cy + 16 && y < cy + 20 && Math.abs(dx) < 8) {
          [r, g, b, a] = color;
        }
      } else if (type === 'menu') {
        // Menu/list icon - elegant lines
        const lineY = [cy - 10, cy - 2, cy + 6];
        lineY.forEach(ly => {
          if (Math.abs(y - ly) < 2 && x > cx - 10 && x < cx + 10) {
            [r, g, b, a] = color;
          }
        });
        // Decorative dots
        if (Math.abs(y - (cy - 10)) < 2 && Math.abs(x - (cx - 6)) < 2) {
          [r, g, b, a] = isActive ? [255, 255, 255, 255] : color;
        }
      } else if (type === 'orders') {
        // Receipt/order icon
        // Paper outline
        if (x > cx - 8 && x < cx + 8 && y > cy - 14 && y < cy + 14) {
          if (x < cx - 6 || x > cx + 6 || y < cy - 12 || y > cy + 12) {
            [r, g, b, a] = color;
          }
        }
        // Lines on receipt
        const lines = [cy - 6, cy, cy + 6];
        lines.forEach(ly => {
          if (Math.abs(y - ly) < 1 && x > cx - 5 && x < cx + 5) {
            [r, g, b, a] = color;
          }
        });
      }
      
      rawData.push(r, g, b, a);
    }
  }
  
  const rawBuffer = Buffer.from(rawData);
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawBuffer);

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const icons = [
  { name: 'tab_select.png', type: 'select', active: false },
  { name: 'tab_select_active.png', type: 'select', active: true },
  { name: 'tab_menu.png', type: 'menu', active: false },
  { name: 'tab_menu_active.png', type: 'menu', active: true },
  { name: 'tab_orders.png', type: 'orders', active: false },
  { name: 'tab_orders_active.png', type: 'orders', active: true }
];

icons.forEach(icon => {
  const png = createElegantPNG(48, 48, icon.type, icon.active);
  fs.writeFileSync(icon.name, png);
  console.log(`Created ${icon.name}`);
});
