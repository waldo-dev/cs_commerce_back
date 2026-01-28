'use strict';

const db = require('../models');

const getUserStores = async (req, res) => {
  try {
    const { user_id, store_id } = req.query;
    const whereClause = {};

    if (user_id) {
      whereClause.user_id = user_id;
    }

    if (store_id) {
      whereClause.store_id = store_id;
    }

    if (req.userRole !== 'administrador de plataforma') {
      if (user_id && parseInt(user_id) !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver las tiendas de otros usuarios'
        });
      }

      if (store_id) {
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
    }

    const userStores = await db.UserStore.findAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: db.Store,
          attributes: ['id', 'name', 'domain'],
          include: [{
            model: db.Company,
            attributes: ['id', 'name']
          }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { userStores }
    });
  } catch (error) {
    console.error('Error al obtener asociaciones usuario-tienda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener asociaciones usuario-tienda',
      error: error.message
    });
  }
};

const getStoresByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const userId = user_id || req.userId;

    if (req.userRole !== 'administrador de plataforma' && parseInt(userId) !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver las tiendas de otros usuarios'
      });
    }

    const user = await db.User.findByPk(userId, {
      include: [{
        model: db.Store,
        as: 'stores',
        through: {
          attributes: ['status', 'created_at']
        },
        include: [{
          model: db.Company,
          attributes: ['id', 'name']
        }]
      }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        stores: user.stores
      }
    });
  } catch (error) {
    console.error('Error al obtener tiendas del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tiendas del usuario',
      error: error.message
    });
  }
};

const getUsersByStore = async (req, res) => {
  try {
    const { store_id } = req.params;

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

    const store = await db.Store.findByPk(store_id, {
      include: [{
        model: db.User,
        as: 'users',
        through: {
          attributes: ['status', 'created_at']
        },
        attributes: ['id', 'name', 'email', 'role'],
        include: [{
          model: db.Company,
          attributes: ['id', 'name']
        }]
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
      data: {
        store: {
          id: store.id,
          name: store.name,
          domain: store.domain
        },
        users: store.users
      }
    });
  } catch (error) {
    console.error('Error al obtener usuarios de la tienda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios de la tienda',
      error: error.message
    });
  }
};

const associateUserStore = async (req, res) => {
  try {
    const { user_id, store_id, status } = req.body;

    if (!user_id || !store_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id y store_id son requeridos'
      });
    }

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

      const user = await db.User.findByPk(user_id);
      if (user && user.company_id !== req.companyId) {
        return res.status(403).json({
          success: false,
          message: 'No puedes asociar usuarios de otras compañías'
        });
      }
    }

    const existing = await db.UserStore.findOne({
      where: { user_id, store_id }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya está asociado a esta tienda'
      });
    }

    const userStore = await db.UserStore.create({
      user_id,
      store_id,
      status: status || 'active'
    });

    const userStoreWithRelations = await db.UserStore.findByPk(userStore.id, {
      include: [
        {
          model: db.User,
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: db.Store,
          attributes: ['id', 'name', 'domain']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Usuario asociado a tienda exitosamente',
      data: { userStore: userStoreWithRelations }
    });
  } catch (error) {
    console.error('Error al asociar usuario a tienda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asociar usuario a tienda',
      error: error.message
    });
  }
};

const updateUserStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const userStore = await db.UserStore.findByPk(id, {
      include: [{
        model: db.Store
      }]
    });

    if (!userStore) {
      return res.status(404).json({
        success: false,
        message: 'Asociación no encontrada'
      });
    }

    if (req.userRole !== 'administrador de plataforma') {
      const store = await db.Store.findOne({
        where: { id: userStore.store_id, company_id: req.companyId }
      });

      if (!store) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta asociación'
        });
      }
    }

    if (status) {
      userStore.status = status;
      await userStore.save();
    }

    const updatedUserStore = await db.UserStore.findByPk(userStore.id, {
      include: [
        {
          model: db.User,
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: db.Store,
          attributes: ['id', 'name', 'domain']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Asociación actualizada exitosamente',
      data: { userStore: updatedUserStore }
    });
  } catch (error) {
    console.error('Error al actualizar asociación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar asociación',
      error: error.message
    });
  }
};

