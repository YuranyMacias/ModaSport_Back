const { request, response } = require("express");

const { Payment, Order } = require("../models");
const { createBalancePayment } = require("./balancePayment");



const getPayments = async (req = request, res = response) => {
    try {
        const { offset = 0, limit = 100 } = req.query;
        const queryStatus = { status: true };

        const [totalPayments, payments] = await Promise.all([
            Payment.countDocuments(queryStatus),
            Payment.find(queryStatus)
        ]);

        res.json({
            totalPayments,
            payments
        });
    } catch (error) {
        console.log('Error al consultar pagos del pedido: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al consultar pagos del pedido.'
        });
    }
}

const getPaymentById = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findOne({ _id: id, status: true });

        return res.json({ payment });
    } catch (error) {
        console.log('Error al consultar pago del pedido: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al consultar pago del pedido.'
        });
    }
}

const createPayment = async (req = request, res = response) => {
    try {
        const { idOrder, paymentType } = req.body;
        const user = req.authenticatedUser._id;

        const orderDB = await Order.findById(idOrder)
            .populate('customer', 'name')
            .populate('payment', ['type', 'isPaid']);

        if (orderDB.payment) {
            return res.status(400).json({
                message: 'El pedido ya cuenta con un pago.',
                order: orderDB
            });
        }


        let paymentDetail;
        switch (paymentType) {
            case 'balance':
                paymentDetail = await createBalancePayment(idOrder);
                break;
            case 'card':
                // paymentDetail = await createBalancePayment(req, res);
                break;
            case 'paypal':
                // paymentDetail = await createBalancePayment(req, res);
                break;

            default:
                return res.status(400).json({
                    message: `El tipo de pago: ${paymentType} . No coinside con los tipos de pago actuales actuales.`
                });
                break;
        }


        const { errors = [], status, details } = paymentDetail;

        if (errors.length > 0) {
            return res.status(400).json(errors);
        }

        if (status === 'COMPLETED') {
            const payment = new Payment({ user, type: paymentType, paymentDetails: details._id, isPaid: true });
            await payment.save();

            const order = await Order.findByIdAndUpdate(
                idOrder,
                { payment: payment._id, orderStatus: 'confirmed' },
                { new: true }
            );

            return res.json({
                order,
                payment,
                paymentDetails: {
                    status,
                    details
                },
            });
        }

        return res.status(500).json({
            message: `Error de pagos.`
        });

    } catch (error) {
        console.log('Error al crear pago del pedido: ', error)
        return res.status(500).json({
            message: 'Se ha producido un error al crear pago del pedido.'
        });
    }

}


module.exports = {
    getPayments,
    getPaymentById,
    createPayment
}