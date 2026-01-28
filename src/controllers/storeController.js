'use strict';

const db = require('../models');

const getAllStores = async (req, res) => {
  try {
    const whereClause = {};

    if (req.userRole !== 'administrador de plataforma') {
      whereClause.company_id = req.companyId;
    }

    const stores = await db.Store.findAll({
      where: whereClause,
      include: [{
        model: db.Company,
        attributes: ['id', 'name', 'plan']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { stores }
    });
  } catch (error) {
    console.error('Error al obtener tiendas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tiendas',
      error: error.message
    });
  }
};

const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const whereClause = { id };

    if (req.userRole !== 'administrador de plataforma') {
      whereClause.company_id = req.companyId;
    }

    const store = await db.Store.findOne({
      where: whereClause,
      include: [{
        model: db.Company,
        attributes: ['id', 'name', 'plan']
      }]
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Tienda no encontrada'
      });
    }

    res.json({
      success: true,
      data: { store }
    });
  } catch (error) {
    console.error('Error al obtener tienda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tienda',
      error: error.message
    });
  }
};

const createStore = async (req, res) => {
  try {
    const { name, domain, theme } = req.body;

    const store = await db.Store.create({
      name,
      domain,
      theme,
      company_id: req.companyId
    }, {
      include: [{
        model: db.Company,
        attributes: ['id', 'name', 'plan']
      }]
    });

    const storeWithCompany = await db.Store.findByPk(store.id, {
      include: [{
        model: db.Company,
        attributes: ['id', 'name', 'plan']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Tienda creada exitosamente',
      data: { store: storeWithCompany }
    });
  } catch (error) {
    console.error('Error al crear tienda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear tienda',
      error: error.message
    });
  }
};

const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, domain, theme } = req.body;

    const whereClause = { id };
    if (req.userRole !== 'administrador de plataforma') {
      whereClause.company_id = req.companyId;
    }

    const store = await db.Store.findOne({ where: whereClause });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Tienda no encontrada'
      });
    }

    if (name) store.name = name;
    if (domain !== undefined) store.domain = domain;
    if (theme !== undefined) store.theme = theme;

    await store.save();

    const updatedStore = await db.Store.findByPk(store.id, {
      include: [{
        model: db.Company,
        attributes: ['id', 'name', 'plan']
      }]
    });

    res.json({
      success: true,
      message: 'Tienda actualizada exitosamente',
      data: { store: updatedStore }
    });
  } catch (error) {
    console.error('Error al actualizar tienda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar tienda',
      error: error.message
    });
  }
};

const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    const whereClause = { id };
    if (req.userRole !== 'administrador de plataforma') {
      whereClause.company_id = req.companyId;
    }

    const store = await db.Store.findOne({ where: whereClause });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Tienda no encontrada'
      });
    }

    await store.destroy();

    res.json({
      success: true,
      message: 'Tienda eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar tienda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar tienda',
      error: error.message
    });
  }
};

module.exports = {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore
};

