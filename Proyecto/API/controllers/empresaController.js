const pool = require('../database');
const { upload, uploadToDrive } = require('../multerConfig');

// Obtener todas las empresas activas
const getEmpresasActivas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_empresa, Nombre_Empresa, url_logotipo FROM Empresa WHERE estado = 1'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener empresas activas' });
  }
};

// Obtener todas las empresas inactivas
const getEmpresasInactivas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_empresa, Nombre_Empresa, url_logotipo, motivo_de_baja, fecha_de_baja FROM Empresa WHERE estado = 0'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener empresas inactivas' });
  }
};

// Crear una nueva empresa
const createEmpresa = async (req, res) => {
  const { Nombre_Empresa, id_usuario } = req.body;
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Se requiere un logotipo' });
    }

    // Subir a Google Drive
    const driveLink = await uploadToDrive(req.file.path, req.file.filename);

    // Resto de tu lógica...
    const [result] = await pool.query(
      'INSERT INTO Empresa (Nombre_Empresa, url_logotipo, id_usuario, estado) VALUES (?, ?, ?, 1)',
      [Nombre_Empresa, driveLink, id_usuario]
    );

    res.status(201).json({
      id_empresa: result.insertId,
      Nombre_Empresa,
      url_logotipo: driveLink,
      id_usuario,
      estado: 1
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear empresa' });
  }
};

// Actualizar una empresa
const updateEmpresa = async (req, res) => {
  const { id_empresa } = req.params;
  const { Nombre_Empresa } = req.body;
  const url_logotipo = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Obtener la empresa actual para mantener el logo si no se sube uno nuevo
    const [empresa] = await pool.query('SELECT url_logotipo FROM Empresa WHERE id_empresa = ?', [id_empresa]);
    if (empresa.length === 0) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    const logoFinal = url_logotipo || empresa[0].url_logotipo;

    await pool.query(
      'UPDATE Empresa SET Nombre_Empresa = ?, url_logotipo = ? WHERE id_empresa = ?',
      [Nombre_Empresa, logoFinal, id_empresa]
    );

    res.json({
      id_empresa,
      Nombre_Empresa,
      url_logotipo: logoFinal,
      message: 'Empresa actualizada correctamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar empresa' });
  }
};

// Dar de baja a una empresa
const darDeBajaEmpresa = async (req, res) => {
  const { id_empresa } = req.params;
  const { fecha_de_baja, motivo_de_baja } = req.body;

  try {
    const [empresa] = await pool.query('SELECT * FROM Empresa WHERE id_empresa = ?', [id_empresa]);
    if (empresa.length === 0) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    await pool.query(
      'UPDATE Empresa SET estado = 0, fecha_de_baja = ?, motivo_de_baja = ? WHERE id_empresa = ?',
      [fecha_de_baja, motivo_de_baja, id_empresa]
    );

    res.json({ message: 'Empresa dada de baja correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al dar de baja la empresa' });
  }
};

// Obtener usuarios para select
const getUsuariosForSelect = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_usuario, Nombre_Usuario FROM Usuario WHERE Estado = 1'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// Obtener empresas para select
const getEmpresasForSelect = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_empresa, Nombre_Empresa FROM Empresa WHERE estado = 1'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener empresas' });
  }
};

module.exports = {
  getEmpresasActivas,
  getEmpresasInactivas,
  createEmpresa: [upload.single('clientLogo'), createEmpresa],
  updateEmpresa: [upload.single('nuevoLogoCli'), updateEmpresa],
  darDeBajaEmpresa,
  getUsuariosForSelect,
  getEmpresasForSelect
};