const fs = require('fs');
const path = require('path');
const {parse} = require('csv-parse');

const planets = require('./planets.mongo');

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
        && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
        && planet['koi_prad'] < 1.6;
}

async function getAllPlanets(){
    return await planets.find({}, '-_id -__v');
}
function loadPlanetsData(){
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..','..','data','kepler_data.csv'))
            .pipe(parse({
                comment: '#',
                columns: true,
            }))
            .on('data', async (data) => {
                if(isHabitablePlanet(data)) {
                    savePlanet(data);
                }
            })
            .on('error', (err) => {
                console.log(err);
            })
            .on('end', async () => {
                const planetCount = (await getAllPlanets()).length;
                console.log(`${planetCount} habitable planets found!`);
                resolve();
            });
    });
}

async function savePlanet(planet){
    try {
        await planets.updateOne({
            keplerName: planet.kepler_name,
        }, {
            keplerName: planet.kepler_name,
        }, {
            upsert: true,
        });
    }catch (err) {
        console.error("Couldn't save planet", err);
    }
}
module.exports = {
    loadPlanetsData,
    getAllPlanets,
};