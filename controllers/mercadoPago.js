import mercadopage from "mercadopago";

const HOST = process.env.HOST;
const MERCADOPAGO_API_KEY = process.env.MERCADOPAGO_API_KEY;

export const createPaymentMercadoPago = async (req, res) => {
    const totalOrder = req.totalOrder;
  mercadopage.configure({
    access_token: MERCADOPAGO_API_KEY,
  });

  try {
    const result = await mercadopage.preferences.create({
      items: [
        {
          title: "Moda Sport Pedido.",
          unit_price: totalOrder,
          currency_id: "COP",
          quantity: 2,
        },
      ],
      notification_url: `/webhook`,
      back_urls: {
        success: `/success`,
        // pending: `${HOST}/pending`,
        // failure: `${HOST}/failure`,
      },
    });

    console.log('Create Order: ------------------> ', result);

    // res.json({ message: "Payment creted" });
    res.json(result.body);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const receiveWebhook = async (req, res) => {
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