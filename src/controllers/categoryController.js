'use strict';

const db = require('../models');

const getAllCategories = async (req, res) => {
  try {
    const { store_id } = req.query;

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

    const categories = await db.Category.findAll({
      where: whereClause,
      include: [{
        model: db.Store,
        attributes: ['id', 'name']
      }],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
};

const getCategoryById = async (req, res) => {
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

    const category = await db.Category.findOne({
      where: whereClause,
      include: [{
        model: db.Store,
        attributes: ['id', 'name']
      }]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categoría',
      error: error.message
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { store_id, name } = req.body;

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

    const category = await db.Category.create({
      store_id,
      name
    });

    const categoryWithStore = await db.Category.findByPk(category.id, {
      include: [{
        model: db.Store,
        attributes: ['id', 'name']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: { category: categoryWithStore }
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear categoría',
      error: error.message
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, store_id } = req.body;

    const whereClause = { id };
    if (store_id) {
      whereClause.store_id = store_id;
    }

    if (req.userRole !== 'administrador de plataforma') {
      const category = await db.Category.findByPk(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      const store = await db.Store.findOne({
        where: { id: category.store_id, company_id: req.companyId }
      });

      if (!store) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta categoría'
        });
      }

      if (store_id && store_id !== category.store_id) {
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

    const category = await db.Category.findOne({ where: whereClause });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    if (name) category.name = name;
    if (store_id) category.store_id = store_id;

    await category.save();

    const updatedCategory = await db.Category.findByPk(category.id, {
      include: [{
        model: db.Store,
        attributes: ['id', 'name']
      }]
    });

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: { category: updatedCategory }
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar categoría',
      error: error.message
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await db.Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    if (req.userRole !== 'administrador de plataforma') {
      const store = await db.Store.findOne({
        where: { id: category.store_id, company_id: req.companyId }
      });

      if (!store) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta categoría'
        });
      }
    }

    await category.destroy();

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar categoría',
      error: error.message
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

