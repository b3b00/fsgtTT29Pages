import { Router, withParams } from 'itty-router'
import {GetCalendar} from './calendars-routes.js'
import {GetGroups} from './groups-routes.js'
import Mustache from 'mustache';

const router = Router()


async function calendar(request,env,context,group,team)  {
    var type = 1;
    var force = false;
    if (request.query) {
        if (request.query.type) {
            type = request.query.type;
        }
        console.log('force from query '+request.query.force);
        if (request.query.force) {
            force = true;
        }
    }
    return await GetCalendar(env,group,team,force,type);
} 



router.get('/calendars/:group/:team', withParams, async (request,env, context, group, team) => calendar(request,env,context,decodeURI(request.params.group),decodeURI(request.params.team)));

//router.get('/calendars/:group/:team', async (group, team, request, env, context) => calendar(request,env,context,request.params.group,request.params.team,true));

router.get('/groups', async () => {
    return await GetGroups();
});

router.get('/test/:who',async (request , env) => {
    const url = request.url;
    const who = request.params.who;
    console.log(url);
    console.log(request);
    const modifiedRequest = new Request('http://localhost:8788/test.tpl', request)
    console.log(modifiedRequest)
    var response = await env.ASSETS.fetch(modifiedRequest);
    console.log(response);
    var text = await response.text();
    console.log(text);

    var view = {
        "who": who,
        "links": [
            {"label":"google","url":"http://www.google.com"},
            {"label":"HN","url":"http://news.ycombinator.com/"},
            {"label":"CloudFlare","url":"www.cloudflare.com/"},
        ]
      };
      
      var output = Mustache.render(text, view);


    //text = text.replace('#WHO#', who);
    var response = new Response(output);
    response.headers.set('Content-Type', 'text/html')
    return response;
})

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