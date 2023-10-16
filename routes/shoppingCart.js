const { Router } = require("express");
const { check } = require("express-validator");

const {
    validateFields,
    isAdminRole,
    validateJWT,
    validateOrderDetails,
    validateProductData,
    validateDuplicateProducts,
    conditionalValidationJWT
} = require("../middlewares");

const {
    isArrayOfObject,
    existsShoppingCartById
} = require("../helpers");

const { 
    getShoppingCarts, 
    getShoppingCartById, 
    createShoppingCart, 
    updateShoppingCart, 
    deleteShoppingCart, 
    getShoppingCartByUserId
} = require("../controllers/shoppingCart");


const router = Router();

/**
 * {{url}}/api/shopping-cart
 */

router.get('/', [
    validateJWT,
    isAdminRole,
    validateFields
], getShoppingCarts);

router.get('/:id', [
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsShoppingCartById),
    validateFields
], getShoppingCartById);

router.post('/', [
    conditionalValidationJWT,
    check('products', 'Lista de productos es obligatoria.').not().isEmpty(),
    validateFields,
    check('products', 'Lista de productos debe ser un array de objetos de producto.').isArray(),
    check('products', 'Lista de productos debe contener al menos un producto.').isArray({ min: 1 }),
    validateFields,
    check('products').custom(productsShoppingCart => isArrayOfObject(productsShoppingCart)),
    validateFields,
    validateDuplicateProducts,
    validateFields,
    validateProductData,
    validateFields,
    validateOrderDetails,
    validateFields
], createShoppingCart );

router.put('/:id', [
    validateJWT,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsShoppingCartById),
    validateFields
], updateShoppingCart);

router.delete('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido').isMongoId(),
    validateFields,
    check('id').custom(existsShoppingCartById),
    validateFields
], deleteShoppingCart);

router.get('/find/ByUser', [
    validateJWT,
    validateFields
], getShoppingCartByUserId);

module.exports = router;