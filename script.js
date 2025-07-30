const originalCanvas = document.getElementById('originalCanvas');
const resultCanvas = document.getElementById('resultCanvas');
const originalCtx = originalCanvas.getContext('2d');
const resultCtx = resultCanvas.getContext('2d');
const outputChar = document.getElementById('outputChar');

let imageLoaded = false;

document.getElementById('uploadImage').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      originalCtx.drawImage(img, 0, 0, 128, 128);
      imageLoaded = true;
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

function encrypt() {
  if (!imageLoaded) {
    alert('Please upload an image first!');
    return;
  }

  const char = document.getElementById('charInput').value;
  if (char.length !== 1) {
    alert('Please enter exactly one character.');
    return;
  }

  const charCode = char.charCodeAt(0); // 8 bits
  const imageData = originalCtx.getImageData(0, 0, 128, 128);
  const data = imageData.data;

  for (let i = 0; i < 8; i++) {
    const bit = (charCode >> (7 - i)) & 1;
    if (bit === 0) {
      data[i * 4] = data[i * 4] & 0b01111111; // clear MSB
    } else {
      data[i * 4] = data[i * 4] | 0b10000000; // set MSB
    }
  }

  resultCtx.putImageData(imageData, 0, 0);
  outputChar.textContent = 'Character embedded successfully!';
}

function decrypt() {
  const imageData = resultCtx.getImageData(0, 0, 128, 128);
  const data = imageData.data;
  let charCode = 0;

  for (let i = 0; i < 8; i++) {
    const msb = (data[i * 4] >> 7) & 1;
    charCode |= (msb << (7 - i));
  }

  const char = String.fromCharCode(charCode);
  outputChar.textContent = `Decrypted Character: ${char}`;
}

function downloadImage() {
  const link = document.createElement('a');
  link.download = 'encrypted_image.png';
  link.href = resultCanvas.toDataURL();
  link.click();
}

function resetCanvas() {
  originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
  resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
  outputChar.textContent = '';
  document.getElementById('charInput').value = '';
  document.getElementById('uploadImage').value = '';
  imageLoaded = false;
}
