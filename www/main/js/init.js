(function($){
  $(function(){

    $('.sidenav').sidenav();
    $('input.autocomplete').autocomplete({
      data: {
        "Kaj Munk": null,
        "Christian Lyceum": null
      },
    });

  }); // end of document ready
})(jQuery); // end of jQuery name space

var schools = {};
$("#autocomplete-input").on("input", function() {
    if(this.value.length > 2){
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://mijn.magister.net/api/schools?filter=" + this.value,
        "method": "GET",
        "headers": {}
      }
      
      $.ajax(settings).done(function (response) {
        console.log(response);
        // var resvar = response
        // for(var i = 0; i < resvar.length; i++){
        //     // var school = '"'+resvar[i].name+'"'
        //     var school = resvar[i].name
        //     schools[school] = null
        // }
        // $('.autocomplete').autocomplete('updateData', schools);
        // $('.autocomplete').autocomplete('open');
      });
    }
});