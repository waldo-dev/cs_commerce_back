'use strict';

const db = require('../models');
const { Op } = require('sequelize');

const getAllOrders = async (req, res) => {
  try {
    const { store_id, status, payment_status, customer_id } = req.query;

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

    if (status) whereClause.status = status;
    if (payment_status) whereClause.payment_status = payment_status;
    if (customer_id) whereClause.customer_id = customer_id;

    const orders = await db.Order.findAll({
      where: whereClause,
      include: [
        {
          model: db.Store,
          attributes: ['id', 'name']
        },
        {
          model: db.Customer,
          attributes: ['id', 'name', 'email']
        },
        {
          model: db.OrderItem,
          include: [{
            model: db.Product,
            attributes: ['id', 'name', 'price']
          }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener órdenes',
      error: error.message
    });
  }
};

const getOrderById = async (req, res) => {
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

    const order = await db.Order.findOne({
      where: whereClause,
      include: [
        {
          model: db.Store,
          attributes: ['id', 'name']
        },
        {
          model: db.Customer,
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: db.OrderItem,
          include: [{
            model: db.Product,
            attributes: ['id', 'name', 'price', 'image']
          }]
        },
        {
          model: db.Payment
        },
        {
          model: db.Shipment
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener orden',
      error: error.message
    });
  }
};

const createOrder = async (req, res) => {
  try {
    const { store_id, customer_id, items, status, payment_status } = req.body;

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

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La orden debe tener al menos un item'
      });
    }

    let total = 0;
    for (const item of items) {
      const product = await db.Product.findOne({
        where: { id: item.product_id, store_id }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Producto ${item.product_id} no encontrado en esta tienda`
        });
      }

      total += parseFloat(product.price) * (item.quantity || 1);
    }

    const order = await db.Order.create({
      store_id,
      customer_id,
      total,
      status: status || 'pending',
      payment_status: payment_status || 'unpaid'
    });

    const orderItems = await db.OrderItem.bulkCreate(
      items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity || 1,
        price: item.price
      }))
    );

    const orderWithRelations = await db.Order.findByPk(order.id, {
      include: [
        {
          model: db.Store,
          attributes: ['id', 'name']
        },
        {
          model: db.Customer,
          attributes: ['id', 'name', 'email']
        },
        {
          model: db.OrderItem,
          include: [{
            model: db.Product,
            attributes: ['id', 'name', 'price']
          }]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: { order: orderWithRelations }
    });
  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear orden',
      error: error.message
    });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status, customer_id } = req.body;

    const order = await db.Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    if (req.userRole !== 'administrador de plataforma') {
      const store = await db.Store.findOne({
        where: { id: order.store_id, company_id: req.companyId }
      });

      if (!store) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta orden'
        });
      }
    }

    if (status) order.status = status;
    if (payment_status) order.payment_status = payment_status;
    if (customer_id !== undefined) order.customer_id = customer_id;

    await order.save();

    const updatedOrder = await db.Order.findByPk(order.id, {
      include: [
        {
          model: db.Store,
          attributes: ['id', 'name']
        },
        {
          model: db.Customer,
          attributes: ['id', 'name', 'email']
        },
        {
          model: db.OrderItem,
          include: [{
            model: db.Product,
            attributes: ['id', 'name', 'price']
          }]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Orden actualizada exitosamente',
      data: { order: updatedOrder }
    });
  } catch (error) {
    console.error('Error al actualizar orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar orden',
      error: error.message
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await db.Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    if (req.userRole !== 'administrador de plataforma') {
      const store = await db.Store.findOne({
        where: { id: order.store_id, company_id: req.companyId }
      });

      if (!store) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta orden'
        });
      }
    }

    await order.destroy();

    res.json({
      success: true,
      message: 'Orden eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar orden',
      error: error.message
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
};

