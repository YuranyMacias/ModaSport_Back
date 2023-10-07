const path = require("path");
const fs = require("fs");
const { request, response } = require("express");

const { uploadsFiles,
    isValidFileFormat,
    validateImages,
    uploadImagesCloudinary
} = require("../helpers");

const { User, Product } = require("../models");

const uploadFiles = async (req = request, res = response) => {
    try {
        // txt, md
        // const name = await uploadsFiles(req.files, ['txt', 'md'], 'texts');
        const name = await uploadsFiles(req.files, undefined, 'imgs');

        res.json(name);
    } catch (error) {
        res.status(400).json({
            message: error
        });
    }

}

const updateImage = async (req = request, res = response) => {
    const { id, collection } = req.params;
    let model;

    switch (collection) {
        case 'users':
            model = await User.findById(id);
            if (!model) {
                return res.status(400).json({
                    message: `No existe un usuario con el id ${id}`
                });
            }
            break;

        case 'products':
            model = await Product.findById(id);
            if (!model) {
                return res.status(400).json({
                    message: `No existe un producto con el id ${id}`
                });
            }
            break;

        default:
            return res.status(500).json({
                message: `Olvidé hacer ${collection} uploads`
            });
    }

    //  Delete previous images
    if (model.img) {
        const pathImg = path.join(__dirname, '../uploads', collection, model.img);
        if (fs.existsSync(pathImg)) {
            fs.unlinkSync(pathImg);
        }
    }

    const nameFile = await uploadsFiles(req.files, undefined, collection);
    model.img = nameFile;
    await model.save();

    res.json(model);

}


const updateCloudImages = async (req = request, res = response) => {
    const { id, collection } = req.params;
    const { file } = req.files;
    let model;

    console.log(file)
    
    const images = (Array.isArray(file)) ? file : [file];

    try {
        switch (collection) {
            case 'users':
                await validateImages(images, collection, false);
                model = await User.findById(id);
                if (!model) {
                    return res.status(400).json({
                        message: `No existe un usuario con el id ${id}`
                    });
                }
                model = await uploadImagesCloudinary(images, model, collection, false);
                break;

            case 'products':
                await validateImages(images, collection, true);
                model = await Product.findById(id);
                if (!model) {
                    return res.status(400).json({
                        message: `No existe un producto con el id ${id}`
                    });
                }
                model = await uploadImagesCloudinary(images, model, collection, true);
                break;

            default:
                return res.status(500).json({
                    message: `Olvidé hacer ${collection} uploads`
                });
        }

        await model.save();
        return res.json(model);

    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }
}

const getImage = async (req = request, res = response) => {
    const { id, collection } = req.params;
    let model;

    switch (collection) {
        case 'users':
            model = await User.findById(id);
            if (!model) {
                return res.status(400).json({
                    message: `No existe un usuario con el id ${id}`
                });
            }
            break;

        case 'products':
            model = await Product.findById(id);
            if (!model) {
                return res.status(400).json({
                    message: `No existe un producto con el id ${id}`
                });
            }
            break;

        default:
            return res.status(500).json({
                message: `Olvidé hacer ${collection} uploads`
            });
    }

    if (model.img) {
        const pathImg = path.join(__dirname, '../uploads', collection, model.img);
        if (fs.existsSync(pathImg)) {
            return res.sendFile(pathImg);
        }
    }

    const pathImg = path.join(__dirname, '../assets/no-image.png');
    if (fs.existsSync(pathImg)) {
        return res.sendFile(pathImg);
    }

    res.status(500).json({
        message: 'Image not found.'
    });

}

module.exports = {
    uploadFiles,
    updateImage,
    updateCloudImages,
    getImage,
}