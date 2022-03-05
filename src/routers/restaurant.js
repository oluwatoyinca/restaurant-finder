const express = require('express')
const router = new express.Router()
const restaurant = require('../utilities/restaurant')

router.post('/restaurant', (req, res) => {
    try {
        restaurant.validateCreate(req)
        restaurant.createRestaurant(req,res)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.post('/restaurants', (req, res) => {
   try {
        restaurant.validateGet(req)
        restaurant.getRestaurants(req,res)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/restaurants', (req, res) => {
   try {
        restaurant.deleteRestaurants(res)
    } catch(e) {
        res.status(400).send(e)
    }
})

module.exports = {router}