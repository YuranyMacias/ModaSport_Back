const { Router } = require("express");
const { check } = require("express-validator");

const {
    validateJWT,
    validateFields,
    isAdminRole,
    isRole
} = require("../middlewares");

const {
    createGender,
    getGenders,
    getGenderById,
    updateGender,
    deleteGender
} = require("../controllers/gender");

const { existsGenderById } = require("../helpers/db-validators");


const router = Router();

/**
 * {{url}}/api/genders
 */

router.get('/', getGenders);

router.get('/:id', [
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsGenderById),
    validateFields
], getGenderById);

router.post('/', [
    validateJWT,
    isRole('ADMIN_ROLE', 'SALES_ROLE'),
    check('name', 'El nombre es obligatorio.').not().isEmpty(),
    validateFields
], createGender);

router.put('/:id', [
    validateJWT,
    isRole('ADMIN_ROLE', 'SALES_ROLE'),
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsGenderById),
    check('name', 'El nombre es obligatorio.').not().isEmpty(),
    validateFields
], updateGender);

router.delete('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsGenderById),
    validateFields
], deleteGender);


module.exports = router;