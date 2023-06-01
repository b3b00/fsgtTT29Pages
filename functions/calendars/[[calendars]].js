import calendars from '../calendars.mjs'


function notFound() {
    let response = new Response('', {
        status: 404,
        statusText: "Not Found",
        headers: {},
      });
    return response;
}


export async function onRequest(context) {
    
    console.log(context.params.calendars);
    console.log(context.params.calendars.length);    

    var group = ''
    var team = ''    
    var force = ''
    var type = '1'

    if (context.params.calendars.length == 4) {
        force = context.params.calendars[0];        
        group = context.params.calendars[1];
        team = context.params.calendars[2];
        type = context.params.calendars[3];
    }
    else if (context.params.calendars.length == 3) {
        group = context.params.calendars[0];
        team = context.params.calendars[1];
        type = context.params.calendars[2];
    }
    else {
        
        //notfound.status = 404;
        return notFound();
    }

    console.log(`Getcal for [${group}].[${team}] ${type} force = >${force}<`)

    if (!force || force != 'force') {
        const { results } = await context.env.D1_CALENDARS.prepare(
            'SELECT * FROM calendars WHERE groupe=? AND team = ? AND type=?'
        )
            .bind(group, team, type)
            .all()
        console.log('SQL RESULTS', results)
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
        await context.env.D1_CALENDARS.prepare(
            'DELETE FROM calendars WHERE groupe = ? and team = ? and type = ?'
        )
            .bind(group, team, type)
            .run()

        const { duration } = (
            await context.env.D1_CALENDARS.prepare(
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
