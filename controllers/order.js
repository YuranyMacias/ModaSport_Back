const { request, response } = require("express");

const { Order, OrderDetail, User } = require("../models");
const { createOrderDetail } = require("./orderDetail");


const getOrders = async (req = request, res = response) => {
    const { offset = 0, limit = 100 } = req.query;
    const queryStatus = { status: true };

    const [totalOrders, orders] = await Promise.all([
        Order.countDocuments(queryStatus),
        Order.find(queryStatus)
            .populate('customer', 'name')
            .sort({ createdAt: -1 })
            .skip(Number(offset))
            .limit(Number(limit))
    ]);

    res.json({
        totalOrders,
        orders
    });
}

const getOrdersById = async (req = request, res = response) => {
    const customerId = req.authenticatedUser._id.toString();;
    const { id } = req.params;

    const [order, details] = await Promise.all([
        Order.find({ _id: id, status: true })
            .populate('customer', ['name', 'lastname', 'email']),
        OrderDetail.find({ order: id, status: true })
            .populate('product', 'name')
    ]);

    const customerIdOrder =  order?.[0]?.customer?._id?.toString() || '';

    if (customerIdOrder == customerId) {
        return res.json({ order, details });
    }

    return res.status(401).json({ message: 'Error el usuario no tiene autorización.' });
}

const createOrder = async (req = request, res = response) => {
    const customer = req.authenticatedUser._id;
    const order = new Order({ customer });

    await order.save();

    req.body.idOrder = order._id;
    return createOrderDetail(req, res);
}

const updateOrder = async (req = request, res = response) => {
    const { id } = req.params;
    const { status, customer, orderStatus } = req.body;

    const statusOrderUpdate = ['pending', 'confirmed', 'processing']
    const orderTemp = await Order.findById(id);

    if (orderTemp.orderStatus === 'cancelled') {
        return res.status(400).json({
            message: `El pedido ha sido cancelado.No puede modificarse.`
        });
    }

    if (!statusOrderUpdate.includes(orderTemp.orderStatus)) {
        return res.status(400).json({
            message: `El pedido ya ha sido enviado y no puede modificarse. Realizar el proceso de devolución.`
        });
    }

    let dataToUpdate = {};
    // Cancel or pay the order.
    if (orderTemp.orderStatus === 'pending') {
        if (orderStatus === 'cancelled') {
            dataToUpdate.orderStatus = 'cancelled';
        }
    }

    if (Object.keys(dataToUpdate).length > 0) {
        const order = await Order.findByIdAndUpdate(id, dataToUpdate, { new: true });
        return res.json(order);
    }

    return res.json({
        message: 'Datos enviados no válidos, intentando actualizar algo que no existe.'
    });
}

const deleteOrder = async (req = request, res = response) => {
    const { id } = req.params;
    const user = req.authenticatedUser._id;

    const order = await Order.findByIdAndUpdate(id, { status: false }, { new: true });
    res.json(order);
}

const getOrdersByUserId = async (req = request, res = response) => {
    try {
        const id = req.authenticatedUser._id;

        const user = User.findById(id);

        if (user.role === "ADMIN_ROLE") {
            return getOrders();
        }


        const orders = await Order.find({ customer: id, status: true })
            .populate('customer', 'name')
            .sort({ createdAt: -1 });

        return res.json({
            orders
        });


    } catch (error) {
        console.log('Error al consultar ordenes por id: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al consultar ordenes por id.'
        });
    }
}


module.exports = {
    getOrders,
    getOrdersById,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrdersByUserId,
}