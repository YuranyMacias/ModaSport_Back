const { request, response } = require("express");

const { 
    Order, 
    OrderDetail, 
    Product 
} = require("../models");

const { 
    calculatePriceTotal, 
    calculateTotalOrderWithoutCoupon 
} = require("../helpers");

const { 
    updateTotalOrderWithCoupon, 
    redeemCouponOnOrder 
} = require("./coupon");

const getOrderDetailsByIdOrder = async (req = request, res = response) => {
    try {
        const { idOrder } = req.params;
        const orders = await OrderDetail.find({ order: idOrder });
        return res.json(orders);
    } catch (error) {
        console.log('Error al consultar detalles del pedido: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al consultar detalles del pedido.'
        });
    }
}

const createOrderDetail = async (req = request, res = response) => {
    try {
        const { products, idOrder, code } = req.body;
        let totalOrder = 0;
        const details = [];

        const productIds = products.map(product => product.id);
        const productDetails = await Product.find({ _id: { $in: productIds } });

        products.forEach((newProduct) => {
            const productDetail = productDetails.find(detail => detail._id.toString() === newProduct.id);

            const total = calculatePriceTotal(productDetail.price, newProduct.quantity, productDetail.discount);

            const orderDetail = new OrderDetail({
                order: idOrder,
                product: productDetail._id,
                quantity: newProduct.quantity,
                price: productDetail.price,
                discount: productDetail.discount,
                total
            });
            details.push(orderDetail);
            totalOrder += total;
        });

        const [orderDetailsUpdated, orderUpdated] = await Promise.all([
            OrderDetail.insertMany(details),
            Order.findByIdAndUpdate({ _id: idOrder }, { totalWithoutCoupon: totalOrder }, { new: true })
        ]);

       /* If the `code` coupon exists, the discount will be applied to the order total. */
        if (code) {
           return await redeemCouponOnOrder(req, res); 
        } 

        const order = await Order.findByIdAndUpdate({ _id: idOrder }, { total: totalOrder }, { new: true });

        return res.json({
            message: `Detalle pedido.`,
            order,
            details
        });

    } catch (error) {
        console.log('Error al crear el pedido: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al crear el pedido.'
        });
    }
}

const updateOrderDetail = async (req = request, res = response) => {
    try {
        const { idOrder } = req.params;
        const { products } = req.body;

        const productIds = products.map(product => product.id);
        const [orderDB, orderDetailsDB, productsDB] = await Promise.all([
            Order.findById(idOrder),
            OrderDetail.find({ order: idOrder }),
            Product.find({ _id: { $in: productIds } })
        ]);

        if (orderDB.orderStatus !== 'pending') {
            return res.status(400).json({
                message: `El pedido no puede modificarse después del pago. Enviar solicitud del caso para su revisión.`
            });
        }

        const promises = products.map(async (newProduct) => {
            const productDB = productsDB.find((product) => product._id.toString() === newProduct.id);
            const detailDB = orderDetailsDB.find((detail) => detail.product.toString() === newProduct.id);
            if (detailDB) {
                const totalDetails = calculatePriceTotal(productDB.price, newProduct.quantity, productDB.discount);
                return await OrderDetail.findByIdAndUpdate(detailDB._id, { price: productDB.price, quantity: newProduct.quantity, total: totalDetails }, { new: true });
            } else {
                const total = calculatePriceTotal(productDB.price, newProduct.quantity, productDB.discount);

                const newDetail = new OrderDetail({
                    order: idOrder,
                    product: newProduct.id,
                    quantity: newProduct.quantity,
                    price: productDB.price,
                    discount: productDB.discount,
                    total,
                });
                return await newDetail.save();
            }
        });

        await Promise.all(promises);

        const totalOrder = await calculateTotalOrderWithoutCoupon(idOrder);
        let order = await Order.findByIdAndUpdate(idOrder, { totalWithoutCoupon: totalOrder }, { new: true });

        // Update the order total by applying the redeemed coupon.
        if(order.coupon) {
            req.body.idOrder = idOrder;
            req.body.idCoupon = order.coupon;
            order = await updateTotalOrderWithCoupon(req, res);
        } else {
            order = await Order.findByIdAndUpdate(idOrder, { total: totalOrder }, { new: true });
        }

        return res.json({
            message: 'Pedido actualizado con exito..',
            order
        });
    } catch (error) {
        console.log('Error al actualizar orderm: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al actualizar el pedido.'
        });
    }
}

const deleteOrderDetail = async (req = request, res = response) => {
    try {
        const { idOrder } = req.params;
        const { details } = req.body;

        const orderDB = await Order.findById(idOrder);

        if (orderDB.orderStatus !== 'pending') {
            return res.status(400).json({
                message: `El pedido no puede modificarse después del pago. Enviar solicitud del caso para su revisión.`
            });
        }

        const deletedItems = await Promise.all(details.map(async (detail) => {
            console.log(detail.id);
            return await OrderDetail.findByIdAndUpdate(detail.id, { status: false }, { new: true });
        }));

        const totalOrder = await calculateTotalOrderWithoutCoupon(idOrder);
        let order = await Order.findByIdAndUpdate(idOrder, { totalWithoutCoupon: totalOrder }, { new: true });

        // Update the order total by applying the redeemed coupon.
        if(order.coupon) {
            req.body.idOrder = idOrder;
            req.body.idCoupon = order.coupon;
            order = await updateTotalOrderWithCoupon(req, res);
        } else {
            order = await Order.findByIdAndUpdate(idOrder, { total: totalOrder }, { new: true });
        }

        return res.json({
            message: 'Items eliminados.',
            order,
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
    getOrderDetailsByIdOrder,
    createOrderDetail,
    updateOrderDetail,
    deleteOrderDetail,
}