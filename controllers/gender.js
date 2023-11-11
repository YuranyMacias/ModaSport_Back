const { request, response } = require("express");

const { Gender } = require('../models');



const getGenders = async (req = request, res = response) => {
    const { offset = 0, limit = 10 } = req.query;
    const queryStatus = { status: true };

    const [totalGenders, genders] = await Promise.all([
        Gender.countDocuments(queryStatus),
        Gender.find(queryStatus)
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .skip(Number(offset))
            .limit(Number(limit))
    ]);

    res.json({
        totalGenders,
        genders
    });
}



const getGenderById = async (req = request, res = response) => {
    const { id } = req.params;

    const gender = await Gender.findById(id).populate('user', 'name');

    res.json(gender);
}


const createGender = async (req = request, res = response) => {
    const name = req.body.name.toUpperCase();

    const existsGender = await Gender.findOne({ name });

    if (existsGender) {
        return res.status(400).json({
            message: `La categoría ${existsGender.name} ya existe.`
        });
    }

    // Generate data
    const data = {
        name,
        user: req.authenticatedUser._id
    }

    const gender = new Gender(data);
    await gender.save();

    res.status(201).json(gender);
}


const updateGender = async (req = request, res = response) => {
    const { id } = req.params;
    const name = req.body.name.toUpperCase();
    const user = req.authenticatedUser._id;

    const data = {
        name,
        user
    }

    const gender = await Gender.findByIdAndUpdate(id, data, { new: true });
    res.json(gender);
}


const deleteGender = async (req = request, res = response) => {
    const { id } = req.params;
    const user = req.authenticatedUser._id;

    const gender = await Gender.findByIdAndUpdate(id, { status: false, user }, { new: true })

    res.json(gender);
}

module.exports = {
    getGenders,
    getGenderById,
    createGender,
    updateGender,
    deleteGender
}