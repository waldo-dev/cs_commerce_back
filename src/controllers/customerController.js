'use strict';

const db = require('../models');
const { Op } = require('sequelize');

const getAllCustomers = async (req, res) => {
  try {
    const { store_id, search } = req.query;

    if (!store_id) {
      return res.status(400).json({
        success: false,
        message: 'store_id es requerido'
      });
    }

    const whereClause = { store_id };

    if (req.userRole !== 'administrador de plataforma') {
      const store = await db.Store.findOne({
        where: { id: store_id, company_id: req.companyId }
      });

      if (!store) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta tienda'
        });
      }
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const customers = await db.Customer.findAll({
      where: whereClause,
      include: [{
        model: db.Store,
        attributes: ['id', 'name']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { customers }
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes',
      error: error.message
    });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const { store_id } = req.query;

    if (!store_id) {
      return res.status(400).json({
        success: false,
        message: 'store_id es requerido'
      });
    }

    const whereClause = { id, store_id };

    if (req.userRole !== 'administrador de plataforma') {
      const store = await db.Store.findOne({
        where: { id: store_id, company_id: req.companyId }
      });

      if (!store) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta tienda'
        });
      }
    }

    const customer = await db.Customer.findOne({
      where: whereClause,
      include: [{
        model: db.Store,
        attributes: ['id', 'name']
      }]
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      data: { customer }
    });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cliente',
      error: error.message
    });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { store_id, name, email, phone } = req.body;

    if (req.userRole !== 'administrador de plataforma') {
      const store = await db.Store.findOne({
        where: { id: store_id, company_id: req.companyId }
      });

      if (!store) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta tienda'
        });
      }
    }

    const customer = await db.Customer.create({
      store_id,
      name,
      email,
      phone
    });

    const customerWithStore = await db.Customer.findByPk(customer.id, {
      include: [{
        model: db.Store,
        attributes: ['id', 'name']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: { customer: customerWithStore }
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cliente',
      error: error.message
    });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, store_id } = req.body;

    const customer = await db.Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    if (req.userRole !== 'administrador de plataforma') {
      const store = await db.Store.findOne({
        where: { id: customer.store_id, company_id: req.companyId }
      });

      if (!store) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este cliente'
        });
      }

      if (store_id && store_id !== customer.store_id) {
        const newStore = await db.Store.findOne({
          where: { id: store_id, company_id: req.companyId }
        });

        if (!newStore) {
          return res.status(403).json({
            success: false,
            message: 'No tienes acceso a la nueva tienda'
          });
        }
      }
    }

    if (name !== undefined) customer.name = name;
    if (email !== undefined) customer.email = email;
    if (phone !== undefined) customer.phone = phone;
    if (store_id) customer.store_id = store_id;

    await customer.save();

    const updatedCustomer = await db.Customer.findByPk(customer.id, {
      include: [{
        model: db.Store,
        attributes: ['id', 'name']
      }]
    });

    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: { customer: updatedCustomer }
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cliente',
      error: error.message
    });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await db.Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    if (req.userRole !== 'administrador de plataforma') {
      const store = await db.Store.findOne({
        where: { id: customer.store_id, company_id: req.companyId }
      });

      if (!store) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este cliente'
        });
      }
    }

    await customer.destroy();

    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cliente',
      error: error.message
    });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};

