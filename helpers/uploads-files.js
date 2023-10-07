const { v4: uuidv4 } = require('uuid');
const path = require("path");

const extensionsValidForImages = ['png', 'jpg', 'jpeg', 'webp'];

const isValidFileFormat = (file, extensionsValid = extensionsValidForImages) => {
    const extension = file.name.split('.').pop();
    const isValid = extensionsValid.includes(extension);
    const message = isValid ? '' : `Extensión de archivo no válida: (${extension}), Extensiones válidas: ${extensionsValid}.`;

    return {
        isValid,
        message
    };
}

const validateImages = (images = [], collection, isMultipleImages = false) => {
    return new Promise((resolve, reject) => {

        if ( !isMultipleImages && images.length > 1) {
            return reject({ message: `${collection} almacena solo una (1) imagen.` });
        }

        for (const image of images) {
            const { isValid, message } = isValidFileFormat(image);
            if (!isValid) {
                return reject({message});
            }
        }

        resolve({isValid: true});
    });
}


const uploadsFiles = (files, extensionsValid = extensionsValidForImages, folderName = '') => {
    return new Promise((resolve, reject) => {
        const { file } = files;

        const extension = file.name.split('.').pop();

        // Validating file extensions.
        const { isValid, message } = isValidFileFormat(req.files.file, extensionsValid);
        if (!isValid) {
            return reject(message);
        }

        const nameTemp = uuidv4() + '.' + extension;

        const uploadPath = path.join(__dirname, '../uploads/', folderName, nameTemp);


        file.mv(uploadPath, (err) => {
            if (err) {
                return reject(err);
            }
            resolve(nameTemp);
        });
    });
}

module.exports = {
    uploadsFiles,
    validateImages,
    isValidFileFormat
}