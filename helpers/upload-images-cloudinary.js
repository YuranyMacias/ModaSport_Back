const cloudinary = require('cloudinary').v2;
cloudinary.config(process.env.CLOUDINARY_URL);
const cloudinaryFolder = process.env.CLOUDINARY_FOLDER;


const uploadImagesCloudinary = async (images = [], model, collection, isMultipleImages = false) => {

    return new Promise(async (resolve, reject) => {
        try {
            const imagesModel = isMultipleImages ? model.images : [model.image];
            const pathCloud = (model.reference) 
                ? `${cloudinaryFolder}/${collection}/${model.reference}`
                : `${cloudinaryFolder}/${collection}`

            //  Delete previous images
            imagesModel.forEach((image) => {
                if (image) {
                    const name = image.split('/').pop();
                    const [public_id] = name.split('.');
                    cloudinary.uploader.destroy(`${pathCloud}/${public_id}`);
                }
            });

            //  Upload new images
            const tempPathImageUpdate = await Promise.all(
                images.map(async (image) => {
                    const { tempFilePath } = image;
                    const { secure_url } = await cloudinary.uploader.upload(tempFilePath, { folder: `${pathCloud}` });
                    return secure_url;
                })
            );

            //  Upload images array to model.
            if (isMultipleImages) {
                model.images = tempPathImageUpdate;
                return resolve(model);
            }

            //  Upload image to model.
            model.image = tempPathImageUpdate[0];
            return resolve(model);

        } catch (error) {
            reject({ message: "Error en la petición" });
        }
    });
}

module.exports = {
    uploadImagesCloudinary
}