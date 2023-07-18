async function request(uri,key,method, body) 
{
    console.log(`${method}(${uri},${key})`)
    console.log(body);
    
    var options = {
        "method": method,
        "headers": {
            'Authorization': `Bearer ${key}`
        },
        "mode": 'cors',
        "cache": 'default'
    }
    if (body) {
        options.body = JSON.stringify(body);
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


async function post(uri, key, body) {
    return await request(uri,key,"POST",body);
}

async function get(uri, key) {
    return await request(uri,key,"GET",undefined);   
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

async function CreateD1(context, dbName) {
       var payLoad = {
           "name":dbName
       }
       console.log(`CreateD1(${dbName})`);
       console.log(payLoad);
        var d1 = await post(`https://api.cloudflare.com/client/v4/accounts/${context.env.ACCOUNT_ID}/d1/database`,context.env.API_KEY,payLoad);
        console.log('d1 created');
        console.log(d1);
        console.log("---------------------------------");
    return d1;
}

function BindD1(d1Id, appId) {}

export async function onRequest(context) {
    var params = context.params.d1
    var appName = params[0]
    var d1Name = null
    if (params.length >= 1) {
        d1Name = params[1];
        console.log(`D1 name :[[${d1Name}]]`);
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

    var d1 = {}
    if (d1Name) {
        console.log(`CREATE D1 database >${d1Name}<`);
        d1 = await CreateD1(context, d1Name); 
    }
    else {
        console.log(`DO NOT CREATE D1 database >${d1Name}<`);
    }

    var res = {
        "meta" : r,
        "d1" : d1
    }

    let response = new Response(JSON.stringify(res));
    response.headers.set('Content-Type', 'text/pplain');
    return response;
}
