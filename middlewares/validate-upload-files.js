const { request, response } = require("express")

const validateUploadFiles = (req = request, res = response, next) => {

    console.log(req.files)
    // console.log(Object.keys(req.files).length === 0)
    // console.log(req.files.file)

    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
        return res.status(400).json({
            message: 'No se ha cargado ningún archivo.'
        });
    }

    next();
}

module.exports = {
    validateUploadFiles
}