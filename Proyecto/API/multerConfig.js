const { google } = require('googleapis');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Google Drive
const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json', // Archivo de credenciales de Google Cloud
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

// Configuración temporal de Multer para guardar archivos localmente antes de subirlos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'temp_uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF)'));
  }
});

// Función para subir a Google Drive
const uploadToDrive = async (filePath, fileName) => {
  try {
    const fileMetadata = {
      name: fileName,
      parents: ['1nPwNrvMtuf_hWnNY-IfuLL82qPCk6ESj'], // Reemplaza con el ID de tu carpeta en Drive
    };

    const media = {
      mimeType: 'image/jpeg',
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id,webViewLink,webContentLink',
    });

    // Hacer el archivo público (opcional)
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Eliminar el archivo temporal
    fs.unlinkSync(filePath);

    return response.data.webViewLink || response.data.webContentLink;
  } catch (error) {
    console.error('Error al subir a Google Drive:', error);
    throw error;
  }
};

module.exports = {
  upload,
  uploadToDrive
};