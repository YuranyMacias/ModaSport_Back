const { Router } = require("express");
const { check } = require("express-validator");

const { validateJWT, isAdminRole, validateFields } = require("../middlewares");
const { getPayments, getPaymentById, createPayment } = require("../controllers/payment");
const { existsPaymentById, existsOrderById, existsUserById, isAuthorizedPaymentType } = require("../helpers");

const AuthorizedPaymentType = ['balance', 'card', 'paypal'];


const router = Router();

/**
 * {{url}}/api/payments
 */

router.get('/', [
    validateJWT,
    isAdminRole,
    validateFields
], getPayments);

router.get('/:id', [
    validateJWT,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsPaymentById),
    validateFields
], getPaymentById);

router.post('/', [
    validateJWT,
    check('idOrder', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('idOrder').custom(existsOrderById),
    validateFields,
    check('paymentType').custom(type => isAuthorizedPaymentType(type, AuthorizedPaymentType)),
    validateFields
], createPayment);

module.exports = router;