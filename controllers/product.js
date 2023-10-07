const { request, response } = require("express");
const { Product } = require("../models");


const getProducts = async (req = request, res = response) => {
    const { offset = 0, limit = 100 } = req.query;
    const queryStatus = { status: true };

    const [totalProducts, products] = await Promise.all([
        Product.countDocuments(queryStatus),
        Product.find(queryStatus)
            .populate('user', 'name')
            .populate('category', 'name')
            .populate('season', 'name')
            .populate('gender', 'name')
            .sort({ createdAt: -1 })
            .skip(Number(offset))
            .limit(Number(limit))
    ]);

    res.json({
        totalProducts,
        products
    });
}


const getProductById = async (req = request, res = response) => {
    const { id } = req.params;

    const product = await Product.findById(id)
        .populate('user', 'name')
        .populate('category', 'name')
        .populate('season', 'name')
        .populate('gender', 'name');

    res.json(product);
}


const createProduct = async (req = request, res = response) => {
    const { status, user, name, ...body } = req.body;
    const nameUpperCase = name.toUpperCase();

    const existsProduct = await Product.findOne({ name: nameUpperCase });

    if (existsProduct) {
        return res.status(400).json({
            message: `El producto ${existsProduct.name} ya existe.`
        });
    }

    const data = {
        name: nameUpperCase,
        user: req.authenticatedUser._id,
        ...body
    }

    const product = new Product(data);
    await product.save();

    res.status(201).json(product);
}


const updateProduct = async (req = request, res = response) => {
    const { id } = req.params;
    const { status, user, ...body } = req.body;

    const data = {
        user: req.authenticatedUser._id,
        ...body
    }

    if (body.name) {
        body.name = data.name.toUpperCase();
    }


    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    res.json(product);
}


const deleteProduct = async (req = request, res = response) => {
    const { id } = req.params;
    const user = req.authenticatedUser._id;

    const product = await Product.findByIdAndUpdate(id, { status: false, user }, { new: true });

    res.json(product);
}

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}