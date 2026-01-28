'use strict';

const db = require('../models');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { name, email, password, company_id, role } = req.body;

    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    const company = await db.Company.findByPk(company_id);
    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'La compañía no existe'
      });
    }

    const user = await db.User.create({
      name,
      email,
      password,
      company_id,
      role: role || 'cliente'
    });

    const userWithCompany = await db.User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: db.Company,
        attributes: ['id', 'name', 'plan']
      }]
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: userWithCompany,
        token
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.User.findOne({
      where: { email },
      include: [{
        model: db.Company,
        attributes: ['id', 'name', 'plan']
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id
    });

    const userData = user.toJSON();
    delete userData.password;

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.userId, {
      attributes: { exclude: ['password'] },
      include: [{
        model: db.Company,
        attributes: ['id', 'name', 'plan', 'email']
      }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await db.User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (email && email !== user.email) {
      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está en uso'
        });
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    const updatedUser = await db.User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: db.Company,
        attributes: ['id', 'name', 'plan']
      }]
    });

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await db.User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: error.message
    });
  }
};

const verifyToken = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Token válido',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar token',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  verifyToken
};

