const mercadopage = require('mercadopago');

const HOST = process.env.HOST;
const MERCADOPAGO_API_KEY = process.env.MERCADOPAGO_API_KEY;

const createPaymentMercadoPago = async (req, res) => {

  const total = await req.totalOrder;

  mercadopage.configure({
    access_token: MERCADOPAGO_API_KEY,
  });

  try {
    const result = await mercadopage.preferences.create({
      items: [
        {
          title: "Moda Sport Pedido.",
          unit_price: total,
          currency_id: "COP",
          quantity: 1,
        },
      ],
      notification_url: `moda-sport.vercel.app/api/payments/webhook`,
      back_urls: {
        success: `moda-sport.vercel.app/api/payments/success`,
        // pending: `${HOST}/pending`,
        // failure: `${HOST}/failure`,
      },
    });

    // console.log('Create Order: ------------------> ', result);

    // return res.json({ message: "Payment creted" });
    return result.body;
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

const receiveWebhook = async (req, res) => {
  try {
    const payment = req.query;
    console.log('payment: ------------------> ', payment);
    if (payment.type === "payment") {
      const data = await mercadopage.payment.findById(payment["data.id"]);
      console.log(data);
    }

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

module.exports = {
  createPaymentMercadoPago,
  receiveWebhook
}