(function($){
  $(function(){

    $('.sidenav').sidenav();
    $('.modal').modal();
    $('input.autocomplete').autocomplete({
      data: schools,
    });

  });
})(jQuery);

function autocompleteDropdown() {
  var instance = M.Autocomplete.getInstance($('input.autocomplete'));
  instance.open();
}

function signInCallback(authResult) {
  if (authResult['code']) {
    M.toast({html: 'Bezig met authorizeren...'})
    var school = document.getElementById('autocomplete-input').value;
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var notify = document.getElementById('notify').value;
    var cancelled = $("#cancelled").is(":checked") ? true : false;
    var assistant = $("#assistant").is(":checked") ? true : false;
    var mail = $("#mail").is(":checked") ? true : false;
    
    if(school && username && password) {
      if(school in schools) {
        $('#signinButton').attr('style', 'display: none');
        var data = null;
    
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        
        xhr.addEventListener("readystatechange", function () {
          if (this.readyState === 4) {
            console.log(this.responseText);
            if(this.responseText == 'succes') {
              M.toast({html: 'Succesvol geactiveerd!'})
            } else {
              if(this.responseText == 'user updated' || this.responseText == 'user already exists') {
                setError('Succes', getError(this.responseText), 'https://beta.magbot.nl/')
              }
              setError('Oopsie', getError(this.responseText), 'https://beta.magbot.nl/signup/')
            }
          }
        });
        
        xhr.open("POST", "https://bot.beta.magbot.nl");
        xhr.setRequestHeader("code", authResult.code);
        xhr.setRequestHeader("school", school);
        xhr.setRequestHeader("username", username);
        xhr.setRequestHeader("password", password);
        xhr.setRequestHeader("notify", notify);
        xhr.setRequestHeader("cancelled", cancelled);
        xhr.setRequestHeader("assistant", assistant);
        xhr.setRequestHeader("mail", mail);
        M.toast({html: 'Even geduld a.u.b.'})
        xhr.send(data);
      } else {
        setError('Oopsie', 'Geen geldige school. Kies een school uit de lijst', 'https://beta.magbot.nl/signup/')
      }
    } else {
      setError('Oopsie', 'Vul alle velden in (Schoolnaam, Magistergebruikersnaam en Magisterwachtwoord) en probeer het opnieuw', 'https://beta.magbot.nl/signup/')
    }
  } else {
    // There was an error.
  }
}

function getError(error) {
  if(error == 'AuthError: Invalid username') { return 'Ongeldige Magister gebruikersnaam, probeer het nog eens.' }
  if(error == 'AuthError: Invalid password') { return 'Ongeldig Magister wachtwoord, probeer het nog eens.' }
  if(error == 'Error: school and username&password or token are required.') { return 'Het lijkt erop dat de school die je hebt ingevuld niet klopt, probeer het nog eens.' }
  if(error == 'user already exists') { return 'Het lijkt erop dat dit Magbot al geactiveerd is voor dit Magister account. Je hoeft dus niks meer te doen. <br> Wil je je calendar delen met vrienden of famillie? Dat kan, open de calendar in je Google Calendar app, en druk op delen.' }
  if(error == 'user updated') { return 'Je gegevens en voorkeuren zijn succesvol geupdate. Het kan even duren voordat alles is doorgevoerd en correct in je agenda komt.' }
  if(error == 'error: geen geldig Google calendarId') { return 'Magbot kan geen nieuwe calendar aanmaken voor dit Google Account. Probeer het nog eens.' }
  return 'Er is een onbekende fout opgetreden, probeer het nog eens.'
}

function setError(title, message, href) {
  var errorModal = document.getElementById('error-modal-open');
  var errorModalTitle = document.getElementById('error-modal-title');
  var errorModalText = document.getElementById('error-modal-text');
  var errorModalButton = document.getElementById('error-modal-button');

  errorModalTitle.innerText = title
  errorModalText.innerHTML =  message
  errorModalButton.href = href

  errorModal.click()
}

