const { request, response } = require("express")

const isAuthenticatedUser = (authenticatedUser) => {
    const isValid = (!!authenticatedUser);
    const message = isValid ? '' : 'Quiere verificar el rol sin validar primero el token.';
    return {
        isValid,
        message
    };
}

const isAdminRole = (req = request, res = response, next) => {
    const { isValid, message } = isAuthenticatedUser(req.authenticatedUser);
    if (!isValid) {
        return res.status(500).json({ message });
    }

    const { role, name } = req.authenticatedUser

    if (role !== 'ADMIN_ROLE') {
        return res.status(401).json({
            message: `${name} no es un usuario Administrador. No puede realizar esta acción.`
        });
    }

    next();
}

const isRole = (...roles) => {
    return (req = request, res = response, next) => {

        const { isValid, message } = isAuthenticatedUser(req.authenticatedUser);
        if (!isValid) {
            return res.status(500).json({ message });
        }

        if (!roles.includes(req.authenticatedUser.role)) {
            return res.status(401).json({
                message: `El servicio requiere uno de estos roles: ${roles} .`
            });
        }

        next();
    }
}

const isSameUserOrValidRoleToUpdateImages = (req = request, res = response, next) => {
    const { id, collection } = req.params;

    const { isValid, message } = isAuthenticatedUser(req.authenticatedUser);
    if (!isValid) {
        return res.status(500).json({ message });
    }

    const { role, name, _uid, _id, uid } = req.authenticatedUser;
    if (role === 'ADMIN_ROLE') {
        return next();
    }


    switch (collection) {
        case 'users':
            if (_id.toString() !== id) {
                return res.status(401).json({
                    message: `${name} no puede modificar otro usuario. No puede realizar esta acción.`
                });
            }
            break;

        case 'products':
            if (role !== 'SALES_ROLE') {
                return res.status(401).json({
                    message: `${name} no puede modificar imagenes del producto. No puede realizar esta acción.`
                });
            }
            break;

        default:
            return res.status(500).json({
                message: `Olvidé hacer ${collection} uploads`
            });
            break;
    }

    next();
}

const isSameUserOrAdminRole = (req = request, res = response, next) => {
    const { id } = req.params;

    const { isValid, message } = isAuthenticatedUser(req.authenticatedUser);
    if (!isValid) {
        return res.status(500).json({ message });
    }

    const { role, name, _id } = req.authenticatedUser;

    if (role === 'ADMIN_ROLE') {
        return next();
    }

    if (_id.toString() !== id) {
        return res.status(401).json({
            message: `${name} no pueden acceder a datos de otro usuario. No puede realizar esta acción.`
        });
    }

    next();
}

module.exports = {
    isAdminRole,
    isRole,
    isSameUserOrAdminRole,
    isSameUserOrValidRoleToUpdateImages,
}