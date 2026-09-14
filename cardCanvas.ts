import QRCode from 'qrcode';
import { Employee, CardDesignConfig, getAreaColor } from './types';

export const CARD_WIDTH = 1004;
export const CARD_HEIGHT = 650;

/**
 * Loads an image from URL or data URL and returns an HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Draws the vector Sunhouse brand logo onto the canvas (Kích thước chuẩn: ngang 25mm x dọc 13mm ~ 295px x 154px ở 300 DPI)
 */
export function drawSunhouseLogo(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  topY: number,
  targetW: number = 295,
  targetH: number = 154
) {
  ctx.save();

  // Bounding box: ngang 25mm x dọc 13mm (295 x 154 px ở 300 DPI)
  const panW = Math.round(targetW * 0.86); // ~254px
  const panH = Math.round(targetH * 0.72); // ~110px
  const panX = centerX - panW / 2;
  const panY = topY + Math.round(targetH * 0.24); // ~37px

  // 1. Teal/Cyan Cookware base shape (#007A87 - Pantone 3155 C)
  ctx.fillStyle = '#007A87';
  
  // Thân nồi chảo bo góc dưới
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(panX, panY, panW, panH, [10, 10, 20, 20]);
  } else {
    ctx.rect(panX, panY, panW, panH);
  }
  ctx.fill();

  // Quai nồi hai bên
  const handleW = Math.round(targetW * 0.055); // ~16px
  const handleH = Math.round(targetH * 0.22);  // ~34px
  const handleY = panY + Math.round(panH * 0.2);
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(panX - handleW + 2, handleY, handleW, handleH, 5);
    ctx.roundRect(panX + panW - 2, handleY, handleW, handleH, 5);
  } else {
    ctx.rect(panX - handleW + 2, handleY, handleW, handleH);
    ctx.rect(panX + panW - 2, handleY, handleW, handleH);
  }
  ctx.fill();

  // 2. Huy hiệu bầu dục đỏ trung tâm
  const ovalW = Math.round(targetW * 0.88); // ~260px
  const ovalH = Math.round(targetH * 0.48); // ~74px
  const ovalX = centerX - ovalW / 2;
  const ovalY = topY + 4;

  // Viền trắng bảo vệ quanh hình bầu dục
  const strokePad = 4;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(ovalX - strokePad, ovalY - strokePad, ovalW + strokePad * 2, ovalH + strokePad * 2, (ovalH + strokePad * 2) / 2);
  } else {
    ctx.rect(ovalX - strokePad, ovalY - strokePad, ovalW + strokePad * 2, ovalH + strokePad * 2);
  }
  ctx.fill();

  // Nền đỏ hình bầu dục (#E30613)
  ctx.fillStyle = '#E30613';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(ovalX, ovalY, ovalW, ovalH, ovalH / 2);
  } else {
    ctx.rect(ovalX, ovalY, ovalW, ovalH);
  }
  ctx.fill();

  // Logo text "SUNHOUSE ®"
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 30px Montserrat, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SUNHOUSE ®', centerX, ovalY + ovalH / 2 + 1);

  ctx.restore();
}

/**
 * Draws default silhouette avatar if employee photo is not provided
 */
export function drawDefaultAvatar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  initials: string
) {
  ctx.save();
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(x, y, w, h);

  // Border
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  // Head circle
  ctx.fillStyle = '#94A3B8';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 105, 48, 0, Math.PI * 2);
  ctx.fill();

  // Shoulder arc
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + 250, 85, 75, 0, Math.PI, 0);
  ctx.fill();

  // Initials tag
  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 24px Montserrat, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(initials, x + w / 2, y + h - 12);

  ctx.restore();
}

/**
 * Renders a complete employee card to an HTML canvas at 1004 x 650 (300 DPI)
 */
