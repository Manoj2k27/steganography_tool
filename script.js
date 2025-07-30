const originalCanvas = document.getElementById('originalCanvas');
const resultCanvas = document.getElementById('resultCanvas');
const originalCtx = originalCanvas.getContext('2d');
const resultCtx = resultCanvas.getContext('2d');
let imageLoaded = false;

document.getElementById('imageInput').addEventListener('change', function (e) {
  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      originalCtx.drawImage(img, 0, 0, 128, 128);
      imageLoaded = true;
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});

function setMSB(value, bit) {
  value = value & 0x7F;
  if (bit === '1') value = value | 0x80;
  return value;
}

function getMSB(value) {
  return (value & 0x80) ? '1' : '0';
}

function encrypt() {
  if (!imageLoaded) {
    alert("Please upload an image first.");
    return;
  }

  const char = document.getElementById('charInput').value;
  if (char.length !== 1) {
    alert("Enter exactly 1 character.");
    return;
  }

  const binary = char.charCodeAt(0).toString(2).padStart(8, '0');
  const imageData = originalCtx.getImageData(0, 0, 128, 128);
  const data = imageData.data;

  for (let i = 0; i < 8; i++) {
    const pixelIndex = i * 4;
    const original = data[pixelIndex];
    data[pixelIndex] = setMSB(original, binary[i]);
  }

  resultCtx.putImageData(imageData, 0, 0);
  alert("Character embedded!");
}

function decrypt() {
  if (!imageLoaded) {
    alert("Please upload an image first.");
    return;
  }

  const imageData = resultCtx.getImageData(0, 0, 128, 128);
  const data = imageData.data;
  let bits = "";

  for (let i = 0; i < 8; i++) {
    const pixelIndex = i * 4;
    bits += getMSB(data[pixelIndex]);
  }

  const charCode = parseInt(bits, 2);
  const character = String.fromCharCode(charCode);
  if (character && !isNaN(charCode)) {
    document.getElementById('outputChar').innerText = `Extracted Character: '${character}'`;
  } else {
    document.getElementById('outputChar').innerText = `No character found.`;
  }
}

function downloadStego() {
  const link = document.createElement('a');
  link.download = 'stego-image.png';
  link.href = resultCanvas.toDataURL();
  link.click();
}

function resetAll() {
  originalCtx.clearRect(0, 0, 128, 128);
  resultCtx.clearRect(0, 0, 128, 128);
  document.getElementById('imageInput').value = '';
  document.getElementById('charInput').value = '';
  document.getElementById('outputChar').innerText = '';
  imageLoaded = false;
}
