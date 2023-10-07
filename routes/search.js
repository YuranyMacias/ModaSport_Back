const { Router } = require("express");

const { search } = require("../controllers/search");


const router = Router();

router.get('/:collection/:query', search);

module.exports = router;