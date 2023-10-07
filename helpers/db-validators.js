const {
    Category,
    Product,
    Role,
    User,
    Order,
    Coupon,
    Gender,
    ShoppingCart,
    Payment,
    Season,
    ShoppingCartDetail,
} = require('../models');

const isValidRole = async (role = '') => {
    const existsRole = await Role.findOne({ role });
    if (!existsRole) {
        throw new Error(`El rol ${role} no está registrado en la DB`);
    }
}

const existsEmail = async (email = '') => {
    const exists = await User.findOne({ email });

    if (exists) {
        throw new Error(`El email ${email}, ya está registrado.`);
    }
}


const existsUserById = async (id = '') => {
    const existsUser = await User.findById(id);

    if (!existsUser) {
        throw new Error(`El id ' ${id} ' no está registrado.`);
    }
}


const existsCategoryById = async (id = '') => {
    const existsCategory = await Category.findById(id);

    if (!existsCategory) {
        throw new Error(`El id ' ${id} ' no está registrado.`);
    }
}

const existsSeasonById = async (id = '') => {
    const existsSeason = await Season.findById(id);

    if (!existsSeason) {
        throw new Error(`El id ' ${id} ' no está registrado.`);
    }
}

const existsGenderById = async (id = '') => {
    const existsGender = await Gender.findById(id);

    if (!existsGender) {
        throw new Error(`El id ' ${id} ' no está registrado.`);
    }
}


const existsProductById = async (id = '') => {
    const existsProduct = await Product.findById(id);

    if (!existsProduct) {
        throw new Error(`El id ' ${id} ' no está registrado.`);
    }
}

const existsOrderById = async (id = '') => {
    const existsOrder = await Order.findById(id);

    if (!existsOrder) {
        throw new Error(`El pedido con id ' ${id} ' no está registrado.`);
    }
}

const existsShoppingCartById = async (id = '') => {
    const existsShoppingCart = await ShoppingCart.findById(id);

    if (!existsShoppingCart) {
        throw new Error(`El carrito de compras con id ' ${id} ' no está registrado.`);
    }
}

const existsShoppingCartDetailById = async (id = '') => {
    const existsShoppingCart = await ShoppingCartDetail.findById(id);

    if (!existsShoppingCart) {
        throw new Error(`El item con id ' ${id} ' no está registrado.`);
    }
}


const existsCouponById = async (id = '') => {
    const existsCoupon = await Coupon.findById(id);

    if (!existsCoupon) {
        throw new Error(`El cupón coon id ' ${id} ' no está registrado.`);
    }
}


const existsPaymentById = async (id = '') => {
    const existsPayment = await Payment.findById(id);

    if (!existsPayment) {
        throw new Error(`El pago con con id ' ${id} ' no está registrado.`);
    }
}


/**
 * Validate authorized payment types.
 */

const isAuthorizedPaymentType = (paymentType = '', authorizedPaymentType = []) => {
    const isIncluded = authorizedPaymentType.includes(paymentType);
    if (!isIncluded) {
        throw new Error(`Tipo de pago (${paymentType}) no está autorizado, Autorizados: ${authorizedPaymentType}`);
    }
    return true;
}

/**
 * Validate authorized collections.
 */

const iscollectionsAuthorized = (collection = '', collections = []) => {
    const isIncluded = collections.includes(collection);
    if (!isIncluded) {
        throw new Error(`Colección (${collection}) no está autorizada, Autorizadas: ${collections}`);
    }
    return true;
}

/**
 * Validates if each array position is an object.
 */
const isArrayOfObject = (list = []) => {
    if (!list.every((item) => typeof item === 'object')) {
        throw new Error('Cada item deben ser un objeto.');
    }
    return true;
}


module.exports = {
    isValidRole,
    existsEmail,
    existsCategoryById,
    existsCouponById,
    existsGenderById,
    existsProductById,
    existsPaymentById,
    existsSeasonById,
    existsUserById,
    existsOrderById,
    existsShoppingCartById,
    existsShoppingCartDetailById,
    isAuthorizedPaymentType,
    iscollectionsAuthorized,
    isArrayOfObject
}