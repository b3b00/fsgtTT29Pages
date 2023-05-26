import calendars from './calendars.mjs'

export async function onRequest(context) {
    
    console.log(`loading groups`)

    const teamsByGroup = await calendars.scrapper.getTeamsByGroup(
        ['a', 'b', 'c', 'd', 'e', 'f'],
        true
    )
    let response = new Response(JSON.stringify(teamsByGroup))
    response.headers.set('Content-type', 'application/json')
    return response


        //const task = await context.env.TODO_LIST.get("Task:123");
    return new Response("groups")
  }