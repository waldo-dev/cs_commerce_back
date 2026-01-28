'use strict';

const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const db = require('../models');

/**
 * Middleware de autenticación
 * Verifica que el usuario tenga un token válido
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
    }

    // Verificar y decodificar el token
    const decoded = verifyToken(token);

    // Buscar el usuario en la base de datos
    const user = await db.User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: db.Company,
        attributes: ['id', 'name', 'plan']
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Agregar información del usuario al request
    req.user = user;
    req.userId = user.id;
    req.companyId = user.company_id;
    req.userRole = user.role;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Token inválido o expirado'
    });
  }
};

/**
 * Middleware de autorización por roles
 * Verifica que el usuario tenga uno de los roles permitidos
 * @param {...string} allowedRoles - Roles permitidos
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
};

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, pero agrega el usuario si existe
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      const user = await db.User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
        include: [{
          model: db.Company,
          attributes: ['id', 'name', 'plan']
        }]
      });

      if (user) {
        req.user = user;
        req.userId = user.id;
        req.companyId = user.company_id;
        req.userRole = user.role;
      }
    }
  } catch (error) {
    // Ignorar errores en autenticación opcional
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};



