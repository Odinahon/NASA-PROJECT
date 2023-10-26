const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;
const launches = new Map();

let latestFlightNumber = 100;

const launch = {
    flightNumber: 100,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Kepler-442 b',
    customers:['ZTM', 'NASA'],
    upcoming: true,
    success: true,
}
saveLaunch(launch);
// launches.set(launch.flightNumber, launch);

async function existsLaunchWithId(launchId) {
    return await launchesDatabase.findOne({
        flightNumber: launchId,
    });
}
// to solve auto increment in MongoDB
// sort in descending order(-) and get the 
async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase.findOne().sort('-flightNumber');

    if(!latestLaunch){
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;
}
//second argument for excluding mongoose key arguments
async function getAllLaunches() {
    return await launchesDatabase.find({},{
        '_id':0,'__v':0,
    });
}
// the parameter that updateOne takes is the parameter that we are looking for,
// if exists save it to launches, otherwise update that object information
async function saveLaunch(launch){
    const planet = await planets.findOne({
        keplerName: launch.target,
    });

    if(!planet) {
        throw new Error('No matching plalnet found');
    }

    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true,
    });
}
async function scheduleNewLaunch(launch){
    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['Zero to Mastery', 'NASA'],
        flightNumber: newFlightNumber,
    });

    await saveLaunch(newLaunch);
}
async function abortLaunchById(launchId){
    //find the launch and update list of
    //properties of it 
   const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId,
    }, {
        upcoming: false,
        success: false,
    })
    return aborted.modifiedCount===1;
}

module.exports = {
    existsLaunchWithId,
    getAllLaunches,
    abortLaunchById,
    scheduleNewLaunch, 
}