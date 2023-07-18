import cheerio from '../node_modules/cheerio'

//import cheerio from 'cheerio'
import dayjs from '../node_modules/dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
//import fs from 'fs'

const groupe_url_schema = 'http://t2t.29.fsgt.org/groupe/groupe'


/**
 * iCalendarGeneration object is responsible for generating iCalendar events related to sports matches from the provided data.
 * This object contains methods to format match labels, match dates and to write iCalendar events. It also helps to find team
 * information, local team week day and to generate an iCalendar file for a specified team.
 *
 * Object Methods:
 * - getMatchLabel(match, team): Generates a match label based on the team and match.
 * - getTeam(teams, teamName): Finds the team information from the teams array based on the team name.
 * - getLocalTeamWeekDay(day): Returns a local team weekday based on the provided day.
 * - getMatchDate(match, teams): Generates a match date based on the match and teams array.
 * - writeMatchEvent(calFile, match, teams, team): Writes a match event to the specified iCalendar file.
 * - getICS(matches, group, teams, team): Generates an iCalendar file content for the specified team.
 * - getMatchEvent(match, teams, team): Generates an iCalendar event text based on the match, teams array and team.
 * - writeCalendar(matches, group, teams, team): Writes an iCalendar file for the specified team.
 */
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

    /*
     * write a match event to ics file
     */
    // writeMatchEvent: function(calFile, match, teams, team) {
    //     fs.appendFileSync(calFile, '\r\nBEGIN:VEVENT\r\n')
    //     fs.appendFileSync(calFile, '\r\nX-WR-TIMEZONE:Europe/Paris\r\n')
    //     fs.appendFileSync(
    //         calFile,
    //         'UID:' + crypto.randomUUID().toUpperCase() + '\r\n'
    //     )
    //     let date = this.getMatchDate(match, teams)
    //     fs.appendFileSync(
    //         calFile,
    //         'DTSTART;TZID=/Europe/Paris:' + date + '200000\r\n'
    //     )
    //     fs.appendFileSync(
    //         calFile,
    //         'DTEND;TZID=/Europe/Paris:' + date + '220000\r\n'
    //     )
    //     let lbl = this.getMatchLabel(match, team)
    //     fs.appendFileSync(calFile, 'SUMMARY:' + lbl + '\r\n')
    //     fs.appendFileSync(calFile, 'DESCRIPTION:' + lbl + '\r\n')
    //     fs.appendFileSync(calFile, 'END:VEVENT\r\n')
    // },

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

    /*
     * write ics file for a team
     */
    // writeCalendar: function(matches, group, teams, team) {
    //     let calFile =
    //         'calendars/' +
    //         group +
    //         '/' +
    //         team.Name.replace(' ', '').toLocaleLowerCase() +
    //         '.ics'

    //     let dir = './calendars'

    //     if (!fs.existsSync(dir)) {
    //         fs.mkdirSync(dir)
    //     }

    //     dir = './calendars/' + group

    //     if (!fs.existsSync(dir)) {
    //         fs.mkdirSync(dir)
    //     }

    //     fs.writeFileSync(calFile, getICS(matches, group, teams, team))
    // },
}

/**
 * The scrapper object contains methods to extract specific data from cheerio node objects.
 *
 * Available Methods:
 * - extractInnerTagsValueToObject(tagName, mapping, node, acceptMissingItems): Extracts values of child nodes
 *   with name equal to tagName, maps the extracted values based on a given mapping object, and collects
 *   those values within a resulting object. If acceptMissingItems is set to false, the extraction ends upon
 *   encountering an undefined value and returns null.
 * - etxractdataFromNodeArray(html, selector): Extracts data from a cheerio node array based on the provided
 *   HTML content and selector string, and returns an array containing those extracted data items.
 */
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

    /**
     * etxractdataFromNodeArray: Extracts data from a cheerio node array based on the HTML and selector provided.
     *
     * @param {string} html - The HTML content to be parsed.
     * @param {string} selector - The selector to be used for extracting data.
     * @returns {Array} - An array containing the extracted data from the nodes.
     */

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

/**
 * fsgtScrapper object provides methods to scrape team and match data from the FSGT website.
 *
 * Object Methods:
 * - getTeamDay(team): Fetches the playing day for a given team from the FSGT website.
 * - shortName(team): Returns a short name version of the team by removing spaces and converting to lower case.
 * - getTeams(html, light): Extracts an array of teams from the HTML content. If light is true, it avoids fetching team playing day.
 * - getTeamsByGroup(groups, light): Asynchronously fetches teams from FSGT website and groups them by the provided group names.
 * - extractMatchFromRow(row): Extracts match data from an HTML table row of the match.
 * - getMatches(html): Extracts an array of matches from the HTML content of the FSGT website.
 */
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
            let res = await fetch(url)

            if (res.status == 200) {
                let html = await res.text()
                let teams = await fsgtScrapper.getTeams(html, light)
                teamsGrouped[groups[i]] = teams
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
