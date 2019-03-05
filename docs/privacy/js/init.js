(function($){
  $(function(){

    $('.sidenav').sidenav();
    $('.modal').modal();
    $('.parallax').parallax();
    $('input.autocomplete').autocomplete({
      data: completeSchools,
    });

  });
})(jQuery);