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


export async function GetCalendar(env, groupe, team, force, type) {

try{
    if (!force) {
        const prepared  = env.D1_CALENDARS.prepare(
            'SELECT * FROM calendars WHERE groupe=? AND team = ? AND type=?'
        )
            .bind(groupe, team, type);

        const { results } = await prepared.all();
        // console.log('.all() ran.... go go go');
        // console.log(`results for groupe:${group}, team:${team}, type:${type}`,results);
        if (results && results.length > 0) {
            let response = new Response(results[0].calendar)
            response.headers.set('Content-Type', 'text/calendar')
            return response
        }
    }

    let ics = await calendars.GetCalendar(groupe, team, type)

    if (ics && ics.length > 0) {
        await env.D1_CALENDARS.prepare(
            'DELETE FROM calendars WHERE groupe = ? and team = ? and type = ?'
        )
            .bind(groupe, team, type)
            .run()
        const { duration } = (
            await env.D1_CALENDARS.prepare(
                'INSERT INTO calendars (groupe,team, type, calendar) VALUES (?1, ?2, ?3, ?4)'
            )
                .bind(groupe, team, type, ics)
                .run()
        ).meta
    }

    let response = new Response(ics)
    response.headers.set('Content-Type', 'text/calendar')
    return response
}

catch(e){
console.log(e);
console.log(e.message);
console.log(e.stack)
let response = new Response(e.message+"\n"+e.stack)
    response.headers.set('Content-Type', 'text/plain')
    return response
}
}

