'use strict';

const db = require('../models');

const getAllRoles = async (req, res) => {
  try {
    const roles = await db.Role.findAll({
      order: [['id', 'ASC']]
    });

    res.json({
      success: true,
      data: { roles }
    });
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener roles',
      error: error.message
    });
  }
};

const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await db.Role.findByPk(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role no encontrado'
      });
    }

    res.json({
      success: true,
      data: { role }
    });
  } catch (error) {
    console.error('Error al obtener role:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener role',
      error: error.message
    });
  }
};

const createRole = async (req, res) => {
  try {
    const { value } = req.body;

    const existingRole = await db.Role.findOne({ where: { value } });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'El role ya existe'
      });
    }

    const role = await db.Role.create({ value });

    res.status(201).json({
      success: true,
      message: 'Role creado exitosamente',
      data: { role }
    });
  } catch (error) {
    console.error('Error al crear role:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear role',
      error: error.message
    });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    const role = await db.Role.findByPk(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role no encontrado'
      });
    }

    if (value && value !== role.value) {
      const existingRole = await db.Role.findOne({ where: { value } });
      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'El value ya está en uso'
        });
      }
      role.value = value;
    }

    await role.save();

    res.json({
      success: true,
      message: 'Role actualizado exitosamente',
      data: { role }
    });
  } catch (error) {
    console.error('Error al actualizar role:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar role',
      error: error.message
    });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await db.Role.findByPk(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role no encontrado'
      });
    }

    await role.destroy();

    res.json({
      success: true,
      message: 'Role eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar role:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar role',
      error: error.message
    });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
};

