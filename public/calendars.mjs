import cheerio from '../node_modules/cheerio'

import dayjs from '../node_modules/dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'


const groupe_url_schema = 'http://t2t.29.fsgt.org/groupe/groupe'

const iCalendarGeneration = {
    /*
     * format match name
     */
    getMatchLabel: function(match, team, type) {
        if (type == captainType) {
            if (match.local == team.Name) {
                return (
                    'FSGT : ' +
                    (match.day.replace('\t', '') +
                        ' ' +
                        match.remote.replace('\t', '') +
                        ' (dom.)')
                )
            } else {
                return (
                    'FSGT : ' +
                    (match.day.replace('\t', '') +
                        ' ' +
                        match.local.replace('\t', '') +
                        ' (ext.)')
                )
            }
        } else if (type == teamType) {
            if (match.local == team.Name) {
                return (
                    'FSGT : '+ 
                        match.remote.replace('\t', '') +
                        ' (dom.)');                
            } else {
                return (
                    'FSGT : ' +
                        match.local.replace('\t', '') +
                        ' (ext.)');                
            }
        }
    },

    getTeam: function(teams, teamName) {
        for (let i = 0; i < teams.length; i++) {
            if (
                teams[i].Name == teamName ||
                fsgtScrapper.shortName(teams[i]) == teamName
            ) {
                return teams[i]
            }
        }
        return null
    },

    getLocalTeamWeekDay: function(day) {
        let mapping = {
            lundi: 0,
            mardi: 1,
            mercredi: 2,
            jeudi: 3,
            vendredi: 4,
            samedi: 5,
            dimanche: 6,
        }
        return mapping[day] + 1
    },

    /*
     * format match date
     */
    getMatchDate: function(match, teams) {
        let localTeam = this.getTeam(teams, match.local)
        dayjs.extend(customParseFormat)
        let d = dayjs(match.date, 'DD/MM/YYYY')
        let dayInWeek = d.dayInWeek
        let localTeamDay = this.getLocalTeamWeekDay(localTeam.Day)
        d = d.day(localTeamDay)

        let dateStr = d.format('YYYYMMDDT')

        return dateStr
    },

    getICS: function(matches, group, teams, team, type) {
        let content = ''
        content += 'BEGIN:VCALENDAR\r\n'
        content += 'X-WR-CALNAME:FSGT\r\n'
        content += 'VERSION:2.0\r\n'
        for (let l = 0; l < matches.length; l++) {
            let m = matches[l]
            if (m.local == team.Name || m.remote == team.Name) {
                content += this.getMatchEvent(m, teams, team, type)
            }
        }
        content += 'END:VCALENDAR\r\n'
        return content
    },

    getMatchEvent: function(match, teams, team, type) {
        let content = '\r\nBEGIN:VEVENT\r\n'
        // content += "\r\nX-WR-TIMEZONE:Europe/Paris\r\n";
        let date = this.getMatchDate(match, teams)
        content += 'DTSTART;TZID=/Europe/Paris:' + date + '200000\r\n'
        content += 'UID:' + crypto.randomUUID().toUpperCase() + '\r\n'
        content += 'DTEND;TZID=/Europe/Paris:' + date + '220000\r\n'
        let lbl = this.getMatchLabel(match, team, type)
        content += 'SUMMARY:' + lbl + '\r\n'
        content += 'DESCRIPTION:' + lbl + '\r\n'
        content += 'END:VEVENT\r\n'
        return content
    },

    
}

const scrapper = {
    /*
     * from a node (node) extract all child node with name == tagName
     * apply mapping to create an object :
     * mmaping is an associative map int -> attribute name.
     * for each mapping i -> attributeName: select the ith child node and extract
     * value to attibuteName attribute in the resulting object.
     * Usefull to selectively extract data from a row to an object.
     */
    extractInnerTagsValueToObject: function(
        tagName,
        mapping,
        node,
        acceptMissingItems
    ) {
        let object = {}

        let chs = node.childNodes
        let k = 0
        for (let j = 0; j < chs.length; j++) {
            let child = chs[j]
            if (child.type == 'tag' && child.name == tagName) {
                if (mapping['' + k] !== undefined) {
                    if (
                        child.childNodes[0] != undefined &&
                        child.childNodes[0] != null
                    ) {
                        object[mapping['' + k]] = child.childNodes[0].data
                    } else {
                        j++
                        if (!acceptMissingItems) {
                            // object = null;
                            return null
                        }
                    }
                }
                k++
            }
        }
        return object
    },

    etxractdataFromNodeArray: function(html, selector) {
        let values = Array()
        let content = cheerio.load(html)
        let nodes = content(selector)
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i]
            let name = node.childNodes[0].data
            values.push(name)
        }
        return values
    },
}

