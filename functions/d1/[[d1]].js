function post(uri, key, body) {}

async function get(uri, key) {
    console.log(`get(${uri},${key})`)
    // var headers = new Headers()
    // headers.append('Authorization', )

    var options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${key}`
        },
        mode: 'cors',
        cache: 'default',
    }

    console.log(`options ${options}`, options)

    console.log('sending....')
    var r = await fetch(uri, options)
    if (r.status == 200) {
        console.log('OK')
        var json = await r.json()
        console.log(json)
        return json
    } else {
        var content = await r.json()
        console.log('error ' + r.status + ' ' + r.statusText, content)
        return null
    }
}

async function GetProjectId(context, projectName) {
    var projectInfo = await get(
        `https://api.cloudflare.com/client/v4/accounts/${context.env.ACCOUNT_ID}/pages/projects/${projectName}`,
        context.env.API_KEY
    )
    console.log('getProjectId get :',projectInfo);

    if (projectInfo) {
        return projectInfo.result.id;
    }
    return null
}

function CreateD1(name) {}

function BindD1(d1Id, appId) {}

export async function onRequest(context) {
    var params = context.params.d1
    var appName = params[0]
    var d1Name = null
    if (params.length >= 1) {
        d1Name = params[1]
    }
    console.log("*************************************")
    var projectId = await GetProjectId(context, appName);
    console.log("******** => projectId :: "+projectId+" ****************");
    console.log("*************************************")
    let accountId = context.env.API_KEY;
    var r = {
        "accountId" : accountId,
        "d1Name" : d1Name,
        "appName" : appName,
        "projectId" : projectId 
    }
    console.log("*************************************")
    console.log("*************************************")
    console.log(r);
    console.log("*************************************")
    console.log("*************************************")

    let response = new Response(JSON.stringify(r));
    response.headers.set('Content-Type', 'text/pplain');
    return response;
}
