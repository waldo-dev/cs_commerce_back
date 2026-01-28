'use strict';

const db = require('../models');

const getAllShipments = async (req, res) => {
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

    const shipments = await db.Shipment.findAll({
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
      data: { shipments }
    });
  } catch (error) {
    console.error('Error al obtener envíos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener envíos',
      error: error.message
    });
  }
};

const getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const shipment = await db.Shipment.findByPk(id, {
      include: [{
        model: db.Order,
        include: [{
          model: db.Store,
          attributes: ['id', 'name']
        }]
      }]
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Envío no encontrado'
      });
    }

    if (req.userRole !== 'administrador de plataforma') {
      const store = await db.Store.findOne({
        where: { id: shipment.Order.store_id, company_id: req.companyId }
      });

      if (!store) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este envío'
        });
      }
    }

    res.json({
      success: true,
      data: { shipment }
    });
  } catch (error) {
    console.error('Error al obtener envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener envío',
      error: error.message
    });
  }
};

const createShipment = async (req, res) => {
  try {
    const { order_id, address, city, tracking_code, status } = req.body;

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

    const shipment = await db.Shipment.create({
      order_id,
      address,
      city,
      tracking_code,
      status: status || 'preparing'
    });

    const shipmentWithOrder = await db.Shipment.findByPk(shipment.id, {
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
      message: 'Envío creado exitosamente',
      data: { shipment: shipmentWithOrder }
    });
  } catch (error) {
    console.error('Error al crear envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear envío',
      error: error.message
    });
  }
};

const updateShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { address, city, tracking_code, status } = req.body;

    const shipment = await db.Shipment.findByPk(id, {
      include: [{
        model: db.Order
      }]
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Envío no encontrado'
      });
    }

    if (req.userRole !== 'administrador de plataforma') {
      const store = await db.Store.findOne({
        where: { id: shipment.Order.store_id, company_id: req.companyId }
      });

      if (!store) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este envío'
        });
      }
    }

    if (address !== undefined) shipment.address = address;
    if (city !== undefined) shipment.city = city;
    if (tracking_code !== undefined) shipment.tracking_code = tracking_code;
    if (status) shipment.status = status;

    await shipment.save();

    const updatedShipment = await db.Shipment.findByPk(shipment.id, {
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
      message: 'Envío actualizado exitosamente',
      data: { shipment: updatedShipment }
    });
  } catch (error) {
    console.error('Error al actualizar envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar envío',
      error: error.message
    });
  }
};

const deleteShipment = async (req, res) => {
  try {
    const { id } = req.params;

    const shipment = await db.Shipment.findByPk(id, {
      include: [{
        model: db.Order
      }]
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Envío no encontrado'
      });
    }

    if (req.userRole !== 'administrador de plataforma') {
      const store = await db.Store.findOne({
        where: { id: shipment.Order.store_id, company_id: req.companyId }
      });

      if (!store) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este envío'
        });
      }
    }

    await shipment.destroy();

    res.json({
      success: true,
      message: 'Envío eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar envío',
      error: error.message
    });
  }
};

module.exports = {
  getAllShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment
};