export async function renderCardToCanvas(
  canvas: HTMLCanvasElement,
  employee: Employee,
  config: CardDesignConfig
): Promise<void> {
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. BASE BACKGROUND
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // 2. HEADER - Red Banner
  const headerHeight = 226;
  ctx.fillStyle = config.primaryColor || '#E30613';
  ctx.fillRect(0, 0, CARD_WIDTH, headerHeight);

  // 2.1 Logo in Header (Kích thước chuẩn: ngang 25mm x dọc 13mm ~ 295 x 154 px)
  const centerX = CARD_WIDTH / 2;
  const logoTargetW = 295; // 25mm ở 300 DPI
  const logoTargetH = 154; // 13mm ở 300 DPI
  const logoTopY = 10;

  if (config.customLogoUrl && !config.useDefaultLogo) {
    try {
      const logoImg = await loadImage(config.customLogoUrl);
      const scale = Math.min(logoTargetW / logoImg.width, logoTargetH / logoImg.height, 1);
      const lw = logoImg.width * scale;
      const lh = logoImg.height * scale;
      ctx.drawImage(logoImg, centerX - lw / 2, logoTopY + (logoTargetH - lh) / 2, lw, lh);
    } catch {
      drawSunhouseLogo(ctx, centerX, logoTopY, logoTargetW, logoTargetH);
    }
  } else {
    drawSunhouseLogo(ctx, centerX, logoTopY, logoTargetW, logoTargetH);
  }

  // 2.2 Header Text ("NHÀ MÁY SUNHOUSE BÌNH DƯƠNG")
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 34px Montserrat, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(config.headerTitle || 'NHÀ MÁY SUNHOUSE BÌNH DƯƠNG', centerX, 204);

  // 3. FOOTER - Red Strip
  const footerHeight = 46;
  ctx.fillStyle = config.primaryColor || '#E30613';
  ctx.fillRect(0, CARD_HEIGHT - footerHeight, CARD_WIDTH, footerHeight);

  // 4. WORK AREA ACCENT BAND AT BOTTOM RIGHT
  // - Kho: Màu cam (#E87722)
  // - Lắp ráp: Màu xanh nước biển (#0072CE)
  // - Cơ khí: Màu xanh lá cây (#16A34A)
  const areaColor = getAreaColor(employee.khuVuc, config.accentColor || '#E87722');
  const accentBandHeight = 78;
  const bandTopY = CARD_HEIGHT - footerHeight - accentBandHeight; // 650 - 46 - 78 = 526

  ctx.fillStyle = areaColor;
  ctx.beginPath();
  ctx.moveTo(480, CARD_HEIGHT - footerHeight);
  ctx.lineTo(580, bandTopY);
  ctx.lineTo(CARD_WIDTH, bandTopY);
  ctx.lineTo(CARD_WIDTH, CARD_HEIGHT - footerHeight);
  ctx.closePath();
  ctx.fill();

  // 5. EMPLOYEE PORTRAIT PHOTO (Left)
  const photoX = 65;
  const photoY = headerHeight + 26;
  const photoW = 230;
  const photoH = 290;

  if (employee.avatarUrl) {
    try {
      const avatar = await loadImage(employee.avatarUrl);
      // Draw image with object-fit: cover
      ctx.save();
      ctx.beginPath();
      ctx.rect(photoX, photoY, photoW, photoH);
      ctx.clip();

      const imgRatio = avatar.width / avatar.height;
      const targetRatio = photoW / photoH;
      let renderW = photoW;
      let renderH = photoH;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > targetRatio) {
        renderW = photoH * imgRatio;
        offsetX = (photoW - renderW) / 2;
      } else {
        renderH = photoW / imgRatio;
        offsetY = (photoH - renderH) / 2;
      }

      ctx.drawImage(avatar, photoX + offsetX, photoY + offsetY, renderW, renderH);
      ctx.restore();

      // Border around photo
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 2;
      ctx.strokeRect(photoX, photoY, photoW, photoH);
    } catch {
      const parts = employee.hoTen.trim().split(' ');
      const initials = parts.length > 1
        ? (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase()
        : employee.hoTen.slice(0, 2).toUpperCase();
      drawDefaultAvatar(ctx, photoX, photoY, photoW, photoH, initials);
    }
  } else {
    const parts = employee.hoTen.trim().split(' ');
    const initials = parts.length > 1
      ? (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase()
      : employee.hoTen.slice(0, 2).toUpperCase();
    drawDefaultAvatar(ctx, photoX, photoY, photoW, photoH, initials);
  }

  // 6. EMPLOYEE INFO (Middle)
  const infoX = photoX + photoW + 45;
  const infoY = photoY + 65;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Line 1: Full Name (Bold Black)
  ctx.fillStyle = config.textColor || '#141414';
  ctx.font = 'bold 44px Montserrat, Arial, sans-serif';
  ctx.fillText(employee.hoTen || 'Chưa đặt tên', infoX, infoY);

  // Line 2: Employee ID ("ID: 600000478")
  ctx.font = 'bold 36px Montserrat, Arial, sans-serif';
  ctx.fillText(`ID: ${employee.maNV || '000000'}`, infoX, infoY + 62);

  // Line 3: Position (Optional)
  if (config.showPosition && employee.viTri) {
    ctx.fillStyle = '#64748B';
    ctx.font = '500 26px Montserrat, Arial, sans-serif';
    ctx.fillText(`Vị trí: ${employee.viTri}`, infoX, infoY + 115);
  }

  // 7. TAB CHỮ "THỬ VIỆC" (Nằm góc trên bên phải, phía trên mã QR)
  if (config.showProbation) {
    ctx.save();
    const tabW = 168;
    const tabH = 46;
    const tabX = CARD_WIDTH - tabW - 28;
    const tabY = headerHeight + 22;

    // Hiệu ứng đổ bóng nhẹ
    ctx.shadowColor = 'rgba(227, 6, 19, 0.2)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;

    // Nền tab đỏ chuẩn nhận diện (#E30613)
    ctx.fillStyle = '#E30613';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(tabX, tabY, tabW, tabH, 6);
    } else {
      ctx.rect(tabX, tabY, tabW, tabH);
    }
    ctx.fill();

    // Viền trắng sắc nét
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Chữ THỬ VIỆC màu trắng in hoa đậm
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Montserrat, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('THỬ VIỆC', tabX + tabW / 2, tabY + tabH / 2 + 1);

    ctx.restore();
  }

  // 8. MÃ QR CODE NẰM Ở PHÍA TRÊN THANH MÀU (TRÊN NỀN TRẮNG CỦA THẺ)
  let qrPayload = employee.maNV || '000000';
  if (config.qrType === 'sunhouse_prefix') {
    qrPayload = `SUNHOUSE:${employee.maNV}`;
  } else if (config.qrType === 'custom_url') {
    qrPayload = `${config.customUrlPrefix}${employee.maNV}`;
  }

  try {
    const qrSize = 140;
    const qrX = CARD_WIDTH - qrSize - 28;
    // Nằm ở phía trên thanh màu, cách mép trên thanh màu khoảng 8px trên nền trắng
    const qrY = bandTopY - qrSize - 8;

    // Generate QR as data URL with clean white background
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: qrSize,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    const qrImg = await loadImage(qrDataUrl);
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } catch (err) {
    console.warn('Failed to render QR Code:', err);
  }

  // 8. CARD CUTTING BOUNDARY
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
}

/**
 * Returns a Data URL for a card
 */
export async function generateCardDataUrl(
  employee: Employee,
  config: CardDesignConfig
): Promise<string> {
  const canvas = document.createElement('canvas');
  await renderCardToCanvas(canvas, employee, config);
  return canvas.toDataURL('image/png');
}
