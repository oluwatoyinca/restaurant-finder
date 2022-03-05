const fs = require('fs')
var means = []

const containsAll = (a1,a2) => {
    const my = a1.every(element => {
      return a2.includes(element)
    })
    return my
}

const dynamicSort= (property) => {
    if((property === "rating") || (property === "distance")) {
        var sortOrder = 1
        if(property === "rating") {
            sortOrder = -1
        }
        return function (a,b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0
            return result * sortOrder
        }
    }
    else{
        throw ({"message": "Order priority should be either distance or rating"})
    }
}

const validateCreate = (req) => {
//   const restaurants = dataJSON
    const createKeys = Object.keys(req.body)
    const mandatoryKeys = ['name', 'position', 'category', 'rating']
  
    if((req.body.position < 0) || (req.body.position > 200)) {
        throw ({message: 'position must be an integer from 0 to 200'})
    }
  
    if((req.body.rating < 1) || (req.body.rating > 5)) {
        throw ({message: 'rating must be an integer from 1 to 5'})
    }
  
    if(!containsAll(mandatoryKeys,createKeys) || (req.body.name == "") || (req.body.position == "") || (req.body.category == "") || (req.body.rating == "")) {
        throw ({message: 'There are missing fields'})
    }
}

const validateGet = (req) => {
    const createKeys = Object.keys(req.body)
    const mandatoryKeys = ['category', 'position', 'orderPriority']
  
    if(!containsAll(mandatoryKeys,createKeys) || (req.body.position == "") || (req.body.category == "") || (req.body.orderPriority == "")) {
        throw ({message: 'There are missing fields'})
    }

    if(!Number.isInteger(req.body.position) || req.body.position > 229) {
        throw ({message: 'position must be an integer from 0 to 200'})
    }
}

const createRestaurant = (req,res) => {
    const duplicatePosition = means.find((mean) => mean.position === req.body.position)

    if (duplicatePosition) {
        throw ({message: 'Position not available'})
    }

    means.push({
            ...req.body
        })
    res.status(201).send(req.body)
}

const getRestaurants = (req,res) => {
    if(req.body.hasOwnProperty('distanceLimit')) {
        if(!Number.isInteger(req.body.distanceLimit)){
            throw ({"message": "Distance limit should be an integer"})
        }
    }
    else{
        req.body.distanceLimit = 30
    }

    var restArray = []
    means.forEach((mean) => {
        if(!(mean.position == req.body.position)) {
            if(mean.category == req.body.category){
                mean.distance = Math.abs(mean.position - req.body.position)
                if(!(mean.distance>req.body.distanceLimit)) {
                    restArray.push({
                        ...mean
                    })
                }
            }
        }
        else {
            throw ({message: "Position not available"})
        }
    })

    restArray.sort(dynamicSort(req.body.orderPriority))
    const newArr = restArray.map(({distance, ...rest}) => {
        return rest
    })
    return res.status(200).send(newArr)
}

const deleteRestaurants = (res) => {
    means = []
    return res.status(204).send()
}

module.exports = {
    validateCreate: validateCreate,
    validateGet: validateGet,
    createRestaurant: createRestaurant,
    getRestaurants: getRestaurants,
    deleteRestaurants: deleteRestaurants
}