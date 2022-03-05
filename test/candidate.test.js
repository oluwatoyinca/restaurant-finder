const request = require('supertest');

const app = require('../src/app');

async function makeRegularPostRequest(requestBody) {
    return await request(app)
            .post("/restaurant")
            .send(requestBody)
            .set('Accept', 'application/json'); 
}

async function makeRegularGetRequest(requestBody) {
    return await request(app)
            .post('/restaurants')
            .send(requestBody)
            .expect('Content-Type', /json/)
}

async function makeRegularDeleteRequest() {
    return await request(app)
                .delete('/restaurants')
}

describe("Restaurant Finder", () => {
    beforeEach(() => {
        makeRegularDeleteRequest();
    });

    it("should create a restaurant given valid parameters", async () => {
        const requestBody = {
            "name": "123",
            "position": 200,
            "category": "Pizza",
            "rating": 5
        }

        const createResponse = await makeRegularPostRequest(requestBody) ;
        try {
            expect(createResponse.status).toEqual(201);

            expect(createResponse.body).not.toBe(null);
    
            const { name, position, category, rating } = createResponse.body;
    
            expect(name).toEqual(requestBody.name);
            expect(position).toEqual(requestBody.position);
            expect(category).toEqual(requestBody.category);
            expect(rating).toEqual(requestBody.rating);
        } catch (error) {
            throw error;
        }  
    });

    it("should return code 400 when name is missing or empty", async () => {
        const requestBody = {
            "name": "",
            "position": 200,
            "category": "Pizza",
            "rating": 5
        }

        const createResponse = await makeRegularPostRequest(requestBody);

        try {
            expect(createResponse.status).toEqual(400);

            expect(createResponse.body).not.toBe(null);
    
            expect(createResponse.body).toEqual({message: "There are missing fields"})
        } catch (error) {
            throw error;
        }  
    });

    it("should return code 400 when position is missing or empty", async () => {
        const requestBody = {
            "name": "hello",
            "category": "Pizza",
            "rating": 5
        }

        const createResponse = await makeRegularPostRequest(requestBody); 
        try {
            expect(createResponse.status).toEqual(400);

            expect(createResponse.body).not.toBe(null);
    
            expect(createResponse.body).toEqual({message: "There are missing fields"})
        } catch (error) {
            throw error;
        }  
    });

    it("should return code 400 when position is greater than 200", async () => {
        const requestBody = {
            "name": "hello",
            "position": 201,
            "category": "Pizza",
            "rating": 5
        }

        const createResponse = await makeRegularPostRequest(requestBody); 
        try {
            expect(createResponse.status).toEqual(400);

            expect(createResponse.body).not.toBe(null);
    
            expect(createResponse.body).toEqual({message: "position must be an integer from 0 to 200"})
        } catch (error) {
            throw error;
        }  
    });

    it("should return code 400 when position is negative", async () => {
        const requestBody = {
            "name": "hello",
            "position": -2,
            "category": "Pizza",
            "rating": 6
        }

        const createResponse = await makeRegularPostRequest(requestBody); 
        try {
            expect(createResponse.status).toEqual(400);

            expect(createResponse.body).not.toBe(null);
    
            expect(createResponse.body).toEqual({message: "position must be an integer from 0 to 200"})
        } catch (error) {
            throw error;
        }  
    });

    it("should return code 400 when rating is grater than 5", async () => {
        const requestBody = {
            "name": "hello",
            "position": 200,
            "category": "Pizza",
            "rating": 6
        }

        const createResponse = await makeRegularPostRequest(requestBody); 
        try {
            expect(createResponse.status).toEqual(400);

            expect(createResponse.body).not.toBe(null);
    
            expect(createResponse.body).toEqual({message: "rating must be an integer from 0 to 5"})
        } catch (error) {
            throw error;
        }  
    });

    it("should return code 400 when rating is lower than 1", async () => {
        const requestBody = {
            "name": "hello",
            "position": 199,
            "category": "Pizza",
            "rating": -1
        }

        const createResponse = await makeRegularPostRequest(requestBody); 
        try {
            expect(createResponse.status).toEqual(400);

            expect(createResponse.body).not.toBe(null);
    
            expect(createResponse.body).toEqual({message: "rating must be an integer from 0 to 5"})
        } catch (error) {
            throw error;
        }  
    });

    it("should return code 400 when trying to send two restaurants with same position", async () => {
        const requestBody = {
            "name": "hello",
            "position": 198,
            "category": "Pizza",
            "rating": 2
        }
        await makeRegularPostRequest(requestBody);
        const createResponse = await makeRegularPostRequest(requestBody); 
        try {
            expect(createResponse.status).toEqual(400);

            expect(createResponse.body).not.toBe(null);
    
            expect(createResponse.body).toEqual({message: "Position not available"})
        } catch (error) {
            throw error;
        }  
    });

    it("should get Restaurants in the right order, given orderPriority is rating", async () => {
        const requestBody = {
            "name": "123",
            "position": 112,
            "category": "Pizza",
            "rating": 1
        }

        const anotherRequestBody = {
            "name": "1234",
            "position": 113,
            "category": "Pizza",
            "rating": 5
        }

        const getRestaurantsBody = {
            "category": "Pizza",
            "orderPriority": "rating",
            "distanceLimit": 50,
            "position": 94
        }

        await makeRegularPostRequest(requestBody);
        await makeRegularPostRequest(anotherRequestBody);

        const restaurants = await makeRegularGetRequest(getRestaurantsBody);

        try {
            expect(restaurants.body).not.toBe(null);
            expect(restaurants.body[0]).toEqual(anotherRequestBody);
            expect(restaurants.body[1].name).toEqual("123")
        } catch (error) {
            throw error;
        }  
    });

    it("should get Restaurants in the right order, given orderPriority is distance", async () => {
        const requestBody = {
            "name": "123",
            "position": 135,
            "category": "Pizza",
            "rating": 1
        }

        const anotherRequestBody = {
            "name": "1234",
            "position": 120,
            "category": "Pizza",
            "rating": 5
        }

        const getRestaurantsBody = {
            "category": "Pizza",
            "orderPriority": "distance",
            "distanceLimit": 50,
            "position": 94
        }

        await makeRegularPostRequest(requestBody);
        await makeRegularPostRequest(anotherRequestBody);

        const restaurants = await makeRegularGetRequest(getRestaurantsBody);

        try {
            expect(restaurants.status).toEqual(200);
            expect(restaurants.body).not.toBe(null);
            expect(restaurants.body[0]).toEqual(anotherRequestBody);
            expect(restaurants.body[1].name).toEqual("123")
        } catch (error) {
            throw error;
        }  
    });

    it("should get Restaurants without restaurants outside default distance limit 30 ", async () => {
        const requestBody = {
            "name": "123",
            "position": 135,
            "category": "Pizza",
            "rating": 1
        }

        const anotherRequestBody = {
            "name": "1234",
            "position": 120,
            "category": "Pizza",
            "rating": 5
        }

        const getRestaurantsBody = {
            "category": "Pizza",
            "orderPriority": "distance",
            "position": 94
        }

        await makeRegularPostRequest(requestBody);
        await makeRegularPostRequest(anotherRequestBody);

        const restaurants = await makeRegularGetRequest(getRestaurantsBody);

        try {
            expect(restaurants.status).toEqual(200);
            expect(restaurants.body).not.toBe(null);
            expect(restaurants.body.length).toEqual(1);
            expect(restaurants.body[0]).toEqual(anotherRequestBody)
        } catch (error) {
            throw error;
        }  
    });

    it("should get Restaurants without restaurants with a non selected category", async () => {
        const requestBody = {
            "name": "123",
            "position": 135,
            "category": "Pizza",
            "rating": 1
        }

        const anotherRequestBody = {
            "name": "1234",
            "position": 120,
            "category": "Burguer",
            "rating": 5
        }

        const thirdRequestBody = {
            "name": "12345",
            "position": 121,
            "category": "Burguer",
            "rating": 5
        }

        const getRestaurantsBody = {
            "category": "Burguer",
            "orderPriority": "distance",
            "distanceLimit": 80,
            "position": 94
        }

        await makeRegularPostRequest(requestBody);
        await makeRegularPostRequest(anotherRequestBody);
        await makeRegularPostRequest(thirdRequestBody);

        const restaurants = await makeRegularGetRequest(getRestaurantsBody);

        try {
            expect(restaurants.status).toEqual(200);
            expect(restaurants.body).not.toBe(null);
            expect(restaurants.body.length).toEqual(2);
            expect(restaurants.body[0]).toEqual(anotherRequestBody)
            expect(restaurants.body[1]).toEqual(thirdRequestBody)
        } catch (error) {
            throw error;
        }  
    });

    it("should return 400 when calling get restaurants without all mandatory attributes", async () => {
        const getRestaurantsBody = {
            "orderPriority": "distance",
            "distanceLimit": 80,
            "position": 94
        }

        const restaurants = await makeRegularGetRequest(getRestaurantsBody);

        try {
            expect(restaurants.status).toEqual(400);
            expect(restaurants.body).toEqual({message: "There are missing fields"})
        } catch (error) {
            throw error;
        }  
    });

    it("should return 400 when calling get restaurants without a wrong orderPriority", async () => {
        const getRestaurantsBody = {
            "category": "Burguer",
            "orderPriority": "color",
            "distanceLimit": 80,
            "position": 94
        }

        const restaurants = await makeRegularGetRequest(getRestaurantsBody);

        try {
            expect(restaurants.status).toEqual(400);
            expect(restaurants.body).toEqual({message: "Order priority should be either distance or rating"})
        } catch (error) {
            throw error;
        }  
    });

    it("should return 400 when calling get restaurants without non intenger distance limit", async () => {
        const getRestaurantsBody = {
            "category": "Burguer",
            "orderPriority": "distance",
            "distanceLimit": "distance",
            "position": 94
        }

        const restaurants = await makeRegularGetRequest(getRestaurantsBody);

        try {
            expect(restaurants.status).toEqual(400);
            expect(restaurants.body).toEqual({message: "Distance limit should be an integer"})
        } catch (error) {
            throw error;
        }  
    });

    it("should return 400 when calling get restaurants without integer outside range", async () => {
        const getRestaurantsBody = {
            "category": "Burguer",
            "orderPriority": "distance",
            "distanceLimit": 120,
            "position": 230
        }

        const restaurants = await makeRegularGetRequest(getRestaurantsBody);

        try {
            expect(restaurants.status).toEqual(400);
            expect(restaurants.body).toEqual({message: "position must be an integer from 0 to 200"})
        } catch (error) {
            throw error;
        }  
    });

    it("should return 400 when calling get restaurants without a position that belongs to an restaurant", async () => {
        const requestBody = {
            "name": "123",
            "position": 135,
            "category": "Pizza",
            "rating": 1
        }

        const getRestaurantsBody = {
            "category": "Burguer",
            "orderPriority": "distance",
            "distanceLimit": 20,
            "position": 135
        }

        await makeRegularPostRequest(requestBody)
        const restaurants = await makeRegularGetRequest(getRestaurantsBody);

        try {
            expect(restaurants.status).toEqual(400);
            expect(restaurants.body).toEqual({message: "Position not available"})
        } catch (error) {
            throw error;
        }  
    });
});
