'use strict';

const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const db = require('../models');

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

    const decoded = verifyToken(token);
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
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};

