const { request, response } = require("express");

const { Season } = require('../models');


const getSeasons = async (req = request, res = response) => {
    const { offset = 0, limit = 10 } = req.query;
    const queryStatus = { status: true };

    const [totalSeasons, seasons] = await Promise.all([
        Season.countDocuments(queryStatus),
        Season.find(queryStatus)
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .skip(Number(offset))
            .limit(Number(limit))
    ]);

    res.json({
        totalSeasons,
        seasons
    });
}



const getSeasonById = async (req = request, res = response) => {
    const { id } = req.params;

    const season = await Season.findById(id).populate('user', 'name');

    res.json(season);
}


const createSeason = async (req = request, res = response) => {
    const name = req.body.name.toUpperCase();

    const existsSeason = await Season.findOne({ name });

    if (existsSeason) {
        return res.status(400).json({
            message: `La categoría ${existsSeason.name} ya existe.`
        });
    }

    // Generate data
    const data = {
        name,
        user: req.authenticatedUser._id
    }

    const season = new Season(data);
    await season.save();

    res.status(201).json(season);
}


const updateSeason = async (req = request, res = response) => {
    const { id } = req.params;
    const name = req.body.name.toUpperCase();
    const user = req.authenticatedUser._id;

    const data = {
        name,
        user
    }

    const season = await Season.findByIdAndUpdate(id, data, { new: true });
    res.json(season);
}


const deleteSeason = async (req = request, res = response) => {
    const { id } = req.params;
    const user = req.authenticatedUser._id;

    const season = await Season.findByIdAndUpdate(id, { status: false, user }, { new: true })

    res.json(season);
}

module.exports = {
    getSeasons,
    getSeasonById,
    createSeason,
    updateSeason,
    deleteSeason
}