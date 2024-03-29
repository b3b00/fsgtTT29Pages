<!DOCTYPE html>
<html>

<head>

<meta name="viewport" content="width=device-width,initial-scale=1" />
    <script src="https://code.jquery.com/jquery-3.4.1.slim.min.js"
        integrity="sha256-pasqAKBDmFT4eHoN2ndd6lN370kFiGUFyTiUHWhU7k8=" crossorigin="anonymous"></script>
    <title>FSGT 29 TT calendars</title>
    <meta charset="UTF-8">    
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/tbolt/boltcss/bolt.css">
    <script src="/js/script.js"></script>    
    <script src="https://unpkg.com/htmx.org@2.0.0-beta1/dist/htmx.min.js"></script>
    <!--<script src="https://unpkg.com/htmx.org@1.9.3" integrity="sha384-lVb3Rd/Ca0AxaoZg5sACe8FJKF0tnUgR2Kd7ehUOG5GCcROv5uBIZsOqovBAcWua" crossorigin="anonymous"></script>-->
</head>


<body>


    <iframe id="downloader" style="display:none" ></iframe>

    <h1 >Calendrier FSGT TT 29</h1>
    <label for="groups">Groupes : </label>
    {{#groups}} 
    <button hx-get="/teams?group={{name}}" hx-target="#teams" hx-indicator=".htmx-indicator">{{name}}</button>
    {{/groups}}    
    <br><br>
    <label for="teams">Équipes :</label>
    <div  id="teams">        
    </div>    
   {{!--  
   <br><br>
   <fieldset data-role="controlgroup" data-type="horizontal">
        <legend>type de calendrier :</legend>
    <input type="radio" id="team" name="caltype" value="1"
             checked style="display:inline-block">
      <label for="huey" style="display:inline-block">Équipe</label>
      <input type="radio" id="captain" name="caltype" value="0"
             checked style="display:inline-block">
      <label for="huey" style="display:inline-block">Capitaine</label>
      </fieldset>
    <input type="checkbox" id="force">Regénérer le calendrier</input><br><br>
    <button  onclick="download();">Télécharger le calendrier</button>
    }}

</body>

</html>
