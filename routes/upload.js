const { Router } = require("express");
const { check } = require("express-validator");

const {
    getImage,
    uploadFiles,
    updateImage,
    updateCloudImages
} = require("../controllers/uploads");

const {
    validateFields,
    validateUploadFiles,
    validateJWT,
    isSameUserOrValidRoleToUpdateImages
} = require("../middlewares");

const { iscollectionsAuthorized } = require("../helpers");

const collectionsAuthorized = ['users', 'products'];

const router = Router();

router.post('/', [
    validateJWT,
    validateUploadFiles,
    isSameUserOrValidRoleToUpdateImages,
    validateFields
], uploadFiles);
// ], updateCloudImages);

router.put('/:collection/:id', [
    validateJWT,
    validateUploadFiles,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('collection').custom(c => iscollectionsAuthorized(c, collectionsAuthorized)),
    isSameUserOrValidRoleToUpdateImages,
    validateFields
], updateCloudImages);
// ], updateImage);

router.get('/:collection/:id', [
    validateJWT,
    isSameUserOrValidRoleToUpdateImages,
    check('id', 'No es un ID válido.').isMongoId(),
    validateFields,
    check('collection').custom(c => iscollectionsAuthorized(c, collectionsAuthorized)),
    validateFields
], getImage);

module.exports = router;