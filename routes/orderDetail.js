const { Router } = require("express");
const { check } = require("express-validator");

const {
    validateFields,
    validateJWT,
    validateOrderDetails,
    validateProductData,
    validateDuplicateProducts,
    validateProductExistInOrder
} = require("../middlewares");

const {
    existsOrderById,
    isArrayOfObject
} = require("../helpers");

const { 
    getOrderDetailsByIdOrder, 
    updateOrderDetail, 
    deleteOrderDetail 
} = require("../controllers/orderDetail");


const router = Router();

/**
 * {{url}}/api/order-details
 */

router.get('/:idOrder', [
    validateJWT,
    check('idOrder', 'El ID de la orden no es válido.').isMongoId(),
    validateFields,
    check('idOrder').custom(existsOrderById),
    validateFields
], getOrderDetailsByIdOrder);

router.put('/:idOrder', [
    validateJWT,
    check('idOrder', 'El ID de la orden no es válido.').isMongoId(),
    validateFields,
    check('idOrder').custom(existsOrderById),
    validateFields,
    check('products', 'Lista de productos es obligatoria.').not().isEmpty(),
    validateFields,
    check('products', 'Lista de productos debe ser un array de objetos de producto.').isArray(),
    check('products', 'Lista de productos debe contener al menos un producto.').isArray({ min: 1 }),
    validateFields,
    check('products').custom(productsOrder => isArrayOfObject(productsOrder)),
    validateFields,
    validateDuplicateProducts,
    validateFields,
    validateProductData,
    validateFields,
    validateOrderDetails,
    validateFields
], updateOrderDetail);

router.delete('/:idOrder', [
    validateJWT,
    check('idOrder', 'El ID de la orden no es válido.').isMongoId(),
    validateFields,
    check('idOrder').custom(existsOrderById),
    validateFields,
    check('details', 'Lista de detalles de pedido es obligatoria.').not().isEmpty(),
    validateFields,
    check('details', 'Lista de detalles de pedido debe ser un array de objetos con el id detalle de orden a eliminar.').isArray(),
    check('details', 'Lista de detalles de pedido debe contener al menos un elemento a eliminar.').isArray({ min: 1 }),
    validateFields,
    check('details').custom(productsOrder => isArrayOfObject(productsOrder)),
    validateFields,
    validateProductExistInOrder,
    validateFields
], deleteOrderDetail);

module.exports = router;