'use strict';

const db = require('../models');
const { Op } = require('sequelize');

const getAllProducts = async (req, res) => {
  try {
    const { store_id, category_id, search } = req.query;

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

    if (category_id) {
      whereClause.category_id = category_id;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const products = await db.Product.findAll({
      where: whereClause,
      include: [
        {
          model: db.Store,
          attributes: ['id', 'name']
        },
        {
          model: db.Category,
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

const getProductById = async (req, res) => {
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

    const product = await db.Product.findOne({
      where: whereClause,
      include: [
        {
          model: db.Store,
          attributes: ['id', 'name']
        },
        {
          model: db.Category,
          attributes: ['id', 'name']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto',
      error: error.message
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { store_id, category_id, name, description, price, stock, image } = req.body;

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

    const product = await db.Product.create({
      store_id,
      category_id,
      name,
      description,
      price,
      stock: stock || 0,
      image
    });

    const productWithRelations = await db.Product.findByPk(product.id, {
      include: [
        {
          model: db.Store,
          attributes: ['id', 'name']
        },
        {
          model: db.Category,
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: { product: productWithRelations }
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear producto',
      error: error.message
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, image, category_id, store_id } = req.body;

    const product = await db.Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    if (req.userRole !== 'administrador de plataforma') {
      const store = await db.Store.findOne({
        where: { id: product.store_id, company_id: req.companyId }
      });

      if (!store) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este producto'
        });
      }

      if (store_id && store_id !== product.store_id) {
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

    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (image !== undefined) product.image = image;
    if (category_id !== undefined) product.category_id = category_id;
    if (store_id) product.store_id = store_id;

    await product.save();

    const updatedProduct = await db.Product.findByPk(product.id, {
      include: [
        {
          model: db.Store,
          attributes: ['id', 'name']
        },
        {
          model: db.Category,
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: { product: updatedProduct }
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto',
      error: error.message
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await db.Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    if (req.userRole !== 'administrador de plataforma') {
      const store = await db.Store.findOne({
        where: { id: product.store_id, company_id: req.companyId }
      });

      if (!store) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este producto'
        });
      }
    }

    await product.destroy();

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto',
      error: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

