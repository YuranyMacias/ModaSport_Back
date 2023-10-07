const { request, response } = require("express");

const { 
  Product, 
  Order, 
  OrderDetail, 
  ShoppingCartDetail 
} = require("../models");

const { isValidObjectId } = require("mongoose");

/**
 * Validate order Status
 */
const validateOrderStatus = (req = request, res = response, next) => {
  const { orderStatus } = req.body;
  const validStatus = Order.schema.path('orderStatus').enumValues

  if (!validStatus.includes(orderStatus)) {
    return res.status(400).json({ message: `Estado de orden inválido, Validos ${validStatus}` });
  }

  next();
};


/**
 * Validate that the products in the list are not duplicated.
 */
const validateDuplicateProducts = async (req = request, res = response, next) => {
  const { products } = req.body;
  const ids = {};

  for (const product of products) {
    if (ids[product.id]) {
      return res.status(400).json({
        message: `Se ha encontrado un producto duplicado con el ID:  ${product.id} . Enviar sólo un producto con la cantidad requerida. `
      });
    }
    ids[product.id] = true;
  }

  next();
}

/**
 * Validate that the products have a valid id and quantity.
 */
const validateProductData = async (req = request, res = response, next) => {
  const { products } = req.body;

  const errors = [];

  products.forEach(product => {

    if (!product.id) {
      errors.push({ error: `El producto no contiene id. Producto: ${JSON.stringify(product)}` });
      return false;
    }

    const isMongoId = isValidObjectId(product.id);
    if (!isMongoId) {
      errors.push({ error: `El ID del producto ${product.id} no es un ID válido.` });
      return false;
    }

    if (!product.quantity) {
      errors.push({ error: `El producto con id ${product.id} no incluye la cantidad.` });
      return false;
    }

    if (!Number.isInteger(product.quantity) || product.quantity <= 0) {
      errors.push({ error: `La cantidad del producto debe ser un número entero mayor a cero. Cantidad: ${product.quantity}.` });
      return false;
    }

    if (!product.color) {
      errors.push({ error: `El producto con id ${product.id} no incluye el color.` });
      return false;
    }

    if (!product.size) {
      errors.push({ error: `El producto con id ${product.id} no incluye la talla.` });
      return false;
    }
  });

  if (errors.length > 0) {
    return res.status(400).json(errors);
  }

  next();
}


/**
 * Validate that the products shipped for the order exist and their quantity is less than the stock.
 */
const validateOrderDetails = async (req = request, res = response, next) => {
  const { products } = req.body;
  try {
    const productIds = products.map(product => product.id);
    const productResults = await Product.find({ _id: { $in: productIds } });

    const errors = [];

    products.forEach(product => {
      const productExist = productResults.find(result => result._id.toString() === product.id);

      if (!productExist) {
        errors.push({ error: `Producto no encontrado para el ID ${product.id}` });
        return false;
      }

      if (product.quantity > productExist.stock) {
        errors.push({ error: `Cantidad excedida. Stock: ${productExist.stock}, cantidad solicitada: ${product.quantity}, producto ${productExist.name}` });
        return false;
      }

      return true;
    });

    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al validar los detalles del pedido' });
  }
}


/**
 * Validate that the products sent to be removed from the order exist.
 */
const validateProductExistInOrder = async (req = request, res = response, next) => {
  try {
    const { idOrder } = req.params;
    const { details } = req.body;

    const ids = details.map(detail => detail.id);
    const orderDetails = await OrderDetail.find({ order: idOrder, _id: { $in: ids } });
    const errors = [];
    details.forEach(detail => {
      const detailExist = orderDetails.find(detailDB => detailDB._id.toString() === detail.id);

      if (!detailExist) {
        errors.push({ error: `Detalle de pedido no encontrado en el pedio, Id: ${detail.id}` });
      }
    });

    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al validar los detalles del pedido.' });
  }
}

/**
 * Validate that the products sent to be removed from the shopping cart exist.
 */
const validateProductExistInShoppingCart = async (req = request, res = response, next) => {
  try {
    const { idShoppingCart } = req.params;
    const { details } = req.body;

    const ids = details.map(detail => detail.id);
    const orderDetails = await ShoppingCartDetail.find({ shoppingCart: idShoppingCart, _id: { $in: ids } });
    const errors = [];

    details.forEach(detail => {
      const detailExist = orderDetails.find(detailDB => detailDB._id.toString() === detail.id);

      if (!detailExist) {
        errors.push({ error: `Detalle de pedido no encontrado en el carrito de compra, Id: ${detail.id}` });
      }
    });

    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al validar los detalles del pedido.' });
  }
}



module.exports = {
  validateOrderStatus,
  validateDuplicateProducts,
  validateOrderDetails,
  validateProductData,
  validateProductExistInOrder,
  validateProductExistInShoppingCart
}