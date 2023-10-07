const mongoose = require('mongoose');

const dbConnection = async() => {
    try {
        await  mongoose.connect( process.env.MONGODB_CNN);
        console.log('Database onlined')
    } catch (error) {
        throw new Error('Error connecting to DB: ' + error.message);
    }
}

module.exports = {
    dbConnection
}