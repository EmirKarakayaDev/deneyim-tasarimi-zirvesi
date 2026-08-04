document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('bdo-canvas');
  const ctx = canvas.getContext('2d');
  const frameHit = document.getElementById('bdo-frame-hit');
  const fileInput = document.getElementById('bdo-file-input');
  const zoomSlider = document.getElementById('bdo-zoom-slider');
  const zoomInBtn = document.getElementById('bdo-zoom-in');
  const zoomOutBtn = document.getElementById('bdo-zoom-out');
  const resetBtn = document.getElementById('bdo-reset');
  const downloadBtn = document.getElementById('bdo-download');
  const nameInput = document.getElementById('bdo-name-input');

  const CANVAS_W = canvas.width;
  const CANVAS_H = canvas.height;
  const FRAME_X = 250;
  const FRAME_Y = 281;
  const FRAME_W = 591;
  const FRAME_H = 579;
  const FRAME_CX = FRAME_X + FRAME_W / 2;
  const FRAME_CY = FRAME_Y + FRAME_H / 2;
  const FRAME_RADII = { tl: 44, tr: 44, br: 44, bl: 0 };
  const NAME_Y = 930;

  const frameTemplate = new Image();
  frameTemplate.src = '/assets/img/ben-de-oradayim-cerceve.png';

  let userImg = null;
  let zoom = 1;
  let baseScale = 1;
  let offsetX = 0;
  let offsetY = 0;

  let dragging = false;
  let didDrag = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartOffsetX = 0;
  let dragStartOffsetY = 0;

  function framePath(x, y, w, h) {
    const { tl, tr, br, bl } = FRAME_RADII;
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + w - tr, y);
    ctx.arcTo(x + w, y, x + w, y + tr, tr);
    ctx.lineTo(x + w, y + h - br);
    ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
    ctx.lineTo(x + bl, y + h);
    ctx.arcTo(x, y + h, x, y + h - bl, bl);
    ctx.lineTo(x, y + tl);
    ctx.arcTo(x, y, x + tl, y, tl);
    ctx.closePath();
  }

  function clampOffsets() {
    const scale = baseScale * zoom;
    const scaledW = userImg.width * scale;
    const scaledH = userImg.height * scale;
    const maxOffsetX = Math.max(0, (scaledW - FRAME_W) / 2);
    const maxOffsetY = Math.max(0, (scaledH - FRAME_H) / 2);
    offsetX = Math.min(maxOffsetX, Math.max(-maxOffsetX, offsetX));
    offsetY = Math.min(maxOffsetY, Math.max(-maxOffsetY, offsetY));
  }

  function draw(isExport) {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    if (frameTemplate.complete && frameTemplate.naturalWidth) {
      ctx.drawImage(frameTemplate, 0, 0, CANVAS_W, CANVAS_H);
    }

    if (userImg) {
      const scale = baseScale * zoom;
      const drawW = userImg.width * scale;
      const drawH = userImg.height * scale;

      ctx.save();
      framePath(FRAME_X, FRAME_Y, FRAME_W, FRAME_H);
      ctx.clip();
      ctx.drawImage(
        userImg,
        FRAME_CX + offsetX - drawW / 2,
        FRAME_CY + offsetY - drawH / 2,
        drawW,
        drawH
      );
      ctx.restore();
    } else {
      ctx.save();
      framePath(FRAME_X, FRAME_Y, FRAME_W, FRAME_H);
      ctx.fillStyle = 'rgba(21, 23, 31, 0.45)';
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 56px Poppins, Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', FRAME_CX, FRAME_CY - 26);
      ctx.font = '600 28px Inter, sans-serif';
      ctx.fillText('Fotoğrafını Ekle', FRAME_CX, FRAME_CY + 36);
    }

    const name = nameInput.value.trim();
    if (name || !isExport) {
      ctx.save();
      ctx.fillStyle = name ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
      ctx.font = '600 44px Poppins, Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name || 'Adınız Soyadınız', FRAME_CX, NAME_Y);
      ctx.restore();
    }
  }

  function loadImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        userImg = img;
        baseScale = Math.max(FRAME_W / img.width, FRAME_H / img.height);
        zoom = 1;
        zoomSlider.value = 100;
        offsetX = 0;
        offsetY = 0;
        downloadBtn.disabled = false;
        draw();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  frameTemplate.onload = () => draw();
  draw();

  nameInput.addEventListener('input', () => draw());

  function canvasScaleFactor() {
    return CANVAS_W / canvas.getBoundingClientRect().width;
  }

  frameHit.addEventListener('click', () => {
    if (didDrag) {
      didDrag = false;
      return;
    }
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    loadImageFile(e.target.files[0]);
  });

  frameHit.addEventListener('dragover', (e) => e.preventDefault());
  frameHit.addEventListener('drop', (e) => {
    e.preventDefault();
    loadImageFile(e.dataTransfer.files[0]);
  });

  function pointerDown(e) {
    if (!userImg) return;
    const point = e.touches ? e.touches[0] : e;
    dragging = true;
    didDrag = false;
    dragStartX = point.clientX;
    dragStartY = point.clientY;
    dragStartOffsetX = offsetX;
    dragStartOffsetY = offsetY;
  }

  function pointerMove(e) {
    if (!dragging || !userImg) return;
    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    const dx = point.clientX - dragStartX;
    const dy = point.clientY - dragStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag = true;
    const factor = canvasScaleFactor();
    offsetX = dragStartOffsetX + dx * factor;
    offsetY = dragStartOffsetY + dy * factor;
    clampOffsets();
    draw();
  }

  function pointerUp() {
    dragging = false;
  }

  frameHit.addEventListener('mouseenter', () => frameHit.classList.add('is-hover-frame'));
  frameHit.addEventListener('mouseleave', () => frameHit.classList.remove('is-hover-frame'));

  frameHit.addEventListener('mousedown', pointerDown);
  window.addEventListener('mousemove', pointerMove);
  window.addEventListener('mouseup', pointerUp);

  frameHit.addEventListener('touchstart', pointerDown, { passive: true });
  frameHit.addEventListener('touchmove', pointerMove, { passive: false });
  frameHit.addEventListener('touchend', pointerUp);

  function setZoom(value) {
    if (!userImg) return;
    zoom = Math.min(3, Math.max(1, value));
    zoomSlider.value = Math.round(zoom * 100);
    clampOffsets();
    draw();
  }

  zoomSlider.addEventListener('input', () => setZoom(zoomSlider.value / 100));
  zoomInBtn.addEventListener('click', () => setZoom(zoom + 0.1));
  zoomOutBtn.addEventListener('click', () => setZoom(zoom - 0.1));

  resetBtn.addEventListener('click', () => {
    userImg = null;
    zoom = 1;
    zoomSlider.value = 100;
    offsetX = 0;
    offsetY = 0;
    downloadBtn.disabled = true;
    fileInput.value = '';
    nameInput.value = '';
    draw();
  });

  function isIOS() {
    return /iP(hone|od|ad)/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  downloadBtn.addEventListener('click', () => {
    if (!userImg) return;
    draw(true);
    const dataUrl = canvas.toDataURL('image/png');

    if (isIOS()) {
      const win = window.open();
      if (win) {
        win.document.write(
          '<title>Ben de Varım</title>' +
          '<body style="margin:0;background:#15171f;">' +
          '<p style="font-family:sans-serif;color:#fff;text-align:center;padding:16px;margin:0;">Görsele uzun basıp "Fotoğrafları Kaydet" seçeneğini kullan.</p>' +
          '<img src="' + dataUrl + '" style="display:block;width:100%;height:auto;">' +
          '</body>'
        );
      }
    } else {
      const link = document.createElement('a');
      link.download = 'ben-de-oradayim.png';
      link.href = dataUrl;
      link.click();
    }
    draw();
  });
});