const fsgtScrapper = {
    getTeamDay: async function(team) {
        let url =
            'http://t2t.29.fsgt.org/equipe/' +
            team.replace(/ /g, '-').toLowerCase()
        let res = await fetch(url)
        let day = ''

        if (res.status == 200) {
            let html = await res.text()

            let i = html.indexOf('Reçoit le ')
            if (i > 0) {
                html = html.substring(i)
                i = html.indexOf('<')
                html = html.substring(0, i)
                html = html.trim().replace('.', '')
                let words = html.split(' ')

                day = words[words.length - 1]
            }
        }
        return day
    },

    shortName(team) {
        return team != null
            ? team.Name.replace(' ', '').toLocaleLowerCase()
            : ''
    },

    /*
     * get the teams
     */

    getTeams: async function(html, light) {
        let teamNames = scrapper.etxractdataFromNodeArray(
            html,
            'div#classement table tr td.nom'
        )
        let teams = []
        for (let i = 0; i < teamNames.length; i++) {
            let team = {}
            team.Name = teamNames[i]
            if (!light) {
                // do not request team playing day to avoir too many subrequests.
                const d = await fsgtScrapper.getTeamDay(team.Name)
                team.Day = d
            }
            teams.push(team)
        }

        return teams
    },

    getTeamsByGroup: async function(groups, light) {
        let teamsGrouped = {}
        for (let i = 0; i < groups.length; i++) {
            let url = groupe_url_schema + '-' + groups[i]

            if (groups[i] == 'a') {
                url = groupe_url_schema
            }
            try {
            let res = await fetch(url)

            if (res.status == 200) {
                let html = await res.text()
                let teams = await fsgtScrapper.getTeams(html, light)
                teamsGrouped[groups[i]] = teams
            }
            else {
            }
        }
        catch(exception) {
            console.log(`     group ${groups[i]} fetch exception ${exception} `);            
        }

        }
        return teamsGrouped
    },

    extractMatchFromRow: function(row) {
        let mapping = {
            '0': 'day',
            '1': 'date',
            '5': 'local',
            '8': 'remote',
        }

        let match = scrapper.extractInnerTagsValueToObject(
            'td',
            mapping,
            row,
            false
        )

        return match
    },

    /*
     * get the matches
     */
    getMatches: function(html) {
        let content = cheerio.load(html)
        let matches = content('div#matchs table.matchs tr.match')
        let matchArray = Array()

        for (let i = 0; i < matches.length; i++) {
            let day = matches[i]
            let match = {}

            match = this.extractMatchFromRow(day)

            if (match != null) {
                matchArray.push(match)
            }
        }
        return matchArray
    },
}

/*
 * main call
 */

const teamType = 1
const captainType = 0

let groups = ['a', 'b', 'c', 'd', 'e', 'f', 'g']

export default {
    scrapper: fsgtScrapper,
    GetCalendar: async function(group, team, type) {
        let url = groupe_url_schema + '-' + group

        if (group == 'a') {
            url = groupe_url_schema
        }
        let res = await fetch(url)
        if (res.status == 200) {
            let html = await res.text()

            let teams = await fsgtScrapper.getTeams(html, false)
            let matchArray = fsgtScrapper.getMatches(html)

            if (team != null) {
                let te = iCalendarGeneration.getTeam(teams, team)
                if (te != null) {
                    return iCalendarGeneration.getICS(
                        matchArray,
                        group,
                        teams,
                        te,
                        type
                    )
                }
            }
            return null
        }
    },
    downloadGroup: async function(group, team) {
        let url = groupe_url_schema + '-' + group

        if (group == 'a') {
            url = groupe_url_schema
        }

        let res = await fetch(url)

        if (res.status == 200) {
            let html = await res.text()

            let teams = fsgtScrapper.getTeams(html)

            let matchArray = fsgtScrapper.getMatches(html)

            if (team != null) {
                let te = iCalendarGeneration.getTeam(teams, team)
                if (te != null) {
                    iCalendarGeneration.writeCalendar(
                        matchArray,
                        group,
                        teams,
                        te
                    )
                }
            } else {
                for (let t = 0; t < teams.length; t++) {
                    iCalendarGeneration.writeCalendar(
                        matchArray,
                        group,
                        teams,
                        teams[t]
                    )
                }
            }
        }
    },
}