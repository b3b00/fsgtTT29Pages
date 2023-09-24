{{#teams}} 
    <button hx-get="/calendars/{{group}}/{{name}}"  hx-indicator=".htmx-indicator">{{name}}</button>
{{/teams}}
