const { Router } = require("express");
const { check } = require("express-validator");

const {
    validateJWT,
    validateFields,
    isAdminRole,
    isRole
} = require("../middlewares");

const {
    createSeason,
    getSeasons,
    getSeasonById,
    updateSeason,
    deleteSeason
} = require("../controllers/season");

const { existsSeasonById } = require("../helpers/db-validators");



const router = Router();

/**
 * {{url}}/api/seasons
 */


router.get('/', getSeasons);

router.get('/:id', [
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsSeasonById),
    validateFields
], getSeasonById);

router.post('/', [
    validateJWT,
    isRole('ADMIN_ROLE', 'SALES_ROLE'),
    check('name', 'El nombre es obligatorio.').not().isEmpty(),
    validateFields
], createSeason);

router.put('/:id', [
    validateJWT,
    isRole('ADMIN_ROLE', 'SALES_ROLE'),
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsSeasonById),
    check('name', 'El nombre es obligatorio.').not().isEmpty(),
    validateFields
], updateSeason);

router.delete('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('id').custom(existsSeasonById),
    validateFields
], deleteSeason);


module.exports = router;