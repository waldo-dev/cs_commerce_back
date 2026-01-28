'use strict';

const db = require('../models');

const getAllPayments = async (req, res) => {
  try {
    const { order_id } = req.query;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: 'order_id es requerido'
      });
    }

    const order = await db.Order.findByPk(order_id);

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

    const payments = await db.Payment.findAll({
      where: { order_id },
      include: [{
        model: db.Order,
        include: [{
          model: db.Store,
          attributes: ['id', 'name']
        }]
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { payments }
    });
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pagos',
      error: error.message
    });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await db.Payment.findByPk(id, {
      include: [{
        model: db.Order,
        include: [{
          model: db.Store,
          attributes: ['id', 'name']
        }]
      }]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    if (req.userRole !== 'administrador de plataforma') {
      const store = await db.Store.findOne({
        where: { id: payment.Order.store_id, company_id: req.companyId }
      });

      if (!store) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este pago'
        });
      }
    }

    res.json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    console.error('Error al obtener pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pago',
      error: error.message
    });
  }
};

const createPayment = async (req, res) => {
  try {
    const { order_id, provider, amount, status } = req.body;

    const order = await db.Order.findByPk(order_id);

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

    const payment = await db.Payment.create({
      order_id,
      provider,
      amount,
      status: status || 'pending'
    });

    const paymentWithOrder = await db.Payment.findByPk(payment.id, {
      include: [{
        model: db.Order,
        include: [{
          model: db.Store,
          attributes: ['id', 'name']
        }]
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Pago creado exitosamente',
      data: { payment: paymentWithOrder }
    });
  } catch (error) {
    console.error('Error al crear pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear pago',
      error: error.message
    });
  }
};

const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { provider, amount, status } = req.body;

    const payment = await db.Payment.findByPk(id, {
      include: [{
        model: db.Order
      }]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    if (req.userRole !== 'administrador de plataforma') {
      const store = await db.Store.findOne({
        where: { id: payment.Order.store_id, company_id: req.companyId }
      });

      if (!store) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este pago'
        });
      }
    }

    if (provider) payment.provider = provider;
    if (amount !== undefined) payment.amount = amount;
    if (status) payment.status = status;

    await payment.save();

    const updatedPayment = await db.Payment.findByPk(payment.id, {
      include: [{
        model: db.Order,
        include: [{
          model: db.Store,
          attributes: ['id', 'name']
        }]
      }]
    });

    res.json({
      success: true,
      message: 'Pago actualizado exitosamente',
      data: { payment: updatedPayment }
    });
  } catch (error) {
    console.error('Error al actualizar pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar pago',
      error: error.message
    });
  }
};

const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await db.Payment.findByPk(id, {
      include: [{
        model: db.Order
      }]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    if (req.userRole !== 'administrador de plataforma') {
      const store = await db.Store.findOne({
        where: { id: payment.Order.store_id, company_id: req.companyId }
      });

      if (!store) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este pago'
        });
      }
    }

    await payment.destroy();

    res.json({
      success: true,
      message: 'Pago eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar pago',
      error: error.message
    });
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment
};

