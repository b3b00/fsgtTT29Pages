import calendars from './calendars.mjs'


function notFound() {
    let response = new Response('', {
        status: 404,
        statusText: "Not Found",
        headers: {},
      });
    return response;
}

function getQueryParameter(url, name, defaultValue) {
const { searchParams } = new URL(url)
  let value = searchParams.get(name)
  return value ?? defaultValue;
}


export async function GetCalendar(env, group, team, force, type) {

try{
    console.log(`Getcal for [${group}].[${team}] ${type} force = >${force}<`)
    if (!force) {        
        const { results } = await env.D1_CALENDARS.prepare(
            'SELECT * FROM calendars WHERE groupe=? AND team = ? AND type=?'
        )
            .bind(group, team, type)
            .all()
        if (results && results.length > 0) {
            console.log('returning saved calendar : ')
            let response = new Response(results[0].calendar)
            response.headers.set('Content-Type', 'text/calendar')
            return response
        } else {
            console.log('no calendar in table')
        }
    }

    console.log('computing calendar from FSGT site')
    let ics = await calendars.GetCalendar(group, team, type)

    if (ics && ics.length > 0) {
        await env.D1_CALENDARS.prepare(
            'DELETE FROM calendars WHERE groupe = ? and team = ? and type = ?'
        )
            .bind(group, team, type)
            .run()

        const { duration } = (
            await env.D1_CALENDARS.prepare(
                'INSERT INTO calendars (groupe,team, type, calendar) VALUES (?1, ?2, ?3, ?4)'
            )
                .bind(group, team, type, ics)
                .run()
        ).meta

        console.log('insert duration : ', duration)
    }

    let response = new Response(ics)
    response.headers.set('Content-Type', 'text/calendar')
    return response
}

catch(e){
let response = new Response(JSON.stringify(e))
    response.headers.set('Content-Type', 'text/plain')
    return response
}
}

