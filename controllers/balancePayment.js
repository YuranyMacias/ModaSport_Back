const { BalancePayment, Order, User } = require("../models");

const createBalancePayment = async (idOrder) => {
    try {
        const errors = [];

        const orderDB = await Order.findById(idOrder);
        const userDB = await User.findById(orderDB.customer);

        const totalOrder = parseFloat(orderDB.total);
        const walletBalanceUser = parseFloat(userDB.walletBalance);

        if (walletBalanceUser <= 0) {
            errors.push({ message: `Saldo insuficiente. El saldo del usuario es ${walletBalanceUser}.`});
        }

        if (totalOrder > walletBalanceUser) {
            errors.push({
                message: `Saldo insuficiente. Total del pedido: ${totalOrder}. Saldo actual: ${walletBalanceUser}.  `
            });
        }

        if (errors.length > 0) {
            return { errors };
        }

        const currentWalletBalance = walletBalanceUser - totalOrder;

        const balancePayment = new BalancePayment({ amount: totalOrder });
        await balancePayment.save();

        await User.findByIdAndUpdate(userDB._id, { walletBalance: currentWalletBalance }, { new: true });

        return {
            status: 'COMPLETED',
            details: balancePayment
        };
    } catch (error) {
        console.log('Error al crear pago del pedido: ', error)
        return {
            errors: [{error: 'Se ha producido un error al crear pago del pedido.'}]
        };
    }
}


module.exports = {
    createBalancePayment
}