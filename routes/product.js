const { Router } = require("express");
const { check } = require("express-validator");

const { 
    validateJWT, 
    validateFields, 
    isAdminRole, 
    isRole
} = require("../middlewares");

const { 
    existsProductById, 
    existsCategoryById, 
    existsGenderById,
    existsSeasonById
} = require("../helpers/db-validators");

const { 
    getProducts, 
    getProductById, 
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/product");


const router = Router();

/**
 * {{url}}/api/products
 */

router.get('/', getProducts);


router.get('/:id', [
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsProductById),
    validateFields
], getProductById);


router.post('/', [
    validateJWT,
    isRole('ADMIN_ROLE', 'SALES_ROLE'),
    check('name', 'El nombre es obligatorio.').not().isEmpty(),
    check('description', 'La descripción es obligatorio.').not().isEmpty(),
    check('reference', 'La descripción es obligatorio.').not().isEmpty(),
    check('category', 'La categoría es obligatoria.').not().isEmpty(),
    check('category', 'Categoría no es un ID válido.').isMongoId(),
    check('gender', 'El genero es obligatorio.').not().isEmpty(),
    check('gender', 'Genero no es un ID válido.').isMongoId(),
    check('season', 'La temporada es obligatoria.').not().isEmpty(),
    check('season', 'Temporada no es un ID válido.').isMongoId(),
    validateFields,
    check('sizes', 'Las tallas son obligatorias.').not().isEmpty(),
    check('sizes').isArray().withMessage('Las tallas debe ser un arreglo'),
    validateFields,
    check('colors', 'Los colores son obligatorias.').not().isEmpty(),
    check('colors').isArray().withMessage('Los colores debe ser un arreglo'),
    validateFields,
    check('brand', 'La marca es obligatoria.').not().isEmpty(),
    check('category').custom(existsCategoryById),
    check('gender').custom(existsGenderById),
    check('season').custom(existsSeasonById),
    check('reference', 'La referencia es obligatoria.').not().isEmpty(),
    validateFields
], createProduct);


router.put('/:id', [
    validateJWT,
    isRole('ADMIN_ROLE', 'SALES_ROLE'),
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsProductById),
    check('category', 'Categoría no es un ID válido.').optional().isMongoId(),
    validateFields,
    check('category').optional().custom(existsCategoryById),
    validateFields
], updateProduct);


router.delete('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsProductById) ,
    validateFields
], deleteProduct);


module.exports = router;
