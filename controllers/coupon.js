const { request, response } = require("express");
const { v4: uuidv4 } = require('uuid');

const { 
    Coupon, 
    Order, 
    ShoppingCart 
} = require("../models");


const getCoupons = async (req = request, res = response) => {
    try {
        const { offset = 0, limit = 100 } = req.query;
        const queryStatus = { status: true };

        const [totalCoupons, coupons] = await Promise.all([
            Coupon.countDocuments(queryStatus),
            Coupon.find(queryStatus)
                .populate('user', 'name')
                .skip(Number(offset))
                .limit(Number(limit))
        ]);

        res.json({
            totalCoupons,
            coupons
        });
    } catch (error) {
        console.log('Error al consultar cupones: ', error)
        res.status(500).json({
            message: 'Error al consultar cupones.'
        });
    }
}

const getCouponById = async (req = request, res = response) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findById(id)
            .populate('user', 'name');

        res.json(coupon);
    } catch (error) {
        console.log('Error al consultar cupón por ID: ', error)
        res.status(500).json({
            message: 'Error al consultar cupón por ID.'
        });
    }
}

const createCoupon = async (req = request, res = response) => {
    try {
        const { status, code, user, ...body } = req.body;

        const codeCoupon = 'CP-' + uuidv4();

        const data = {
            code: codeCoupon,
            user: req.authenticatedUser._id,
            ...body,
        };

        const coupon = new Coupon(data);
        await coupon.save();

        res.json(coupon);
    } catch (error) {
        console.log('Error al crear cupón: ', error)
        res.status(500).json({
            message: 'Error al crear cupón.'
        });
    }
}

const updateCoupon = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const { status, user, ...data } = req.body;

        const coupon = await Coupon.findByIdAndUpdate(id, data, { new: true });

        res.json(coupon);
    } catch (error) {
        console.log('Error al altualizar cupón: ', error)
        res.status(500).json({
            message: 'Error al altualizar cupón.'
        });
    }
}

const deleteCoupon = async (req = request, res = response) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findByIdAndUpdate(id, { status: false }, { new: true });

        res.json(coupon);
    } catch (error) {
        console.log('Error al eliminar cupón: ', error)
        res.status(500).json({
            message: 'Error al eliminar cupón.'
        });
    }
}


/**
 * This function redeems a coupon for a shopping cart and updates the cart's total with the discount.
 * @param [req] - The request object, which contains information about the incoming HTTP request.
 * Include the `code` of the coupon and `IdShoppingCart` inside `req.body` for execution.
 * @param [res] - The `res` parameter is the response object that will be sent back to the client with
 * the result of the API call.
 * @returns a JSON response with the updated shopping cart object after applying a coupon discount. If
 * there is an error, it returns a JSON response with an error message and a 500 status code.
 */
const redeemCoupon = async (req = request, res = response) => {
    try {
        const { code, idShoppingCart } = req.body;

        const [shoppingCartDB, couponDB] = await Promise.all([
            ShoppingCart.findById(idShoppingCart),
            Coupon.findOne({code})
        ]);

        if (!shoppingCartDB || !shoppingCartDB.status) {
            return res.status(400).json({ message: `El carrito de compras no existe o no está disponible.` });
        }

        // if (shoppingCartDB.coupon) {
        //     return res.status(400).json({ message: `El carrito de compras ya tiene un cupón asignado.` });
        // }


        if (!couponDB || !couponDB.status) {
            return res.status(400).json({ message: `No existe cupón con el código: ${code}` });
        }

        if (couponDB.uses >= couponDB.maxUses) {
            return res.status(400).json({
                message: `Se ha superado el número máximo de usos del cupón.`
            });
        }

        if (!couponDB.isActive) {
            return res.status(400).json({ message: `El cupón no está activo.` });
        }

        const currentDate = new Date();
        if (couponDB.expirationDate <= currentDate) {
            return res.status(400).json({ message: `El cupón ha expirado.` });
        }

        const totalDiscount = parseFloat(shoppingCartDB.totalWithoutCoupon) * ((parseFloat(couponDB.discount) / 100));
        const totalShoppingCart = parseFloat(shoppingCartDB.totalWithoutCoupon) - totalDiscount;

        const dataShoppingCart = {
            coupon: couponDB._id,
            couponDiscount: couponDB.discount,
            totalCouponDiscount: totalDiscount,
            total: totalShoppingCart
        };

        const shoppingCart = await  ShoppingCart.findByIdAndUpdate(shoppingCartDB._id, dataShoppingCart, { new: true });

        return res.json(shoppingCart);

    } catch (error) {
        console.log('Error al canjear el cupón: ', error)
        res.status(500).json({
            message: 'Error al canjear el cupón.'
        });
    }
}

/**
 * This function removes a coupon from a shopping cart and updates the cart's total.
 * @param [req] - The request object, which contains information about the incoming HTTP request.
 * Include `IdShoppingCart` inside `req.params` for execution.
 * @param [res] - The `res` parameter is the response object that will be sent back to the client with
 * the response data. It is an instance of the `response` object from the Express.js framework.
 * @returns a JSON response with the updated shopping cart object after removing the coupon.
 */
const removeCoupon = async (req = request, res = response) => {
    try {
        const { idShoppingCart } = req.params;

        const shoppingCartDB = await ShoppingCart.findById(idShoppingCart);

        const dataShoppingCart = {
            coupon: null,
            couponDiscount: 0,
            totalCouponDiscount: 0,
            total: shoppingCartDB.totalWithoutCoupon
        };

        const shoppingCart = await  ShoppingCart.findByIdAndUpdate(shoppingCartDB._id, dataShoppingCart, { new: true });

        return res.json(shoppingCart);

    } catch (error) {
        console.log('Error al remover el cupón: ', error)
        res.status(500).json({
            message: 'Error al remover el cupón.'
        });
    }
}


