const request = require('supertest');
const app = require('../../app');
const { loadPlanetsData } = require('../../models/planets.model');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

describe('Launches API v1', ()=> {
    beforeAll(async ()=>{
        await mongoConnect();
        await loadPlanetsData();
    });

    describe('Test GET /v1/launches', () => {
        test('Should respond with 200 success', async () => {
            const response = await request(app)
                .get('/v1/launches')
                .expect('Content-Type', /json/)
                .expect(200);
        });
    });

    describe('Test POST /v1/launches', () => {
        const completeLaunchData = {
            mission: "USS Enterprise",
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
            launchDate: 'January 8, 2028'
        };
        const launchDataWithoutDate = {
            mission: "USS Enterprise",
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
        };
        const launchDataWithInvalidDate = {
            mission: "USS Enterprise",
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
            launchDate: 'Hot Tamale'
        };
        test('Should respond with 201 created', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchData)
                .expect('Content-Type', /json/)
                .expect(201);
    
            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);
            expect(response.body).toMatchObject(launchDataWithoutDate);
        });
        test('Should catch missing properties', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400);
    
            expect(response.body).toStrictEqual({
                error: 'Missing required launch parameters.'
            })
        });
        test('Should catch invalid dates', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithInvalidDate)
                .expect('Content-Type', /json/)
                .expect(400);
    
            expect(response.body).toStrictEqual({
                error: 'Invalid launch date.',
            });
        });
    });

    afterAll(async ()=>{
        await mongoDisconnect();
    })

});


