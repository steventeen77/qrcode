import './style.css';
import jsQR from 'jsqr';
import QRCode from 'easyqrcodejs';

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const statusMsg = document.getElementById('status');
const resultSection = document.getElementById('result-section');
const newQrContainer = document.getElementById('new-qrcode');
const scannedUrlCode = document.getElementById('scanned-url');
const resetBtn = document.getElementById('reset-btn');
const downloadBtn = document.getElementById('download-btn');
const qrCanvas = document.getElementById('qr-canvas');
const ctx = qrCanvas.getContext('2d');

// New Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const manualUrlInput = document.getElementById('manual-url');
const generateBtn = document.getElementById('generate-btn');
const heroContent = document.querySelector('.hero-content');

// --- Events ---

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
});

// Manual Generate
generateBtn.addEventListener('click', () => {
    const url = manualUrlInput.value.trim();
    if (!url) {
        alert('Tolong masukkan URL yang valid.');
        return;
    }
    generateBrandedQR(url);
});

// File input change
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

// Reset
resetBtn.addEventListener('click', () => {
    resultSection.classList.add('hidden');
    heroContent.classList.remove('hidden');
    fileInput.value = '';
    manualUrlInput.value = '';
});

// Download
downloadBtn.addEventListener('click', () => {
    const img = newQrContainer.querySelector('img');
    const canvas = newQrContainer.querySelector('canvas');
    let qrData;
    
    if (img && img.src) {
        qrData = img.src;
    } else if (canvas) {
        qrData = canvas.toDataURL('image/png');
    }

    if (qrData) {
        const link = document.createElement('a');
        link.download = 'QRCODE_ASN_MINSEL.png';
        link.href = qrData;
        link.click();
    } else {
        alert('QR Code belum siap atau gagal dimuat untuk diunduh.');
    }
});

// --- Logic ---

// Add back dropZone listeners that were accidentally removed in previous step
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
});

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Tolong unggah file gambar yang valid.');
        return;
    }

    showStatus(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // Process Image to Find QR
            qrCanvas.width = img.width;
            qrCanvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "attemptBoth",
            });

            if (code) {
                generateBrandedQR(code.data);
            } else {
                showStatus(false);
                alert('QR Code tidak ditemukan dalam gambar. Pastikan gambar cukup terang dan QR Code terlihat jelas.');
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function generateBrandedQR(url) {
    showStatus(true);
    statusMsg.querySelector('p').innerText = 'Membuat QR Code...';
    
    // Clear previous QR
    newQrContainer.innerHTML = '';
    
    // Scanned URL display
    scannedUrlCode.innerText = url;

    // Generate New QR with Logo
    const options = {
        text: url,
        width: 600,
        height: 600,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H, // Required for logo usage
        
        // Logo options
        logo: "/logo-minsel.png",
        logoWidth: 160, 
        logoHeight: 160,
        logoBackgroundColor: '#ffffff',
        logoBackgroundTransparent: false,
        
        // Aesthetics
        dotScale: 1, 
        quietZone: 40, 
        quietZoneColor: "rgba(0,0,0,0)"
    };

    // Instantiate QRCode
    new QRCode(newQrContainer, options);

    // Wait for generation to finish
    setTimeout(() => {
        showStatus(false);
        heroContent.classList.add('hidden');
        resultSection.classList.remove('hidden');
    }, 800);
}

function showStatus(show) {
    if (show) {
        statusMsg.classList.remove('hidden');
        document.getElementById('manual-tab').classList.add('hidden');
        document.getElementById('verify-tab').classList.add('hidden');
        document.querySelector('.tabs').classList.add('hidden');
    } else {
        statusMsg.classList.add('hidden');
        const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
        document.getElementById(`${activeTab}-tab`).classList.remove('hidden');
        document.querySelector('.tabs').classList.remove('hidden');
    }
}
