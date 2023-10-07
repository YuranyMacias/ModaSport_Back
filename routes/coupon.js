const { Router } = require("express");
const { check } = require("express-validator");

const { 
    validateJWT, 
    isAdminRole, 
    validateFields 
} = require("../middlewares");

const {  
    existsCouponById, 
    existsOrderById, 
    existsShoppingCartById
} = require("../helpers");

const { 
    getCoupons, 
    getCouponById, 
    createCoupon, 
    updateCoupon, 
    deleteCoupon, 
    redeemCoupon, 
    removeCoupon
} = require("../controllers/coupon");

const router = Router();

/**
 * {{url}}/api/coupons
 */

router.get('/', [
    validateJWT,
    isAdminRole,
    validateFields
], getCoupons);

router.get('/:id', [
    validateJWT,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsCouponById),
    validateFields
], getCouponById);

router.post('/', [
    validateJWT,
    isAdminRole,
    check('discount', 'El descuento es obligatorio.').not().isEmpty(),
    check('expirationDate', 'La fecha de expiración del cupón es obligatoria.').not().isEmpty(),
    check('maxUses', 'El número máximo de usos es obligatorio.').not().isEmpty(),
    validateFields
], createCoupon);

router.put('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsCouponById),
    validateFields,
    check('discount', 'El descuento es obligatorio.').optional().not().isEmpty(),
    check('expirationDate', 'La fecha de expiración del cupón es obligatoria.').optional().not().isEmpty(),
    check('maxUses', 'El número máximo de usos es obligatorio.').optional().not().isEmpty(),
    validateFields
], updateCoupon);

router.delete('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsCouponById),
    validateFields
], deleteCoupon);

router.post('/redeem', [
    check('code', 'El código del cupón es obligatorio.').not().isEmpty(),
    validateFields,
    check('idShoppingCart', 'El id del carrito de compras es obligatorio.').not().isEmpty(),
    validateFields,
    check('idShoppingCart', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('idShoppingCart').custom(existsShoppingCartById),
    validateFields,
], redeemCoupon);


router.delete('/remove/:idShoppingCart', [
    check('idShoppingCart', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('idShoppingCart').custom(existsShoppingCartById),
    validateFields,
], removeCoupon);

module.exports = router;