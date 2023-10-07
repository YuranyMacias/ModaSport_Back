const { Router } = require("express");
const { check } = require("express-validator");

const {
    validateJWT,
    validateFields,
    isAdminRole,
    isRole
} = require("../middlewares");

const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require("../controllers/category");

const { existsCategoryById } = require("../helpers/db-validators");



const router = Router();

/**
 * {{url}}/api/categories
 */

// Public - Gel all categories
router.get('/', getCategories);

// Public - Obtener una categoria por id 
router.get('/:id', [
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsCategoryById),
    validateFields
], getCategoryById);

// Private - Valid token-  Create category
router.post('/', [
    validateJWT,
    isRole('ADMIN_ROLE', 'SALES_ROLE'),
    check('name', 'El nombre es obligatorio.').not().isEmpty(),
    validateFields
], createCategory);

// Private - Valid token - Update category
router.put('/:id', [
    validateJWT,
    isRole('ADMIN_ROLE', 'SALES_ROLE'),
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsCategoryById),
    check('name', 'El nombre es obligatorio.').not().isEmpty(),
    validateFields
], updateCategory);

// Private - ADMIN_ROLE - Delete category
router.delete('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsCategoryById),
    validateFields
], deleteCategory);



module.exports = router;