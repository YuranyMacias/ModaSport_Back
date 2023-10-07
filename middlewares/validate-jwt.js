const { request, response } = require('express');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const tokenName = 'x-token';

const validateJWT = async(req = request, res = response, next) => {
    const token = req.header(tokenName);
    if (!token) {
        return res.status(401).json({
            message: 'No hay token en la petición.'
        });
    }

    try {
        
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        
        // Authenticated user
        const authenticatedUser = await User.findById(uid);

        // Check if the user exists in DB.
        if ( !authenticatedUser ) {
            return res.status(401).json({
                message: 'Token no válido - Usuario no registrado.'
            });
        }

        // Check if the Authenticated user is active
        if ( !authenticatedUser.status ) {
            return res.status(401).json({
                message: 'Token no válido - Usuario inactivo.'
            });
        }


        req.authenticatedUser = authenticatedUser;
        next();
    } catch (error) {
        // console.log(error);
        res.status(401).json({
            message: 'Token no válido.'
        });
    }

}


const conditionalValidationJWT = async(req = request, res = response, next) => {
    if (req.query.skipJWTValidation) {
        return next();
    }
    await validateJWT(req, res, next); 
}

module.exports = {
    validateJWT,
    conditionalValidationJWT
}