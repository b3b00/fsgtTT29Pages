import { Router } from 'itty-router'
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
    console.log(`========> getting calenda(${group},${team},${force},${type})`);
    return await GetCalendar(env,group,team,force,type);
} 



router.get('/calendars/:group/:team', async (request,env, context, group, team) => {
    console.log('********* REQUEST ***********');
    console.log(request);
    console.log('********* /REQUEST ***********');
    console.log('********* ENV ***********');
        console.log(env);
        console.log('********* /ENV ***********');
        console.log('********* CONTEXT ***********');
        console.log(context);
        console.log('********* /CONTEXT ***********');
        console.log('********* group ***********');
        console.log(group);
        console.log('********* /group ***********');
        console.log('********* team ***********');
        console.log(team);
        console.log('********* /team ***********');
    return calendar(request,env,false,context,group)
});

//router.get('/calendars/force/:group/:team', async (group, team, request, env, context) => calendar(group,team,true,request,env));

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