// NOTE : _worker.js must be place at the root of the output dir == ./public for this app

import { Router, withParams } from 'itty-router'
import { GetCalendar } from './calendars-routes.js'
import { GetGroups, GetTeams } from './groups-routes.js'
import Mustache from 'mustache'

const router = Router()

async function GetFromOrCatchOrFetch(request, ttl, fetcher) {
    let cache = caches.default;
    var cached = await cache.match(request);
    if (cached) {
        return cached;
    }
    console.log(`getOrFetch : fetching`);
    var response = await fetcher();
    console.log(`getOrFetch : fetched`,response);

    response.headers.set('Cache-Control', `max-age:${ttl}`);    
    console.log(`getOrFetch : caching`);
    // NOTE : when using cache the reponse MUST be cloned before put to cache
    cache.put(request,response.clone());
    
    return response;
}

async function RenderTemplate(env, request, templatePath, view, mimeType) {
    var url = new URL(request.url)
    var templateUrl = `${url.origin}/${templatePath}`
    var templateRequest = new Request(templateUrl, request)
    var response = await env.ASSETS.fetch(templateRequest)
    var text = await response.text()
    var output = Mustache.render(text, view)
    var response = new Response(output)
    response.headers.set('Content-Type', mimeType)
    return response
}

async function RenderHtml(env, request, templatePath, view) {
    return RenderTemplate(env, request, templatePath, view, 'text/html')
}

async function calendar(request, env, context, group, team) {
    var type = 1
    var force = false
    if (request.query) {
        if (request.query.type) {
            type = request.query.type
        }
        if (request.query.force) {
            force = true
        }
    }
    return await GetCalendar(env, group, team, force, type)
}

router.get(
    '/calendars/:group/:team',
    withParams,
    async (request, env, context, group, team) =>
        calendar(
            request,
            env,
            context,
            decodeURI(request.params.group),
            decodeURI(request.params.team)
        )
)



router.get('/groups', async () => {
    return await GetGroups()
})

router.get('/htmx/index', async(request, env) => {
    const who = request.params.who

    var view = {
        
        groups: [
            {"name":"A"},
            {"name":"B"},
            {"name":"C"},
            {"name":"D"},
            {"name":"E"},
            {"name":"F"}
        ],
    }

    return RenderHtml(env, request, 'index2.tpl', view)
})

router.get('/htmx/teams', async(request, env) => {

    var teamfetcher = async () => {
        var group = request.query.group;
        var teams = await GetTeams(group);
        var response = RenderHtml(env,request,'teams.tpl',{teams});
        return response;
    }
    
    return GetFromOrCatchOrFetch(request,3600,teamfetcher);
})

router.get('/test/:who', async (request, env) => {
    const who = request.params.who

    var view = {
        who: who,
        links: [
            { label: 'google', url: 'http://www.google.com' },
            { label: 'HN', url: 'http://news.ycombinator.com/' },
            { label: 'CloudFlare', url: 'www.cloudflare.com/' },
        ],
    }

    return RenderHtml(env, request, 'test.tpl', view)
})

router.all('*', (request, env) => {
    console.log('assets handler');
    return env.ASSETS.fetch(request)
})

export default {
    async fetch(request, environment, context) {
        return router.handle(request, environment, context)
    },
    async scheduled(controller, environment, context) {
        // await doATask();
    },
}
