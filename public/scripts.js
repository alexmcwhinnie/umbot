$(document).ready(function(){

  $('.checkout').click(function(event){
    $.post( "http://73.94.56.102/checkout", function() {
      alert( "Data Loaded" );
    });
  })

});