loadGroups = async function () {
    let res = await fetch("/groups");
    if (res.status == 200) {
        const groups = await res.json();
        sessionStorage.setItem('groups', JSON.stringify(groups));
        // TODO : fill group select
        let groupNames = Object.keys(groups);
        for (var i = 0; i < groupNames.length; i++) {
            const group = groupNames[i];
            $("#groups").append(`<option value="${group}">${group}</option>`);
        }
    }
}


changeGroup = function (group) {
    teamsByGroup = sessionStorage.getItem('groups');
    teamsByGroup = JSON.parse(teamsByGroup);
    groupSelect = $('#groups');
    group = groupSelect.val();
    teamList = teamsByGroup[group];

    $('#teams').children('option').remove();

    for (var i = 0; i < teamList.length; i++) {
        team = teamList[i];
        $("#teams").append(`<option value="${team.Name}" >${team.Name}</option>`);
    }
}

function findSelection(name) {
    return document.querySelector(`[name="${name}"]:checked`).value
}


function download() {
    teams = document.getElementById("teams");
    groups = document.getElementById('groups');
    forceInput = document.getElementById('force');   
    type=findSelection("caltype");
    type=`type=${type}`;   
 

    group = groups.value;
    team = teams.value;
    force = forceInput.checked ? 'force=1' : 'force=0'
    shortTeam = team != null ? team.replace(" ", "").toLocaleLowerCase() : "";
    if (shortTeam == "" || group == "") {
        window.alert("vous devez d'abord choisir un group et une équipe !");
        return;
    }
    downloader = document.getElementById("downloader");
    downloader.src = `/calendars/${group}/${shortTeam}?${type}&${force}`;
    downloader.download= `${shortTeam}.ics`;
    console.log(`download ${group} - ${shortTeam}`)
}