const removeUserStore = async (req, res) => {
  try {
    const { id } = req.params;

    const userStore = await db.UserStore.findByPk(id, {
      include: [{
        model: db.Store
      }]
    });

    if (!userStore) {
      return res.status(404).json({
        success: false,
        message: 'Asociación no encontrada'
      });
    }

    if (req.userRole !== 'administrador de plataforma') {
      const store = await db.Store.findOne({
        where: { id: userStore.store_id, company_id: req.companyId }
      });

      if (!store) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta asociación'
        });
      }
    }

    await userStore.destroy();

    res.json({
      success: true,
      message: 'Asociación eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar asociación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar asociación',
      error: error.message
    });
  }
};

const addCustomerToStore = async (req, res) => {
  try {
    const { store_id, email, name, password } = req.body;

    if (!store_id || !email) {
      return res.status(400).json({
        success: false,
        message: 'store_id y email son requeridos'
      });
    }

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

    let user = await db.User.findOne({ where: { email } });
    let userCreated = false;

    if (!user) {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Si el usuario no existe, se requiere una contraseña'
        });
      }

      if (req.userRole !== 'administrador de plataforma') {
        user = await db.User.create({
          name: name || email.split('@')[0],
          email,
          password,
          company_id: req.companyId,
          role: 'cliente'
        });
      } else {
        const { company_id } = req.body;
        if (!company_id) {
          return res.status(400).json({
            success: false,
            message: 'company_id es requerido para crear usuarios como administrador de plataforma'
          });
        }
        user = await db.User.create({
          name: name || email.split('@')[0],
          email,
          password,
          company_id,
          role: 'cliente'
        });
      }

      userCreated = true;
      console.log(`Usuario cliente creado: ${user.email}`);
    } else {
      if (req.userRole !== 'administrador de plataforma' && user.company_id !== req.companyId) {
        return res.status(403).json({
          success: false,
          message: 'No puedes asociar usuarios de otras compañías'
        });
      }

      if (name && user.name !== name) {
        user.name = name;
        await user.save();
      }
    }

    const existingAssociation = await db.UserStore.findOne({
      where: { user_id: user.id, store_id }
    });

    if (existingAssociation) {
      if (existingAssociation.status === 'inactive' || existingAssociation.status === 'suspended') {
        existingAssociation.status = 'active';
        await existingAssociation.save();
      }

      const userStoreWithRelations = await db.UserStore.findByPk(existingAssociation.id, {
        include: [
          {
            model: db.User,
            attributes: ['id', 'name', 'email', 'role']
          },
          {
            model: db.Store,
            attributes: ['id', 'name', 'domain']
          }
        ]
      });

      return res.json({
        success: true,
        message: 'El usuario ya estaba asociado a esta tienda. Asociación reactivada.',
        data: { userStore: userStoreWithRelations }
      });
    }

    const userStore = await db.UserStore.create({
      user_id: user.id,
      store_id,
      status: 'active'
    });

    const userStoreWithRelations = await db.UserStore.findByPk(userStore.id, {
      include: [
        {
          model: db.User,
          attributes: ['id', 'name', 'email', 'role'],
          include: [{
            model: db.Company,
            attributes: ['id', 'name']
          }]
        },
        {
          model: db.Store,
          attributes: ['id', 'name', 'domain'],
          include: [{
            model: db.Company,
            attributes: ['id', 'name']
          }]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: userCreated
        ? 'Usuario cliente creado y agregado a tienda exitosamente'
        : 'Usuario cliente agregado a tienda exitosamente',
      data: {
        userStore: userStoreWithRelations,
        userCreated
      }
    });
  } catch (error) {
    console.error('Error al agregar cliente a tienda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar cliente a tienda',
      error: error.message
    });
  }
};

module.exports = {
  getUserStores,
  getStoresByUser,
  getUsersByStore,
  associateUserStore,
  addCustomerToStore,
  updateUserStore,
  removeUserStore
};

