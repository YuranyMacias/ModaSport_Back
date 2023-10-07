
const express = require('express')
const cors = require('cors');
const fileUpload = require('express-fileupload');

const { dbConnection } = require('../database/config');

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 8080;

        this.paths = {
            auth: '/api/auth',
            categories: '/api/categories',
            coupons: '/api/coupons',
            genders: '/api/genders',
            orders: '/api/orders',
            orderDetails: '/api/order-details',
            products: '/api/products',
            payments: '/api/payments',
            search: '/api/search',
            seasons: '/api/seasons',
            shoppingCart: '/api/shopping-cart',
            shoppingCartDetails: '/api/shopping-cart-details',
            users: '/api/users',
            uploads: '/api/uploads'
        }

        // Connect to database
        this.connectDB();

        // Middleware
        this.middlewares();


        this.routes();
    }

    async connectDB() {
        await dbConnection();
    }

    middlewares() {

        // CORS
        this.app.use(cors());

        // Reading and parsing of received data.
        this.app.use(express.json());

        // Public directory
        this.app.use(express.static('public'))

        // FileUpload 
        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: '/tmp/',
            createParentPath: true
        }));
    }


    routes() {
        this.app.use(this.paths.auth, require('../routes/auth'))
        this.app.use(this.paths.categories, require('../routes/category'))
        this.app.use(this.paths.coupons, require('../routes/coupon'))
        this.app.use(this.paths.genders, require('../routes/gender'))
        this.app.use(this.paths.orders, require('../routes/order'))
        this.app.use(this.paths.orderDetails, require('../routes/orderDetail'))
        this.app.use(this.paths.products, require('../routes/product'))
        this.app.use(this.paths.payments, require('../routes/payment'))
        this.app.use(this.paths.search, require('../routes/search'))
        this.app.use(this.paths.seasons, require('../routes/season'))
        this.app.use(this.paths.shoppingCart, require('../routes/shoppingCart'))
        this.app.use(this.paths.shoppingCartDetails, require('../routes/shoppingCartDetail'))
        this.app.use(this.paths.users, require('../routes/user'))
        this.app.use(this.paths.uploads, require('../routes/upload'))
    }


    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en el puerto: ', this.port)
        });
    }
}

module.exports = Server;