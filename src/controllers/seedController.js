'use strict';

const db = require('../models');

const seedDatabase = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('Iniciando limpieza de tablas...');

    await db.Shipment.destroy({ where: {}, transaction, force: true });
    await db.Payment.destroy({ where: {}, transaction, force: true });
    await db.OrderItem.destroy({ where: {}, transaction, force: true });
    await db.Order.destroy({ where: {}, transaction, force: true });
    await db.Customer.destroy({ where: {}, transaction, force: true });
    await db.Product.destroy({ where: {}, transaction, force: true });
    await db.Category.destroy({ where: {}, transaction, force: true });
    await db.Store.destroy({ where: {}, transaction, force: true });
    await db.User.destroy({ where: {}, transaction, force: true });
    await db.Company.destroy({ where: {}, transaction, force: true });
    await db.Role.destroy({ where: {}, transaction, force: true });

    console.log('Limpieza completada.');

    console.log('Creando roles...');
    const roles = await db.Role.bulkCreate([
      { value: 'administrador de plataforma' },
      { value: 'administrador de tienda' },
      { value: 'cliente' }
    ], {
      transaction,
      returning: true
    });

    console.log(`Roles creados: ${roles.length}`);
    console.log('Roles:', roles.map(r => r.value));

    console.log('Creando compañía...');
    const company = await db.Company.create({
      name: 'Chilsmart',
      email: 'contacto@chilsmart.com',
      plan: 'premium'
    }, { transaction });

    console.log(`Compañía creada: ${company.name}`);

    console.log('Creando usuario...');
    const user = await db.User.create({
      name: 'Waldo',
      email: 'waldo@chilsmart.com',
      password: 'Chil2026*',
      company_id: company.id,
      role: 'administrador de plataforma'
    }, { transaction });

    console.log(`Usuario creado: ${user.email}`);

    const store = await db.Store.create({
      company_id: company.id,
      name: 'Chilsmart Store Principal',
      domain: 'chilsmart-store.myshop.com',
      theme: 'modern'
    }, { transaction });

    const categories = await db.Category.bulkCreate([
      { store_id: store.id, name: 'Electrónica' },
      { store_id: store.id, name: 'Ropa' },
      { store_id: store.id, name: 'Hogar' },
      { store_id: store.id, name: 'Deportes' },
      { store_id: store.id, name: 'Libros' }
    ], { transaction });

    const products = await db.Product.bulkCreate([
      {
        store_id: store.id,
        category_id: categories[0].id,
        name: 'Smartphone Galaxy Pro',
        description: 'Teléfono inteligente con pantalla AMOLED de 6.7 pulgadas, 128GB de almacenamiento y cámara de 108MP',
        price: 899.99,
        stock: 25,
        image: 'https://via.placeholder.com/400x400?text=Smartphone'
      },
      {
        store_id: store.id,
        category_id: categories[0].id,
        name: 'Laptop UltraBook',
        description: 'Laptop ultradelgada con procesador Intel i7, 16GB RAM, SSD 512GB',
        price: 1299.99,
        stock: 15,
        image: 'https://via.placeholder.com/400x400?text=Laptop'
      },
      {
        store_id: store.id,
        category_id: categories[0].id,
        name: 'Auriculares Inalámbricos',
        description: 'Auriculares con cancelación de ruido activa y batería de 30 horas',
        price: 199.99,
        stock: 50,
        image: 'https://via.placeholder.com/400x400?text=Auriculares'
      },
      {
        store_id: store.id,
        category_id: categories[1].id,
        name: 'Camiseta Premium',
        description: 'Camiseta de algodón 100% orgánico, disponible en varios colores',
        price: 29.99,
        stock: 100,
        image: 'https://via.placeholder.com/400x400?text=Camiseta'
      },
      {
        store_id: store.id,
        category_id: categories[1].id,
        name: 'Jeans Clásicos',
        description: 'Jeans de corte clásico, tela resistente y cómoda',
        price: 79.99,
        stock: 60,
        image: 'https://via.placeholder.com/400x400?text=Jeans'
      },
      {
        store_id: store.id,
        category_id: categories[2].id,
        name: 'Sofá Moderno',
        description: 'Sofá de 3 plazas, tela resistente, cómodo y elegante',
        price: 599.99,
        stock: 10,
        image: 'https://via.placeholder.com/400x400?text=Sofa'
      },
      {
        store_id: store.id,
        category_id: categories[2].id,
        name: 'Mesa de Centro',
        description: 'Mesa de centro de madera maciza, diseño minimalista',
        price: 249.99,
        stock: 20,
        image: 'https://via.placeholder.com/400x400?text=Mesa'
      },
      {
        store_id: store.id,
        category_id: categories[3].id,
        name: 'Zapatillas Deportivas',
        description: 'Zapatillas para running con tecnología de amortiguación avanzada',
        price: 119.99,
        stock: 45,
        image: 'https://via.placeholder.com/400x400?text=Zapatillas'
      },
      {
        store_id: store.id,
        category_id: categories[4].id,
        name: 'El Arte de la Programación',
        description: 'Libro sobre mejores prácticas en desarrollo de software',
        price: 39.99,
        stock: 30,
        image: 'https://via.placeholder.com/400x400?text=Libro'
      },
      {
        store_id: store.id,
        category_id: categories[0].id,
        name: 'Smartwatch Pro',
        description: 'Reloj inteligente con monitor de salud, GPS y resistencia al agua',
        price: 349.99,
        stock: 35,
        image: 'https://via.placeholder.com/400x400?text=Smartwatch'
      }
    ], { transaction });

    const customers = await db.Customer.bulkCreate([
      {
        store_id: store.id,
        name: 'María González',
        email: 'maria.gonzalez@email.com',
        phone: '+56912345678'
      },
      {
        store_id: store.id,
        name: 'Juan Pérez',
        email: 'juan.perez@email.com',
        phone: '+56987654321'
      },
      {
        store_id: store.id,
        name: 'Ana Martínez',
        email: 'ana.martinez@email.com',
        phone: '+56911223344'
      },
      {
        store_id: store.id,
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@email.com',
        phone: '+56955667788'
      },
      {
        store_id: store.id,
        name: 'Laura Sánchez',
        email: 'laura.sanchez@email.com',
        phone: '+56999887766'
      }
    ], { transaction });

    const orders = await db.Order.bulkCreate([
      {
        store_id: store.id,
        customer_id: customers[0].id,
        total: 1129.98,
        status: 'completed',
        payment_status: 'paid'
      },
      {
        store_id: store.id,
        customer_id: customers[1].id,
        total: 299.98,
        status: 'processing',
        payment_status: 'paid'
      },
      {
        store_id: store.id,
        customer_id: customers[2].id,
        total: 849.98,
        status: 'pending',
        payment_status: 'unpaid'
      },
      {
        store_id: store.id,
        customer_id: customers[3].id,
        total: 199.99,
        status: 'shipped',
        payment_status: 'paid'
      },
      {
        store_id: store.id,
        customer_id: customers[4].id,
        total: 1499.98,
        status: 'completed',
        payment_status: 'paid'
      }
    ], { transaction });

    await db.OrderItem.bulkCreate([
      {
        order_id: orders[0].id,
        product_id: products[0].id,
        quantity: 1,
        price: 899.99
      },
      {
        order_id: orders[0].id,
        product_id: products[3].id,
        quantity: 2,
        price: 29.99
      },
      {
        order_id: orders[1].id,
        product_id: products[2].id,
        quantity: 1,
        price: 199.99
      },
      {
        order_id: orders[1].id,
        product_id: products[3].id,
        quantity: 1,
        price: 29.99
      },
      {
        order_id: orders[1].id,
        product_id: products[4].id,
        quantity: 1,
        price: 79.99
      },
      {
        order_id: orders[2].id,
        product_id: products[1].id,
        quantity: 1,
        price: 1299.99
      },
      {
        order_id: orders[2].id,
        product_id: products[3].id,
        quantity: 2,
        price: 29.99
      },
      {
        order_id: orders[3].id,
        product_id: products[2].id,
        quantity: 1,
        price: 199.99
      },
      {
        order_id: orders[4].id,
        product_id: products[1].id,
        quantity: 1,
        price: 1299.99
      },
      {
        order_id: orders[4].id,
        product_id: products[0].id,
        quantity: 1,
        price: 899.99
      }
    ], { transaction });

    await db.Payment.bulkCreate([
      {
        order_id: orders[0].id,
        provider: 'stripe',
        amount: 1129.98,
        status: 'completed'
      },
      {
        order_id: orders[1].id,
        provider: 'paypal',
        amount: 299.98,
        status: 'completed'
      },
      {
        order_id: orders[3].id,
        provider: 'stripe',
        amount: 199.99,
        status: 'completed'
      },
      {
        order_id: orders[4].id,
        provider: 'stripe',
        amount: 1499.98,
        status: 'completed'
      }
    ], { transaction });

    await db.Shipment.bulkCreate([
      {
        order_id: orders[0].id,
        address: 'Av. Principal 123, Depto 45',
        city: 'Santiago',
        tracking_code: 'SHIP001234',
        status: 'delivered'
      },
      {
        order_id: orders[1].id,
        address: 'Calle Los Olivos 456',
        city: 'Valparaíso',
        tracking_code: 'SHIP001235',
        status: 'in_transit'
      },
      {
        order_id: orders[3].id,
        address: 'Pasaje Las Flores 789',
        city: 'Concepción',
        tracking_code: 'SHIP001236',
        status: 'delivered'
      },
      {
        order_id: orders[4].id,
        address: 'Av. Libertador 321',
        city: 'Santiago',
        tracking_code: 'SHIP001237',
        status: 'delivered'
      }
    ], { transaction });

    console.log('Asociando usuario a tienda...');
    await db.UserStore.create({
      user_id: user.id,
      store_id: store.id,
      status: 'active'
    }, { transaction });

    console.log('Commit de transacción...');
    await transaction.commit();
    console.log('Base de datos sembrada exitosamente');

    res.status(201).json({
      success: true,
      message: 'Base de datos sembrada exitosamente',
      data: {
        roles: roles.length,
        roles_created: roles.map(r => r.value),
        company: company.name,
        user: {
          email: user.email,
          name: user.name,
          role: user.role
        },
        store: store.name,
        categories: categories.length,
        products: products.length,
        customers: customers.length,
        orders: orders.length
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al sembrar base de datos:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al sembrar base de datos',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const seedRenatoStore = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('Creando seed para Renato y tienda de suplementos deportivos...');

    const roleAdminTienda = await db.Role.findOne({
      where: { value: 'administrador de tienda' },
      transaction
    });

    if (!roleAdminTienda) {
      throw new Error('El rol "administrador de tienda" no existe. Ejecuta el seed principal primero.');
    }

    const company = await db.Company.findOne({
      where: { name: 'Chilsmart' },
      transaction
    });

    if (!company) {
      throw new Error('La compañía Chilsmart no existe. Ejecuta el seed principal primero.');
    }

    const existingUser = await db.User.findOne({
      where: { email: 'renato@chilsmart.com' },
      transaction
    });

    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'El usuario renato@chilsmart.com ya existe'
      });
    }

    console.log('Creando usuario Renato...');
    const user = await db.User.create({
      name: 'Renato',
      email: 'renato@chilsmart.com',
      password: 'Chil2026*',
      company_id: company.id,
      role: 'administrador de tienda'
    }, { transaction });

    console.log(`Usuario creado: ${user.email}`);

    console.log('Creando tienda de suplementos deportivos...');
    const store = await db.Store.create({
      company_id: company.id,
      name: 'Suplementos Deportivos Pro',
      domain: 'suplementos-deportivos.myshop.com',
      theme: 'sport'
    }, { transaction });

    console.log(`Tienda creada: ${store.name}`);

    console.log('Creando categorías de suplementos...');
    const categories = await db.Category.bulkCreate([
      { store_id: store.id, name: 'Proteínas' },
      { store_id: store.id, name: 'Creatina' },
      { store_id: store.id, name: 'Pre-entrenos' },
      { store_id: store.id, name: 'Vitaminas' },
      { store_id: store.id, name: 'Quemadores de grasa' }
    ], { transaction });

    console.log(`Categorías creadas: ${categories.length}`);

    console.log('Creando productos de suplementos...');
    const products = await db.Product.bulkCreate([
      {
        store_id: store.id,
        category_id: categories[0].id,
        name: 'Proteína Whey 2kg',
        description: 'Proteína de suero de leche de alta calidad, 25g de proteína por porción, sabor chocolate',
        price: 45.99,
        stock: 50,
        image: 'https://via.placeholder.com/400x400?text=Proteina+Whey'
      },
      {
        store_id: store.id,
        category_id: categories[0].id,
        name: 'Proteína Caseína 1kg',
        description: 'Proteína de liberación lenta, ideal para tomar antes de dormir',
        price: 32.99,
        stock: 30,
        image: 'https://via.placeholder.com/400x400?text=Caseina'
      },
      {
        store_id: store.id,
        category_id: categories[0].id,
        name: 'Proteína Vegana 1.5kg',
        description: 'Proteína 100% vegetal, sin lactosa, sabor vainilla',
        price: 38.99,
        stock: 25,
        image: 'https://via.placeholder.com/400x400?text=Proteina+Vegana'
      },
      {
        store_id: store.id,
        category_id: categories[1].id,
        name: 'Creatina Monohidrato 500g',
        description: 'Creatina pura en polvo, aumenta fuerza y masa muscular',
        price: 18.99,
        stock: 60,
        image: 'https://via.placeholder.com/400x400?text=Creatina'
      },
      {
        store_id: store.id,
        category_id: categories[1].id,
        name: 'Creatina HCL 300g',
        description: 'Creatina hidrocloruro, mejor absorción, sin retención de agua',
        price: 24.99,
        stock: 40,
        image: 'https://via.placeholder.com/400x400?text=Creatina+HCL'
      },
      {
        store_id: store.id,
        category_id: categories[2].id,
        name: 'Pre-entreno Explosivo 300g',
        description: 'Aumenta energía, enfoque y resistencia durante el entrenamiento',
        price: 29.99,
        stock: 45,
        image: 'https://via.placeholder.com/400x400?text=Pre+Entreno'
      },
      {
        store_id: store.id,
        category_id: categories[2].id,
        name: 'Pre-entreno Sin Cafeína 250g',
        description: 'Pre-entreno sin estimulantes, ideal para entrenamientos nocturnos',
        price: 26.99,
        stock: 35,
        image: 'https://via.placeholder.com/400x400?text=Pre+Sin+Cafeina'
      },
      {
        store_id: store.id,
        category_id: categories[3].id,
        name: 'Multivitamínico Completo 120 cápsulas',
        description: 'Complejo vitamínico con todos los nutrientes esenciales',
        price: 22.99,
        stock: 80,
        image: 'https://via.placeholder.com/400x400?text=Multivitaminico'
      },
      {
        store_id: store.id,
        category_id: categories[3].id,
        name: 'Vitamina D3 2000 UI 120 cápsulas',
        description: 'Suplemento de vitamina D3 para fortalecer huesos y sistema inmune',
        price: 15.99,
        stock: 70,
        image: 'https://via.placeholder.com/400x400?text=Vitamina+D3'
      },
      {
        store_id: store.id,
        category_id: categories[4].id,
        name: 'Quemador de Grasa Termogénico 120 cápsulas',
        description: 'Acelera el metabolismo y ayuda a quemar grasa durante el ejercicio',
        price: 34.99,
        stock: 40,
        image: 'https://via.placeholder.com/400x400?text=Quemador'
      }
    ], { transaction });

    console.log(`Productos creados: ${products.length}`);

    console.log('Creando clientes de la tienda...');
    const customers = await db.Customer.bulkCreate([
      {
        store_id: store.id,
        name: 'Diego Torres',
        email: 'diego.torres@email.com',
        phone: '+56911111111'
      },
      {
        store_id: store.id,
        name: 'Fernanda Silva',
        email: 'fernanda.silva@email.com',
        phone: '+56922222222'
      },
      {
        store_id: store.id,
        name: 'Roberto Morales',
        email: 'roberto.morales@email.com',
        phone: '+56933333333'
      }
    ], { transaction });

    console.log(`Clientes creados: ${customers.length}`);

    console.log('Creando órdenes de ejemplo...');
    const orders = await db.Order.bulkCreate([
      {
        store_id: store.id,
        customer_id: customers[0].id,
        total: 64.98,
        status: 'completed',
        payment_status: 'paid'
      },
      {
        store_id: store.id,
        customer_id: customers[1].id,
        total: 48.98,
        status: 'processing',
        payment_status: 'paid'
      },
      {
        store_id: store.id,
        customer_id: customers[2].id,
        total: 82.97,
        status: 'pending',
        payment_status: 'unpaid'
      }
    ], { transaction });

    await db.OrderItem.bulkCreate([
      {
        order_id: orders[0].id,
        product_id: products[0].id,
        quantity: 1,
        price: 45.99
      },
      {
        order_id: orders[0].id,
        product_id: products[3].id,
        quantity: 1,
        price: 18.99
      },
      {
        order_id: orders[1].id,
        product_id: products[1].id,
        quantity: 1,
        price: 32.99
      },
      {
        order_id: orders[1].id,
        product_id: products[4].id,
        quantity: 1,
        price: 24.99
      },
      {
        order_id: orders[2].id,
        product_id: products[5].id,
        quantity: 1,
        price: 29.99
      },
      {
        order_id: orders[2].id,
        product_id: products[7].id,
        quantity: 1,
        price: 22.99
      },
      {
        order_id: orders[2].id,
        product_id: products[8].id,
        quantity: 1,
        price: 15.99
      }
    ], { transaction });

    await db.Payment.bulkCreate([
      {
        order_id: orders[0].id,
        provider: 'stripe',
        amount: 64.98,
        status: 'completed'
      },
      {
        order_id: orders[1].id,
        provider: 'paypal',
        amount: 48.98,
        status: 'completed'
      }
    ], { transaction });

    await db.Shipment.bulkCreate([
      {
        order_id: orders[0].id,
        address: 'Av. Deportiva 789, Depto 12',
        city: 'Santiago',
        tracking_code: 'SUP001234',
        status: 'delivered'
      },
      {
        order_id: orders[1].id,
        address: 'Calle Fitness 321',
        city: 'Valparaíso',
        tracking_code: 'SUP001235',
        status: 'in_transit'
      }
    ], { transaction });

    console.log('Asociando Renato a su tienda...');
    await db.UserStore.create({
      user_id: user.id,
      store_id: store.id,
      status: 'active'
    }, { transaction });

    await transaction.commit();
    console.log('Seed de Renato completado exitosamente');

    res.status(201).json({
      success: true,
      message: 'Usuario Renato y tienda de suplementos creados exitosamente',
      data: {
        user: {
          email: user.email,
          name: user.name,
          role: user.role
        },
        store: {
          name: store.name,
          domain: store.domain
        },
        categories: categories.length,
        products: products.length,
        customers: customers.length,
        orders: orders.length
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear seed de Renato:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al crear seed de Renato',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  seedDatabase,
  seedRenatoStore
};

