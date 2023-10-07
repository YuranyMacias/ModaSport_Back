const { request, response } = require("express");

const {
    Product,
    ShoppingCartDetail,
    ShoppingCart
} = require("../models");

const {
    calculatePriceTotal,
    calculateTotalShoppingCartWithoutCoupon
} = require("../helpers");

const { updateTotalShoppingCartWithCoupon } = require("./coupon");

const getDetailsByIdShoppingCart = async (req = request, res = response) => {
    try {
        const { idShoppingCart } = req.params;
        const shoppingCart = await ShoppingCartDetail.find({ shoppingCart: idShoppingCart });
        return res.json(shoppingCart);
    } catch (error) {
        console.log('Error al consultar detalles del carrito de compras: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al consultar detalles del carrito de compras.'
        });
    }
}

const getDetailsByIdItem = async (req = request, res = response) => {
    try {
        const { idItem } = req.params;
        
        const shoppingCart = await ShoppingCartDetail.find({ _id: idItem, status: true })
            .populate('product', ['name', 'id', 'images', 'stock', 'colors', 'sizes']);

        return res.json(shoppingCart);
    } catch (error) {
        console.log('Error al consultar detalles del carrito de compras: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al consultar detalles del carrito de compras.'
        });
    }
}

const createShoppingCartDetail = async (req = request, res = response) => {
    try {
        const { products, idShoppingCart } = req.body;

        const details = [];

        const shoppingCartDB = await ShoppingCart.findById(idShoppingCart);
        const productIds = products.map(product => product.id);
        const productDetails = await Product.find({ _id: { $in: productIds } });

        let totalShoppingCart = (shoppingCartDB.totalWithoutCoupon) ? parseInt(shoppingCartDB.totalWithoutCoupon) : 0;
        products.forEach((newProduct) => {
            const productDetail = productDetails.find(detail => detail._id.toString() === newProduct.id);

            const total = calculatePriceTotal(productDetail.price, newProduct.quantity, productDetail.discount);

            const shoppingCartDetail = new ShoppingCartDetail({
                shoppingCart: idShoppingCart,
                product: productDetail._id,
                quantity: newProduct.quantity,
                color: newProduct.color,
                size: newProduct.size,
                price: productDetail.price,
                discount: productDetail.discount,
                total
            });
            details.push(shoppingCartDetail);
            totalShoppingCart += total;
        });

        const [shoppingCartDetailsUpdated, shoppingCart] = await Promise.all([
            ShoppingCartDetail.insertMany(details),
            ShoppingCart.findByIdAndUpdate({ _id: idShoppingCart },
                {
                    totalWithoutCoupon: totalShoppingCart,
                    total: totalShoppingCart
                },
                { new: true })
        ]);

        return res.json({
            message: `Detalle carrito de compras...`,
            shoppingCart,
            details
        });

    } catch (error) {
        console.log('Error al crear el carrito de compras: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al crear el carrito de compras.'
        });
    }
}

