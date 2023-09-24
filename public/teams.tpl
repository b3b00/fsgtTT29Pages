{{#teams}} 
    <button hx-get="/calendars/{{group}}/{{name}}" hx-target="#teams" hx-indicator=".htmx-indicator">{{name}}</button>
{{/teams}}
