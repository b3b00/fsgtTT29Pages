import { Router, withParams } from 'itty-router'
import calendars from './calendars.mjs'
import {GetCalendar} from './calendars-routes.js'
import {GetGroups} from './groups-routes.js'

const router = Router()


async function calendar(request,env,context,group,team,force)  {
    
    
        // console.log('********* six ***********');
        // console.log(six);
        // console.log('********* /six ***********');
        

    var type = 1;
    if (request.query) {
        if (request.query.type) {
            type = request.query.type;
        }
    }
    console.log(`========> getting calendar(${group},${team},${force},${type})`);
    return await GetCalendar(env,group,team,force,type);
} 



router.get('/calendars/:group/:team', withParams, async (request,env, context, group, team) => calendar(request,env,context,request.params.group,request.params.team,false));

router.get('/calendars/force/:group/:team', async (group, team, request, env, context) => calendar(request,env,context,request.params.group,request.params.team,true));

router.get('/groups', async () => {
    return await GetGroups();
});

router.all('*', (request, env) => {
    return env.ASSETS.fetch(request);
}); 

export default {
    async fetch(request, environment, context) {
        return router.handle(request, environment, context)
    },
    async scheduled(controller, environment, context) {
        // await doATask();
    },
}