/**
 * This function redeems a coupon on an order, updates the total with the discount and updates the coupon usage data.
 * @param [req] - The request object, which contains information about the incoming HTTP request.
 * Include the `code` of the coupon and `IdOrder` inside `req.body` for execution.
 * @param [res] - The `res` parameter is the response object that will be sent back to the client with
 * the result of the API call.
 * @returns a JSON response with the updated order data.
 */
const redeemCouponOnOrder = async (req = request, res = response) => {
    try {
        const { code, idOrder } = req.body;
        const userId = req.authenticatedUser._id;

        const [orderDB, couponDB] = await Promise.all([
            Order.findById(idOrder),
            Coupon.findOne({code})
        ]);

        if (!orderDB || !orderDB.status) {
            return res.status(400).json({ message: `El pedido no existe o no está disponible.` });
        }

        if (orderDB.coupon) {
            return res.status(400).json({ message: `El pedido ya tiene un cupón asignado.` });
        }


        if (!couponDB || !couponDB.status) {
            return res.status(400).json({ message: `No existe cupón con el código: ${code}` });
        }

        if (couponDB.uses >= couponDB.maxUses) {
            return res.status(400).json({
                message: `Se ha superado el número máximo de usos del cupón.`
            });
        }

        if (!couponDB.isActive) {
            return res.status(400).json({ message: `El cupón no está activo.` });
        }

        const currentDate = new Date();
        if (couponDB.expirationDate <= currentDate) {
            return res.status(400).json({ message: `El cupón ha expirado.` });
        }


        const totalDiscount = parseFloat(orderDB.totalWithoutCoupon) * ((parseFloat(couponDB.discount) / 100));
        const totalOrder = parseFloat(orderDB.totalWithoutCoupon) - totalDiscount;

        const dataOrder = {
            coupon: couponDB._id,
            couponDiscount: couponDB.discount,
            totalCouponDiscount: totalDiscount,
            total: totalOrder
        };

        const dataCoupon = {
            $push: { redeemedBy: userId },
            uses: (parseInt(couponDB.uses) + 1)
        };

        const [order, coupon] = await Promise.all([
            Order.findByIdAndUpdate(orderDB._id, dataOrder, { new: true }),
            Coupon.findByIdAndUpdate(couponDB._id, dataCoupon, { new: true })
        ]);

        return res.json({
            order, 
            coupon
        });

    } catch (error) {
        console.log('Error al canjear el cupón: ', error)
        res.status(500).json({
            message: 'Error al canjear el cupón.'
        });
    }
}


// Updates the order total when a coupon has already been assigned and the order details are updated.
const updateTotalShoppingCartWithCoupon = async (req = request, res = response) => {
    try {
        const { idShoppingCart, idCoupon } = req.body;

        const [shoppingCartDB, couponDB] = await Promise.all([
            ShoppingCart.findById(idShoppingCart),
            Coupon.findById(idCoupon)
        ]);
        

        if (!shoppingCartDB || !shoppingCartDB.status) {
            return res.status(400).json({ message: `El pedido no existe o no está disponible.` });
        }
  
        if (!couponDB || !couponDB.status) {
            return res.status(400).json({ message: `El cupón no existe o no está disponible.` });
        }

        const totalDiscount = parseFloat(shoppingCartDB.totalWithoutCoupon) * ((parseFloat(couponDB.discount) / 100));
        const totalShoppingCart = parseFloat(shoppingCartDB.totalWithoutCoupon) - totalDiscount;

        const dataShoppingCart = {
            couponDiscount: couponDB.discount,
            totalCouponDiscount: totalDiscount,
            total: totalShoppingCart
        };

        return await ShoppingCart.findByIdAndUpdate(shoppingCartDB._id, dataShoppingCart, { new: true });

    } catch (error) {
        console.log('Error al canjear el cupón: ', error)
        res.status(500).json({
            message: 'Error al canjear el cupón.'
        });
    }
}

const updateTotalOrderWithCoupon = async (req = request, res = response) => {
    try {
        const { idOrder, idCoupon } = req.body;

        const [orderDB, couponDB] = await Promise.all([
            Order.findById(idOrder),
            Coupon.findById(idCoupon)
        ]);
        

        if (!orderDB || !orderDB.status) {
            return res.status(400).json({ message: `El pedido no existe o no está disponible.` });
        }
  
        if (!couponDB || !couponDB.status) {
            return res.status(400).json({ message: `El cupón no existe o no está disponible.` });
        }

        const totalDiscount = parseFloat(orderDB.totalWithoutCoupon) * ((parseFloat(couponDB.discount) / 100));
        const totalOrder = parseFloat(orderDB.totalWithoutCoupon) - totalDiscount;

        const dataOrder = {
            couponDiscount: couponDB.discount,
            totalCouponDiscount: totalDiscount,
            total: totalOrder
        };

        return await Order.findByIdAndUpdate(orderDB._id, dataOrder, { new: true });

    } catch (error) {
        console.log('Error al canjear el cupón: ', error)
        res.status(500).json({
            message: 'Error al canjear el cupón.'
        });
    }
}

module.exports = {
    getCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    redeemCoupon,
    removeCoupon,
    redeemCouponOnOrder,
    updateTotalOrderWithCoupon,
    updateTotalShoppingCartWithCoupon
}