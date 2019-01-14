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