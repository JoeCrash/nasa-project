const axios = require('axios');

const launchesDB = require('./launches.mongo');
const { findOne } = require('./planets.mongo');
const planetsDB = require('./planets.mongo');
const DEFAULT_FLIGHT_NUMBER = 100;

async function findLaunch(filter, options = {}){
    return await launchesDB.findOne(filter, options);
}
async function existsLaunchWithId(launchId){
    return await findLaunch({flightNumber: launchId}, '-_id -__v');
}

async function getLatestFlightNumber(){
    const latestLaunch = await launchesDB.findOne().sort('-flightNumber');
    if(!latestLaunch) { 
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit){
    return await launchesDB.find({}, '-_id -__v')
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch){
    await launchesDB.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    },
    launch,
    {
        upsert:true
    });
}
async function populateLaunches(){
    console.log("downloading SpaceX Launch Data");
    const SPACEX_API_URL = "https://api.spacexdata.com/v5/launches/query";
    const response = await axios.post(SPACEX_API_URL,{
        query: {},
        options: {
            pagination: false, 
            populate : [{
                path: 'rocket',
                select: {'name' : 1} 
            },{
                path: 'payloads',
                select: {'customers' : 1} 
            }]
        }
    });
    if(response.status !== 200){
        console.log("There was a problem downloading the SpaceX API data.");
        throw new Error('SpaceX API server data failed.')
    }
    const launchDocs = response.data.docs;
    for(const launchDoc of launchDocs){
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload)=>{
            return payload['customers'];
        });
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers
        }
        console.log(launch.flightNumber, launch.mission);
        await saveLaunch(launch);
    }
};

async function loadLaunchData(){
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    });
    if(firstLaunch){
        console.log("SpaceX Data previously loaded.")
    }else{
        await populateLaunches();
    }

};

async function scheduleNewLaunch(launch){
    const planet = await planetsDB.findOne({keplerName:launch.target});
    if(!planet) {
        throw new Error('No matching planets found');
    }
    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['Zero To Mastery', 'NASA'],
        flightNumber: newFlightNumber, 
    });
    await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
    const aborted = await launchesDB.updateOne({
        flightNumber: launchId,
    }, {
        upcoming: false,
        success: false,
    });
    return aborted.acknowledged && aborted.modifiedCount === 1;
}

module.exports = {
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById,
    loadLaunchData,
}