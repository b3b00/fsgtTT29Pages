import calendars from '../calendars.mjs'

export async function onRequest(context) {



    var group = ''
    var team = context.params[0]
    var force = ''

    if (context.params.length == 3) {
        force = context.params[0];        
        group = context.params[1];
        team = context.params[2];
    }
    else if (context.params.length == 2) {
        group = context.params[0];
        team = context.params[1];
    }
    else {
        var notfound = new Response();
        notfound.status = 404;
        return notfound;
    }

    console.log(`Getcal for [${group}].[${team}] force = >${force}<`)

    if (!force || force != 'force') {
        const { results } = await env.MYBASE.prepare(
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
        await env.MYBASE.prepare(
            'DELETE FROM calendars WHERE groupe = ? and team = ?'
        )
            .bind(group, team)
            .run()

        const { duration } = (
            await env.MYBASE.prepare(
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
