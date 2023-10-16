const { request, response } = require("express");

const { ShoppingCartDetail, ShoppingCart } = require("../models");
const { createShoppingCartDetail } = require("./shoppingCartDetail");


const getShoppingCarts = async (req = request, res = response) => {
    try {
        const { offset = 0, limit = 100 } = req.query;
        const queryStatus = { status: true };

        const [totalShoppingCarts, shoppingCart] = await Promise.all([
            ShoppingCart.countDocuments(queryStatus),
            ShoppingCart.find(queryStatus)
                .populate('customer', 'name')
                .skip(Number(offset))
                .limit(Number(limit))
        ]);

        res.json({
            totalShoppingCarts,
            shoppingCart
        });
    } catch (error) {
        console.log('Error al consultar carrito de compras: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al consultar carrito de compras.'
        });
    }
}

const getShoppingCartById = async (req = request, res = response) => {
    try {
        const { id } = req.params;

        const [shoppingCart, details] = await Promise.all([
            ShoppingCart.find({ _id: id, status: true })
                .populate('coupon', 'code')
                .populate('customer', 'name'),
            ShoppingCartDetail.find({ shoppingCart: id, status: true })
                .populate('product', ['name', 'images'])
        ]);

        return res.json({
            shoppingCart,
            details
        });
    } catch (error) {
        console.log('Error al consultar carrito de compras por id: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al consultar carrito de compras por id.'
        });
    }
}

const createShoppingCart = async (req = request, res = response) => {
    try {
        let shoppingCart;
        if (req.authenticatedUser) {
            const customer = req.authenticatedUser._id;
            shoppingCart = new ShoppingCart({ customer });
        } else {
            shoppingCart = new ShoppingCart();
        }

        await shoppingCart.save();
        req.body.idShoppingCart = shoppingCart._id;
        return createShoppingCartDetail(req, res);

    } catch (error) {
        console.log('Error al crear carrito de compras: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al crear carrito de compras.'
        });
    }
}

const updateShoppingCart = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const customer = req.authenticatedUser._id;

        const shoppingCart = await ShoppingCart.findByIdAndUpdate(id, { customer }, { new: true });
        return res.json(shoppingCart);
    } catch (error) {
        console.log('Error al actualizar carrito de compras: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al actualizar carrito de compras.'
        });
    }
}

const deleteShoppingCart = async (req = request, res = response) => {
    try {
        const { id } = req.params;

        const shoppingCart = await ShoppingCart.findByIdAndDelete(id);
        res.json({
            message: 'Shopping cart deleted...',
            shoppingCart
        });
    } catch (error) {
        console.log('Error al eliminar carrito de compras: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al eliminar carrito de compras.'
        });
    }
}


const getShoppingCartByUserId = async (req = request, res = response) => {
    try {
        const id = req.authenticatedUser._id;

        const shoppingCart = await ShoppingCart.findOne({ customer: id, status: true })
            .populate('customer', 'name')
            .sort({ createdAt: -1 });
        if (shoppingCart?._id) {
            const details = await ShoppingCartDetail.find({ shoppingCart: shoppingCart._id, status: true })
                .populate('product', ['name', 'images'])

            return res.json({
                shoppingCart: [shoppingCart],
                details
            });
        }

        return res.json({
            message: 'El usuario no tiene carritos de comppra asignados.'
        });
    } catch (error) {
        console.log('Error al consultar carrito de compras por id: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al consultar carrito de compras por id.'
        });
    }
}


module.exports = {
    getShoppingCarts,
    getShoppingCartById,
    createShoppingCart,
    updateShoppingCart,
    deleteShoppingCart,
    getShoppingCartByUserId
}