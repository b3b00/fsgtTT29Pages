import calendars from './calendars.mjs'

export async function GetGroups() {
    
    console.log(`loading groups`)

    const teamsByGroup = await calendars.scrapper.getTeamsByGroup(
        ['a', 'b', 'c', 'd', 'e', 'f'],
        true
    )

    calendars.scrapper.getTeamsByGroup
    let response = new Response(JSON.stringify(teamsByGroup))
    response.headers.set('Content-type', 'application/json')
    return response

  }

  export async function GetTeams(group) {
    return await calendars.scrapper.getTeamsForGroup(group);
  }

