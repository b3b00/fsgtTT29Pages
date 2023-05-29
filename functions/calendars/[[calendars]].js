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

    if (context.params.calendars.length == 3) {
        force = context.params.calendars[0];        
        group = context.params.calendars[1];
        team = context.params.calendars[2];
    }
    else if (context.params.calendars.length == 2) {
        group = context.params.calendars[0];
        team = context.params.calendars[1];
    }
    else {
        
        //notfound.status = 404;
        return notFound();
    }

    console.log(`Getcal for [${group}].[${team}] force = >${force}<`)

    if (!force || force != 'force') {
        const { results } = await context.env.D1_CALENDARS.prepare(
            'SELECT * FROM calendars WHERE groupe=? AND team = ? '
        )
            .bind(group, team)
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
    let ics = await calendars.GetCalendar(group, team)

    if (ics && ics.length > 0) {
        await context.env.D1_CALENDARS.prepare(
            'DELETE FROM calendars WHERE groupe = ? and team = ?'
        )
            .bind(group, team)
            .run()

        const { duration } = (
            await context.env.D1_CALENDARS.prepare(
                'INSERT INTO calendars (groupe,team, calendar) VALUES (?1, ?2, ?3)'
            )
                .bind(group, team, ics)
                .run()
        ).meta

        console.log('insert duration : ', duration)
    }

    let response = new Response(ics)
    response.headers.set('Content-Type', 'text/calendar')
    return response
}