var schools = {
  "De Faam": null,
  "CVO 't Gooi College de OpMaat": null,
  "De Maat": null,
  "Maarten van Rossem": null,
  "Maaslandcollege": null,
  "SG Maarsbergen": null,
  "Sint-Maartenscollege": null,
  "Sint-Maartenscollege Maastricht": null,
  "Sint-Maartenscollege Voorburg": null,
  "SMC Maastricht": null,
  "Stedelijk Dalton College Alkmaar": null,
  "Vakcollege Maarsbergen": null,
  "VMBO Maastricht": null,
  "VMBO Maastricht": null,
  "OSG Hengelo Bataafs Lyceum": null,
  "VierTaal College Schagen": null,
  "Tabor College": null,
  "Eemsdeltacollege": null,
  "Maria Immaculata Lyceum": null,
  "Maria Immaculata Lyceum (MIL)": null,
  "Chr. Mavo \"De Saad\"": null,
  "Citadel College": null,
  "Interconf. Hofstadcollege Heldring VMBO": null,
  "Interconf. Hofstadcollege Hofstad Lyceum": null,
  "Interconf. Hofstadcollege Hofstad Mavo": null,
  "LVO Parkstad": null,
  "OVO Zaanstad": null,
  "SG Lelystad": null,
  "SG Lelystad": null,
  "Stad en Esch": null,
  "Stadslyceum": null,
  "Stichting voor VO Lelystad": null,
  "Stichting voor Voortgezet Onderwijs Lelystad": null,
  "Talentstad": null,
  "Amadeus Lyceum": null,
  "Dongemond college Made": null,
  "Fons Vitae Lyceum": null,
  "Maerlant College Brielle": null,
  "Maerlant Lyceum Den Haag": null,
  "Van Maerlantlyceum": null,
  "Van Maerlantlyceum Eindhoven": null,
  "Arentheem College locatie Leerpark Presikhaaf": null,
  "Daaf Gelukschool": null,
  "Graaf Engelbrecht": null,
  "Graaf Huyn College": null,
  "Graafschap College": null,
  "Dalton Den Haag": null,
  "De Haagse": null,
  "De Vrije School Den Haag": null,
  "Deutsche internationale Schule Den Haag": null,
  "Haags Montessori Lyceum": null,
  "Het Haagsch Vakcollege": null,
  "Scholengroep Den Haag Zuid-West": null,
  "Tobiasschool Den Haag": null,
  "debrug.magister.net": null,
  "Gomarus College Groningen Magnolia": null,
  "Magister Demo licentie": null,
  "pro-roermond.magister.net": null,
  "RSG Magister Alvinus": null,
  "Maimonides SG": null,
  "Esloo Onderwijsgroep Montaigne Lyceum": null,
  "De Zwaaikom": null,
  "Topsport Talentschool": null,
  "Wolfert van Borselen scholengroep Wolfert Tweetalig": null,
  "Chr. Lyceum Veenendaal": null,
  "CSV Veenendaal": null,
  "Elzendaalcollege Boxmeer": null,
  "Elzendaalcollege Gennep": null,
  "J.C. Pleysierschool Transvaal College": null,
  "OMO SG De Langstraat Dr. Mollercollege Waalwijk": null,
  "RSG Het Rhedens Rozendaal": null,
  "Metameer": null,
  "Dongemond college Raamsdonksveer": null,
  "Het Westeraam": null,
  "ZAAM": null,
  "Bonnefanten College": null,
  "Johannes Fontanus College": null,
  "Sint-Stanislascollege": null,
  "Stanislascollege": null,
  "ARH - Adriaan Roland Holstschool": null,
  "Baanderherencollege": null,
  "Christiaan Huygens College": null,
  "De Baander": null,
  "De Viaan": null,
  "Erasmiaans Gymnasium": null,
  "Esprit Scholen Mondriaan": null,
  "Lodewijk College - locatie Zeldenrustlaan": null,
  "Meridiaan College": null,
  "Meridiaan College `t Hooghe Landt": null,
  "Meridiaan College Amersfoort": null,
  "Meridiaan College Het Nieuwe Eemland": null,
  "Meridiaan College Mavo Muurhuizen": null,
  "Meridiaan College Vakcollege Amersfoort": null,
  "ROC Mondriaan MBO": null,
  "Scholen aan Zee": null,
  "School voor Praktijkonderwijs De Baanbreker": null,
  "Zaanlands Lyceum": null,
  "Bogerman Balk": null,
  "Bogerman Koudum": null,
  "Bogerman Koudum": null,
  "Bogerman Sneek": null,
  "Bogerman Sneek": null,
  "Bogerman Wommels": null,
  "Bogerman Wommels": null,
  "Commanderij College": null,
  "CSG Anna Maria van Schurman": null,
  "CVO 't Gooi Savornin Lohman": null,
  "De Goudse SG Leo Vroman": null,
  "de GSG Leo Vroman": null,
  "Esloo Onderwijsgroep Diamant College": null,
  "GSG Leo Vroman": null,
  "Hermann Wesselink College": null,
  "Newmancollege": null,
  "Pontes Pieter Zeeman": null,
  "Purmerendse SG Nelson Mandela": null,
  "Werkman VMBO": null,
  "Niftarlake College": null,
  "RSG Pantarijn": null,
  "Staring College": null,
  "Esprit Scholen Marcanti College": null,
  "Gomarus College Assen": null,
  "Gomarus College Drachten": null,
  "Gomarus College Groningen Praktijkonderwijs": null,
  "Gomarus College Groningen Vondelpad 1": null,
  "Gomarus College Groningen Vondelpad 2": null,
  "Gomarus College Groningen Vondelpad 3": null,
  "Gomarus College Leeuwarden": null,
  "Gomarus College Zuidhorn": null,
  "Lyceum Sancta Maria": null,
  "Marecollege Leiden": null,
  "Maris College": null,
  "Maritieme Academie Harlingen": null,
  "Marne College": null,
  "Marnix College": null,
  "Martinuscollege": null,
  "Sancta Maria MAVO": null,
  "Stella Maris College": null,
  "Technisch en Maritiem College Velsen": null,
  "CSG De Lage Waard": null,
  "De Goudse Waarden": null,
  "De Heemgaard": null,
  "De Zeven Linden Dedemsvaart": null,
  "Haarlem College": null,
  "Haarlemmermeer Lyceum": null,
  "Hoofdvaart College": null,
  "Huygens College Heerhugowaard": null,
  "Krimpenerwaard College": null,
  "Laar en Berg": null,
  "Lodewijk College - locatie Oude Vaart": null,
  "Onderwijsgroep Zuid-Hollandse Waarden Barendrecht": null,
  "Openbaar Onderwijs Groningen": null,
  "RSC - Rudolf Steiner College Haarlem": null,
  "Scheepvaart en Transport College": null,
  "St.-Jozefmavo Vlaardingen": null,
  "St.-Jozefschool voor MAVO Vlaardingen": null,
  "Stedelijk Gymnasium Haarlem": null,
  "Farel en Oostwende College": null,
  "CSG Gaasterland": null,
  "Sint-Nicolaaslyceum": null,
  "Arentheem College locatie Thomas a Kempis": null,
  "SchoolMaster BVE Demolicentie": null,
  "SchoolMaster Training": null,
  "Bonifatius mavo": null,
  "St. Bonifatiuscollege": null,
  "Gymnasium Juvenaat": null,
  "OMO Scholengroep De Langstraat": null,
  "OMO SG De Langstraat d'Oultremontcollege": null,
  "OMO SG De Langstraat Walewyc": null,
  "SG De Overlaat": null,
  "Almata": null,
  "CSG Prins Maurits": null,
  "Emmauscollege": null,
  "Maurick College": null,
  "2College Jozefmavo": null,
  "Alberdingk Thijm Mavo": null,
  "Bredero Mavo": null,
  "Charles de Foucauld Mavo": null,
  "CSG Groene Hart Topmavo": null,
  "De Amsterdamse Mavo": null,
  "De Mavo voor Theater MT010": null,
  "De Toorop Mavo": null,
  "deamsterdamsemavo": null,
  "Duin en Kruidberg mavo": null,
  "Frits Philips Lyceum Mavo": null,
  "Hildegardis Mavo": null,
  "Lucius Petrus Mavo": null,
  "lvo-Mavo": null,
  "Mavo Roermond": null,
  "Mavo Schravenlant XL": null,
  "Mgr. A.E. Rientjes Mavo": null,
  "Paulus Mavo/Vmbo": null,
  "Roncalli Mavo": null,
  "St.-Jozefmavo": null,
  "MaxX": null,
  "Raayland College": null,
  "ROC West-Brabant": null,
  "ROC West-Brabant (ROCWB)": null,
  "Calvijn College Krabbendijke": null,
  "Scholen Combinatie Zoetermeer": null,
  "Scholencombinatie Delfland": null,
  "Symbion": null,
  "Chr. VMBO-Harderwijk": null,
  "Griendencollege-VMBO": null,
  "Haemstede Barger VMBO-T": null,
  "HMC MBO Vakschool": null,
  "MBO Terra": null,
  "SiNTLUCAS VMBO": null,
  "Trias VMBO": null,
  "VMBO De Krijtenburg": null,
  "VMBO Het Venster": null,
  "VMBO Ichthus Almere": null,
  "Kwadrant Scholengroep Cambreur College": null,
  "Rembrandt College": null,
  "Strabrecht College": null,
  "VAVO Noord- en Midden- Limburg": null,
  "Montessori College Arnhem (MCA)": null,
  "DaCapo College": null,
  "Accent Amersfoort": null,
  "Accent Nijkerk": null,
  "UMCG Wenckebach Instituut": null,
  "Arentheem College locatie Middachten": null,
  "Wim Gertenbach College": null,
  "Eckartcollege": null,
  "Merletcollege": null,
  "Reynaertcollege": null,
  "Wellantcollege": null,
  "Zeldenrust-Steelantcollege": null,
  "Blariacumcollege": null,
  "Bonaventuracollege": null,
  "Dockingacollege": null,
  "dr. Aletta Jacobs College": null,
  "Jacob-Roelandslyceum": null,
  "Jacobus Fruytier SG": null,
  "Mediacollege Amsterdam": null,
  "Ulenhofcollege": null,
  "Actief College - Hoeksch Lyceum": null,
  "Vechtdal College": null,
  "Kath. SG Hoofddorp": null,
  "Adelbert College": null,
  "Atlas College SG De Triade": null,
  "Purmerendse SG W.J. Bladergroen": null,
  "RSG Simon Vestdijk": null,
  "Het Kwadrant": null,
  "Het Kwadrant Bergen op Zoom": null,
  "Kwadrant Scholengroep": null,
  "Kwadrant Scholengroep Dongen": null,
  "Kwadrant Scholengroep Hanze College": null,
  "LVO Weert Het Kwadrant": null,
  "Radulphus College": null,
  "SWPTeam": null,
  "Meander College": null,
  "CSG Dingstede": null,
  "Damstede": null,
  "Drechtsteden College": null,
  "Het Stedelijk Lyceum Enschede": null,
  "Het Stedelijk Lyceum Scholingsboulevard Enschede": null,
  "Hofstede Praktijkschool": null,
  "Landstede Groep VO Zwolle eo": null,
  "Landstede Groep Volwasseneneducatie Gelderland": null,
  "Stedelijk College Zoetermeer": null,
  "Stedelijk Dalton Lyceum": null,
  "Stedelijk Gymnasium Arnhem": null,
  "Stedelijk Gymnasium Breda": null,
  "Stedelijk Gymnasium Den Bosch": null,
  "Stedelijk Gymnasium Johan van Oldenbarnevelt": null,
  "Stedelijk Gymnasium Leiden": null,
  "Stedelijk Gymnasium Schiedam": null,
  "Stedelijke SG De Rede": null,
  "Stedelijke SG Nijmegen": null,
  "Drenthe College Steenwijk": null,
  "Het Ravelijn Steenbergen": null,
  "Praedinius Gymnasium": null,
  "Bindelmeer College": null,
  "Burgemeester Walda SG": null,
  "Christelijke Scholengemeenschap Vincent van Gogh": null,
  "College de Meer": null,
  "Gemeentelijk Gymnasium": null,
  "Gemeentelijk Gymnasium Hilversum": null,
  "Het Atrium Zoetermeer": null,
  "Nijmeegse Sg Groenewoud": null,
  "Open Schoolgemeenschap Bijlmer": null,
  "Picasso Lyceum Zoetermeer": null,
  "RSG Tromp Meesters": null,
  "Scholengemeenschap Were Di": null,
  "Karel de Grote College Nijmegen": null,
  "Pro College regio Nijmegen": null,
  "ROC Nijmegen": null,
  "Tobiasschool Nijmegen": null,
  "Cals College IJsselstein": null,
  "Esloo Onderwijsgroep I.C.Edith Stein": null,
  "Praktijkschool De Steiger": null,
  "Rudolf Steiner College Rotterdam": null,
  "Van Lodenstein College": null,
  "Van Lodensteincollege": null,
  "Amstellyceum": null,
  "Christelijk College Groevenbeek": null,
  "Christelijk College Nassau-Veluwe": null,
  "Christelijk Gymnasium": null,
  "Christelijk Gymnasium Utrecht": null,
  "Christelijk Lyceum Apeldoorn": null,
  "Christelijk Lyceum Delft": null,
  "christelijk lyceum Zandvliet": null,
  "Eerste Christelijk Lyceum": null,
  "Francois Vatelschool": null,
  "Instelling VO Deurne": null,
  "Instelling VO Deurne Alfrinkcollege": null,
  "Instelling VO Deurne Hub van Doornecollege": null,
  "Instelling VO Deurne Peellandcollege": null,
  "SiNTLUCAS Boxtel": null,
  "Stellingwerf College": null,
  "Vrijzinnig-Christelijk Lyceum": null,
  "Gymnasium Felisenum": null,
  "Chr. College de Noordgouw Hattem": null,
  "CSG Het Noordik Almelo": null,
  "Emelwerda College": null,
  "Murmellius Gymnasium": null,
  "2College Durendael": null,
  "St. Michael College": null,
  "Agnieten College": null,
  "Almere College Dronten": null,
  "Aloysius De Roosten": null,
  "CSG Buitenveldert": null,
  "CSG Ulbe van Houten": null,
  "Drenthe College Winschoten": null,
  "Gwendoline van Puttenschool": null,
  "Hartenlustschool": null,
  "Hartenlustschool": null,
  "Het Perron Dronten": null,
  "Houtens": null,
  "KSE Etten-Leur": null,
  "Reconvalescentenschool": null,
  "Tender College": null,
  "Tender Wellant": null,
  "Almende College Bluemers": null,
  "Almende College Isala": null,
  "Almende College Wesenthorst": null,
  "BC Broekhin Swalmen": null,
  "Comenius Lyceum Amsterdam": null,
  "CSG Comenius": null,
  "CVO 't Gooi Comenius College": null,
  "Development": null,
  "Drenthe College Emmen": null,
  "Esdal College Emmen": null,
  "Het Segment": null,
  "Mencia de Mendoza": null,
  "Mendelcollege": null,
  "Menno Reitsma": null,
  "Palmentuin": null,
  "ROC Menso Alting": null,
  "Thamen": null,
  "Thamen RKSG": null,
  "Compaen College": null,
  "Saenredam College": null,
  "Saenstroom OPDC": null,
  "Drenthe College Meppel": null,
  "Greijdanus Meppel": null,
  "College Den Hulster": null,
  "De Amsterdamsche School": null,
  "De Bolster": null,
  "De Jutter": null,
  "De Theaterhavo/vwo": null,
  "Esdal College Oosterhesselen": null,
  "GGCA - Geert Groote College Amsterdam": null,
  "Grafisch Lyceum Rotterdam": null,
  "Het Amsterdams Lyceum": null,
  "Het Lyceum Rotterdam": null,
  "Het Schoter": null,
  "Het Wateringse Veld College": null,
  "Horeca Vakschool Rotterdam": null,
  "Hout- en Meubileringscollege HMC Amsterdam": null,
  "Hout- en Meubileringscollege HMC Rotterdam": null,
  "Interconf. Scholengroep Westland": null,
  "International School Almere": null,
  "International School Hilversum": null,
  "J.C. Pleysierschool Westerbeek College": null,
  "Montessori Lyceum Amsterdam": null,
  "Montessori Lyceum Rotterdam": null,
  "OCL Het Waterland": null,
  "Oost-ter-Hout School voor Praktische Vorming": null,
  "Oosterlicht College": null,
  "Over Betuwe College De Heister": null,
  "Pieter Nieuwland College": null,
  "Pieter Zandt sg.": null,
  "ROC van Amsterdam": null,
  "RSG Ter Apel": null,
  "Schoter SG": null,
  "Sint-Laurenscollege Rotterdam": null,
  "Sterren College": null,
  "Terra Nigra": null,
  "VO Terra": null,
  "Voortgezet Onderwijs van Amsterdam": null,
  "Waterlant College IJdoorn": null,
  "Young Business School Rotterdam": null,
  "Esprit Scholen Cartesius Lyceum": null,
  "Jordan - Montessori Lyceum Utrecht": null,
  "Metis Montessori Lyceum": null,
  "Montessori College Aerdenhout": null,
  "Montessori College Oost": null,
  "Montessori Lyceum Groningen": null,
  "Montessori Lyceum Utrecht": null,
  "Montessori Vaklyceum": null,
  "OSG Hengelo Montessori College": null,
  "Pontes Scholengroep": null,
  "Tessenderlandt": null,
  "Bonhoeffer College": null,
  "CVO 't Gooi Hilfertsheem-Beatrix": null,
  "Wolfert van Borselen scholengroep": null,
  "Wolfert van Borselen scholengroep Wolfert College": null,
  "Wolfert van Borselen scholengroep Wolfert Dalton": null,
  "Wolfert van Borselen scholengroep Wolfert ISK": null,
  "Wolfert van Borselen scholengroep Wolfert Lyceum": null,
  "Wolfert van Borselen scholengroep Wolfert PRO": null,
  "Wolfert van Borselen scholengroep Wolfert RISS": null,
  "Almere College": null,
  "Almere College Kampen": null,
  "Kamerlingh Onnes": null,
  "Kennemer College": null,
  "Kennemer Lyceum Overveen": null,
  "OPDC Noord-Kennemerland": null,
  "OSG De Amersfoortse Berg": null,
  "Purmerendse SG": null,
  "Purmerendse SG Anton Gaudi": null,
  "Purmerendse SG Da Vinci College": null,
  "Purmerendse SG Gerrit Rietveld": null,
  "Purmerendse SG Jan van Egmond Lyceum": null,
  "t Atrium Amersfoort": null,
  "Chr. College Schaersvoorde": null,
  "Corlaer College": null,
  "Het Reinaert": null,
  "SG De Waerdenborch": null,
  "Calvijn met Junior College": null,
  "Metzo College": null,
  "Nimeto": null,
  "Carolus Borromeus College": null,
  "OSG Willem Blaeu": null,
  "CSG Reggesteyn": null,
  "OPDC Griffioen": null,
  "Montfort College": null,
  "Praktijkschool Westfriesland": null,
  "Gymnasium Haganum": null,
  "2College Cobbenhagen": null,
  "Atheneum College Hageveld": null,
  "Esprit Scholen Berlage Lyceum": null,
  "Erfgooiers College": null,
  "Mgr. Frencken College": null,
  "Sint-Oelbertgymnasium": null,
  "Arentheem College locatie Baken Warnsborn": null,
  "Arentheem College locatie Titus Brandsma": null,
  "Drenthe College": null,
  "Drenthe College Assen": null,
  "Drenthe College Coevorden": null,
  "Drenthe College Hardenberg": null,
  "Drenthe College Hoogeveen": null,
  "Drenthe College Roden": null,
  "Drenthe College Ruinen": null,
  "Drenthe College Zwolle": null,
  "Pallas Athene College": null,
  "Theresialyceum": null,
  "Alberdingk Thijm College": null,
  "Jac. P. Thijsse College": null,
  "Heyerdahl College": null,
  "Calvijn College Tholen": null,
  "Praktijkschool Uithoorn": null,
  "Rythovius College": null,
  "Thorbecke SG": null,
  "Thorbecke SG Zwolle": null,
  "Thorbecke VO": null,
  "Vathorst College": null,
  "Het Hogeland College Uithuizen": null,
  "Ichthus College": null,
  "Ichthus Lyceum": null,
  "J.C. Pleysierschool Het Palmhuis": null,
  "Prakticum": null,
  "Stichting CVO Apeldoorn": null,
  "Stichting Kolom": null,
  "Stichting Kolom De Atlant": null,
  "Stichting Kolom De Dreef": null,
  "Stichting Kolom Het Plein": null,
  "Stichting Kolom Noord": null,
  "Stichtse Vrije School": null,
  "Esprit Scholen AICS": null,
  "Calvijn College Middelburg": null,
  "Edudelta Onderwijsgroep Middelharnis": null,
  "Middelharnis": null,
  "VSO De Piramide": null,
  "Atlas Onderwijsgroep Locatie Rijswijk": null,
  "J.C. Pleysierschool Zefier": null,
  "Scholengroep Gelders Mozaiek": null,
  "Bernard Nieuwentijt College": null,
  "Chr. Praktijkschool De Boog": null,
  "De Pijler School voor Praktijkonderwijs": null,
  "Esloo Onderwijsgroep Esloo Praktijkonderwijs": null,
  "Het Praktijkcollege Centrum": null,
  "Het Praktijkcollege Charlois": null,
  "Het Praktijkcollege Zuidwijk": null,
  "Instituut Blankestijn": null,
  "Laurentius Praktijkschool": null,
  "LUCA Praktijkschool": null,
  "Praktijk College": null,
  "Praktijk College Spijkenisse": null,
  "Praktijkonderwijs Roermond": null,
  "Praktijkonderwijs Zutphen": null,
  "Praktijkschool Apeldoorn": null,
  "Praktijkschool De Brug": null,
  "Praktijkschool De Einder": null,
  "Praktijkschool de Linie": null,
  "Praktijkschool De Poort": null,
  "Praktijkschool Eindhoven": null,
  "Praktijkschool Focus": null,
  "Praktijkschool Helmond": null,
  "Praktijkschool Het Bolwerk": null,
  "Pronova Praktijkonderwijs": null,
  "Mijnschool": null,
  "De Rooi Pannen Tilburg": null,
  "Onderwijsgroep Tilburg": null,
  "Mill Hillcollege": null,
  "Jan Tinbergen College": null,
  "Dominicus College": null,
  "Gemini College Lekkerkerk": null,
  "Gemini College Ridderkerk": null,
  "Minkema College": null,
  "Fioretti College": null,
  "Lorentz Casimir Lyceum": null,
  "SG Bonaire": null,
  "Joke Smit VAVO": null,
  "SG Ubbo Emmius": null,
  "Baudartius College": null,
  "Grotius College": null,
  "Grotius College Delft": null,
  "Grotius College Heerlen": null,
  "St. Ignatiusgymnasium": null,
  "Vakcollege Eindhoven": null,
  "Vakcollege Helmond": null,
  "Vakcollege Noordoostpolder": null,
  "RSG Goeree-Overflakkee": null,
  "Bossche Vakschool": null,
  "College de Heemlanden": null,
  "Atlas College": null,
  "Atlas College Copernicus SG": null,
  "Atlas College OSG West-Friesland": null,
  "Atlas College SG De Dijk": null,
  "Atlas College SG Newton": null,
  "Atlas Onderwijsgroep": null,
  "Atlas Onderwijsgroep Lyceum Ypenburg": null,
  "SG de Rietlanden": null,
  "SG de Rietlanden": null,
  "Walburg College Zwijndrecht": null,
  "ISG Ibn Ghaldoun": null,
  "SG Groenewald": null,
  "Flex College": null,
  "Alfrink College": null,
  "Lyceum Kralingen": null,
  "Novalis College": null,
  "Alkwin Kollege": null,
  "CS Vincent van Gogh Salland": null,
  "Roncalli SG Bergen op Zoom": null,
  "Aloysius College": null,
  "St. Aloysius College Hilversum": null,
  "Cals College": null,
  "Cals College Nieuwegein": null,
  "Kalsbeek College": null,
  "Dalton Lyceum Barendrecht": null,
  "Dalton Voorburg": null,
  "SG Dalton": null,
  "SG Dalton Voorburg": null,
  "Valuascollege": null,
  "SiNTLUCAS": null,
  "SiNTLUCAS Eindhoven": null,
  "Calvijn College Goes": null,
  "Kromme Rijn College": null,
  "Havo Notre Dame des Anges": null,
  "De Campus": null,
  "ICT Campus Hilversum": null,
  "Chr. Gymnasium Beyers Naud?": null,
  "Chr. Gymnasium Beyers Naude": null,
  "Chr. Gymnasium Sorghvliet": null,
  "Cygnus Gymnasium": null,
  "Esprit Scholen Het 4e Gymnasium": null,
  "Gymnasium Beekvliet": null,
  "Gymnasium Bernrode": null,
  "Gymnasium Celeanum": null,
  "Gymnasium Novum": null,
  "Vossius Gymnasium": null,
  "Willem Lodewijk Gymnasium": null,
  "Porta Mosana College": null,
  "2College Wandelbos": null,
  "Bertrand Russel College": null,
  "Broeckland College": null,
  "Heerenlanden College": null,
  "Het Hogeland College": null,
  "Het Hogeland College Wehe-den Hoorn": null,
  "Iedersland College": null,
  "Kandinsky College": null,
  "OSG Singelland": null,
  "VeenLanden College": null,
  "Kranenburgschool": null,
  "Evang. School voor VO \"De Passie\"": null,
  "Evang. School voor VO \"De Passie\" de Passie Utrecht": null,
  "Canisius College": null,
  "Petrus Canisius College": null,
  "CSG Willem van Oranje": null,
  "Oranje Nassau College": null,
  "Anna van Rijn College": null,
  "De Rooi Pannen": null,
  "De Rooi Pannen Breda": null,
  "De Rooi Pannen Eindhoven": null,
  "Colegio Arubano": null,
  "Libanon Lyceum": null,
  "Hans Petrischool": null,
  "Havo/vwo voor Muziek en Dans": null,
  "Sint-Janslyceum": null,
  "Antoon Schellenscollege": null,
  "Groot Goylant": null,
  "Hogelant": null,
  "Lyceum Schravenlant": null,
  "RSG Wiringherlant": null,
  "Greijdanus": null,
  "Greijdanus Enschede": null,
  "Greijdanus Hardenberg": null,
  "Greijdanus Zwolle": null,
  "Sophianum": null,
  "Trevianum Scholengroep": null,
  "Tobiasschool": null,
  "Bauke den Hartog": null,
  "Mollercollege": null,
  "Mollerlyceum": null,
  "VSO Hendrik Mol": null,
  "BC Broekhin Roermond": null,
  "De Zwengel - Helmond": null,
  "Dongemond college": null,
  "Mondial College": null,
  "Niekee Roermond": null,
  "OMO Scholengroep Helmond": null,
  "Simon van Hasselt": null,
  "Fontys Hogescholen": null,
  "OMO SG Tongerlo": null,
  "OMO SG Tongerlo Da Vinci College": null,
  "OMO SG Tongerlo Gertrudiscollege": null,
  "OMO SG Tongerlo Norbertuscollege": null,
  "Morgen College": null,
  "Winford B.V.": null,
  "Koninklijk Conservatorium": null,
  "Scholengroep Gelders Moza?ek": null,
  "Kempenhorst College": null,
  "Capellenborg Wijhe": null,
  "Van der Capellen SG": null,
  "Willem de Zwijger College Papendrecht": null,
  "Vrijeschool Zutphen": null,
  "De Apollo": null,
  "Olympus College": null,
  "ISG Arcus": null,
  "ISG Arcus": null,
  "Parcival College": null,
  "Parcival College Groningen": null,
  "Lennard van Ekris": null,
  "Leonardo College": null,
  "SG Leonardo Da Vinci": null,
  "Willem de Zwijger College Hardinxveld-Giessendam": null,
  "CSG Jan Arentsz": null,
  "Edudelta Onderwijsgroep Barendrecht": null,
  "Harens Lyceum": null,
  "Keizer Karel College": null,
  "Varendonck-College": null,
  "CSG Het Streek": null,
  "De Utrechtse School": null,
  "OPDC Utrecht": null,
  "Gerrit Komrij College": null,
  "CS Vincent van Gogh Lariks": null,
  "'t Atrium": null,
  "Beatrix College": null,
  "Het Atrium": null,
  "Trivium College": null,
  "CSG Groene Hart Leerpark": null,
  "Zuiderpark": null,
  "Carolus Clusius College": null,
  "Carré College": null,
  "CSG Groene Hart": null,
  "CSG Groene Hart Lyceum": null,
  "CSG Groene Hart Rijnwoude": null,
  "Petrus Dondersschool": null,
  "CVO Zuid-West Fryslan": null,
  "Vereniging voor CVO in Noord Fryslan": null,
  "MSA": null,
  "MSA IVKO": null,
  "Pascal College": null,
  "Pascal Zuid": null,
  "CSG Het Noordik Vroomshoop": null,
  "Erasmus College": null,
  "Erasmus VO": null,
  "Het Erasmus": null,
  "Chr. College Nassau-Veluwe": null,
  "De Nassau SG": null,
  "Het Passer College": null,
  "Vox-klassen": null,
  "Esloo Onderwijsgroep College St. Paul": null,
  "Esprit scholen Mundus college": null,
  "Kaj Munk College": null,
  "Munnikenheide College": null,
  "Futura College": null,
  "Hubertus & Berkhoff": null,
  "Sint Vituscollege": null,
  "Over Betuwe College": null,
  "Over Betuwe College Elst": null,
  "Over Betuwe College Huissen": null,
  "Over Betuwe College Junior": null,
  "Esdal College Klazienaveen": null,
  "s Gravendreef College": null,
  "Gerrit Rietveld College": null,
  "Rietveld Lyceum": null,
  "Avicenna College": null,
  "De nieuwe Havo": null,
  "Havo De Hof": null,
  "Mytylschool De Brug": null,
  "Chr. College Groevenbeek": null,
  "Dr.-Knippenbergcollege": null,
  "Groevenbeek": null,
  "Leeuwenborgh Opleidingen": null,
  "Rodenborch-College": null,
  "Nuborgh College": null,
  "Segbroek College": null,
  "Lyceum Ypenburg": null,
  "Vespucci College": null,
  "CS Vincent van Gogh": null,
  "Da Vinci College": null,
  "Sweelinck College": null,
  "Pleincollege Nuenen": null,
  "Pleincollege Sint Joris 20AT": null,
  "Veurs Lyceum Leidschendam": null,
  "Edudelta Onderwijsgroep": null,
  "Edudelta Onderwijsgroep Goes": null,
  "Esloo Onderwijsgroep Corbulo College": null,
  "Linde College": null,
  "Lyceum Schondeln": null,
  "Sondervick College": null,
  "Udens College": null,
  "Ludger College": null,
  "G.K. van Hogendorp": null,
  "Dendron College": null,
  "Hendrik Pierson College": null,
  "Connect College": null,
  "OSG De Hogeberg": null,
  "RSG Lingecollege": null,
  "Beekdal Lyceum": null,
  "Heerbeeck College": null,
  "Lyceum Bisschop Bekkers": null,
  "De Zwengel - Veldhoven": null,
  "De Zwengel - Vught": null,
  "Leon van Gelder": null,
  "OSG Hengelo": null,
  "OSG Hengelo Het Genseler": null,
  "OSG Hengelo Het Gilde College": null,
  "Sprengeloo": null,
  "Helicon Opleidingen": null,
  "Huygens College": null,
  "IVA Driebergen": null,
  "Luzac Opleidingen": null,
  "OMO Scholengroep Bergen op Zoom e.o.": null,
  "Van Kinsbergen college Elburg": null,
  "Berechja College": null,
  "Berger SG": null,
  "Bredero Beroepscollege": null,
  "Herbert Vissers College": null,
  "Rosa Beroepscollege": null,
  "Vak College Hillegersberg": null,
  "CSG Willem de Zwijger": null,
  "CSG Willem de Zwijger Schoonhoven": null,
  "Esdal College Borger": null,
  "Gerrit van der Veen College": null,
  "GSG 't Schylger Jouw": null,
  "RSG Slingerbos": null,
  "Willem de Zwijger College": null,
  "Willem de Zwijger College": null,
  "Willem de Zwijger College Bussum": null,
  "VO Best Oirschot": null,
  "SG Groenewoud": null,
  "CSG Eekeringe": null,
  "ORS Lek en Linge": null,
  "Slinge": null,
  "OSG Hugo de Groot": null,
  "Esprit Scholengroep": null,
  "Johan de Witt Scholengroep": null,
  "Scholengroep Het Plein": null,
  "Prof. Dr. Gunningschool": null,
  "Coornhert Lyceum": null,
  "Het Schoonhovens College": null,
  "2College De Nieuwste School": null,
  "De Nieuwste School": null,
  "SG Het Nieuwe Lyceum": null,
  "De Zuiderpoort": null,
  "GSG Guido De Bres": null,
  "Hervormd Lyceum Zuid": null,
  "Het Zuid-West College": null,
  "Zuiderlicht College": null,
  "Zuiderzee College": null,
  "Zuiderzee College": null,
  "Koning Willem I College": null,
  "Koning Willem II College": null,
  "Esprit scholen DENISE": null,
  "2College Ruiven": null,
  "RSG Enkhuizen": null,
  "OSG Winkler Prins": null,
  "Insula College": null,
  "SG Sint Ursula": null,
  "Chr. College De Populier": null,
  "Globe College": null,
  "Sint Odulphuslyceum": null,
  "Het Goese Lyceum": null,
  "Bouwens van der Boije College": null,
  "Bouwens van der Boijecollege": null,
  "CVO 't Gooi": null,
  "Chr. College de Noordgouw": null,
  "Chr. College de Noordgouw Heerde": null,
  "CSG Het Noordik": null,
  "CSG Het Noordik Vriezenveen": null,
  "Noorderlicht": null,
  "Noorderpoort LBS": null,
  "OSG Schoonoord": null,
  "Veenoord": null,
  "BOOR": null,
  "St-Gregorius College": null,
  "Don Bosco College": null,
  "Jeroen Bosch College": null,
  "ROC Nova College": null,
  "Nuovo": null,
  "Spinoza Lyceum": null,
  "KSG De Breul": null,
  "Cburg College": null,
  "IJburg College": null,
  "Veurs Voorburg": null,
  "BC Broekhin": null,
  "BC Broekhin Reuver": null,
  "RSG Broklede": null,
  "Veurs Lyceum": null,
  "Pleinschool Helder": null,
  "Vinse School": null,
  "NSG": null,
  "Lorentz Lyceum": null,
  "SGVVS": null,
  "Dorenweerd College": null,
  "Onze Lieve Vrouwelyceum": null,
  "RSG NO Veluwe": null,
  "OSG Sevenwolden": null,
  "Zuyderzee Lyceum": null,
  "Luzac": null,
  "De School van HIP": null,
  "Philips van Horne Sg.": null,
  "Oscar": null,
  "Produs": null,
  "OdyZee College": null,
  "RSG Het Rhedens": null,
  "RSG Het Rhedens Dieren": null,
  "Vecht-College": null,
  "helpdesk": null,
  "Vellesan College": null,
  "Wildveld": null,
  "Hervormd Lyceum West": null,
  "Het College Vos": null,
  "LVO Weert Het College": null,
  "Over-Y College": null,
  "Hyperion Lyceum": null,
  "Ir. Lely Lyceum": null,
  "Lyceum Elst": null,
  "Orion Lyceum": null,
  "Visser 't Hooft Lyceum": null,
  "OSG Schiedam": null,
  "Esprit Scholen": null,
  "Esprit Scholen Wissel": null,
  "J.C. Pleysierschool": null,
  "Stg Vrije Scholen voor VO N-H": null,
  "2College": null,
  "Corderius College": null,
  "Ds. Pierson College": null,
  "Elde College": null,
  "Esdal College": null,
  "ID College": null,
  "IJsselcollege": null,
  "MY college": null,
  "Prisma College": null,
  "Reeshof College": null,
  "Sint Joriscollege": null,
  "Sint-Joriscollege": null,
  "SOMA College": null,
  "Zone.college": null,
  "Zwijsen College": null,
  "Zwin College": null,
  "OPDCNK": null,
  "SVOL": null,
  "De Piloot": null,
  "Cor": null,
  "LVO Weert": null,
  "De Delta": null,
  "SWV de Delta": null,
  "Wilco": null,
  "De Rijzert": null,
  "ISW": null,
  "KSE": null
}