const updateShoppingCartDetail = async (req = request, res = response) => {
    try {
        const { idShoppingCart } = req.params;
        const { item } = req.body;

        const {itemId, quantity, color, size} = item[0];

        const shoppingCartDetailsDB = await ShoppingCartDetail.findById(itemId);
        console.log(shoppingCartDetailsDB)
        const productDB = await Product.findById(shoppingCartDetailsDB.product._id);
        console.log(productDB)
        
        if(shoppingCartDetailsDB, productDB) {
            const data = {}

            if (quantity !== shoppingCartDetailsDB.quantity) {
                data.quantity = quantity;
                data.price = productDB.price;
                const totalDetails = calculatePriceTotal(productDB.price, quantity, productDB.discount);
                data.total = totalDetails;
            }

            if (color !== shoppingCartDetailsDB.color) {
                data.color = color;
            }

            if (size !== shoppingCartDetailsDB.size) {
                data.size = size;
            }

            await ShoppingCartDetail.findByIdAndUpdate(itemId, data, { new: true });
        }

        const totalShoppingCart = await calculateTotalShoppingCartWithoutCoupon(idShoppingCart);
        let shoppingCart = await ShoppingCart.findByIdAndUpdate(idShoppingCart, { totalWithoutCoupon: totalShoppingCart }, { new: true });

        // Update the shoppingCart total by applying the redeemed coupon.
        if (shoppingCart.coupon) {
            req.body.idShoppingCart = idShoppingCart;
            req.body.idCoupon = shoppingCart.coupon;
            shoppingCart = await updateTotalShoppingCartWithCoupon(req, res);
        } else {
            shoppingCart = await ShoppingCart.findByIdAndUpdate(idShoppingCart, { total: totalShoppingCart }, { new: true });
        }

        return res.json({
            message: 'Carrito actualizado con exito..',
            shoppingCart
        });


        // const productIds = products.map(product => product.id);
        // const [shoppingCartDB, shoppingCartDetailsDB, productsDB] = await Promise.all([
        //     ShoppingCart.findById(idShoppingCart),
        //     ShoppingCartDetail.find({ shoppingCart: idShoppingCart }),
        //     Product.find({ _id: { $in: productIds } })
        // ]);

        // const promises = products.map(async (newProduct) => {
        //     const productDB = productsDB.find((product) => product._id.toString() === newProduct.id);
        //     const detailDB = shoppingCartDetailsDB.find((detail) => detail.product.toString() === newProduct.id);
        //     if (detailDB) {
        //         if (newProduct.quantity !== detailDB.quantity) {
        //             const totalDetails = calculatePriceTotal(productDB.price, newProduct.quantity, productDB.discount);
        //             return await ShoppingCartDetail.findByIdAndUpdate(detailDB._id, { price: productDB.price, quantity: newProduct.quantity, total: totalDetails }, { new: true });
        //         }
        //         if (newProduct.color !== detailDB.color) {
        //             return await ShoppingCartDetail.findByIdAndUpdate(detailDB._id, { color: newProduct.color }, { new: true });
        //         }
        //         if (newProduct.size !== detailDB.size) {
        //             return await ShoppingCartDetail.findByIdAndUpdate(detailDB._id, { size: newProduct.size }, { new: true });
        //         }
        //     } else {
        //         const total = calculatePriceTotal(productDB.price, newProduct.quantity, productDB.discount);

        //         const newDetail = new ShoppingCartDetail({
        //             shoppingCart: idShoppingCart,
        //             product: productDetail._id,
        //             quantity: newProduct.quantity,
        //             color: newProduct.color,
        //             size: newProduct.size,
        //             price: productDetail.price,
        //             discount: productDetail.discount,
        //             total,
        //         });
        //         return await newDetail.save();
        //     }
        // });

        // await Promise.all(promises);

        // const totalShoppingCart = await calculateTotalShoppingCartWithoutCoupon(idShoppingCart);
        // let shoppingCart = await ShoppingCart.findByIdAndUpdate(idShoppingCart, { totalWithoutCoupon: totalShoppingCart }, { new: true });

        // // Update the shoppingCart total by applying the redeemed coupon.
        // if (shoppingCart.coupon) {
        //     req.body.idShoppingCart = idShoppingCart;
        //     req.body.idCoupon = shoppingCart.coupon;
        //     shoppingCart = await updateTotalShoppingCartWithCoupon(req, res);
        // } else {
        //     shoppingCart = await ShoppingCart.findByIdAndUpdate(idShoppingCart, { total: totalShoppingCart }, { new: true });
        // }

        // return res.json({
        //     message: 'Carrito actualizado con exito..',
        //     shoppingCart
        // });
    } catch (error) {
        console.log('Error al actualizar carrito de compra: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al actualizar el carrito de compra.'
        });
    }
}

const deleteShoppingCartDetail = async (req = request, res = response) => {
    try {
        const { idShoppingCart } = req.params;
        const { details } = req.body;

        const deletedItems = await Promise.all(details.map(async (detail) => {
            console.log(detail.id);
            return await ShoppingCartDetail.findByIdAndRemove(detail.id);
        }));

        const totalShoppingCart = await calculateTotalShoppingCartWithoutCoupon(idShoppingCart);
        let shoppingCart = await ShoppingCart.findByIdAndUpdate(idShoppingCart, { totalWithoutCoupon: totalShoppingCart }, { new: true });

        // Update the shoppingCart total by applying the redeemed coupon.
        if (shoppingCart.coupon) {
            req.body.idShoppingCart = idShoppingCart;
            req.body.idCoupon = shoppingCart.coupon;
            shoppingCart = await updateTotalShoppingCartWithCoupon(req, res);
        } else {
            shoppingCart = await ShoppingCart.findByIdAndUpdate(idShoppingCart, { total: totalShoppingCart }, { new: true });
        }

        return res.json({
            message: 'Items eliminados.',
            shoppingCart,
            deletedItems
        });

    } catch (error) {
        console.log('Error al eliminar detallel pedido: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al eliminar el producto del pedido.'
        });
    }
}


module.exports = {
    getDetailsByIdShoppingCart,
    createShoppingCartDetail,
    updateShoppingCartDetail,
    deleteShoppingCartDetail,
    getDetailsByIdItem,
}