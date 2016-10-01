$(document).ready(function(){

//   $('.checkout').click(function(event){
//     $.post( "http://73.94.56.102/checkout2/1", function() {
// 		console.log("hi");	
//     });
//   })


// var socket = io();

// 	$('.checkout').click(function() {
// 	    console.log('Button clicked');
// 	});
	var socket = io.connect("http://73.94.56.102");

	  $('.checkout').click(function() {
		console.log('button pressed')
	    socket.emit('chat message', { my: 'data, yo' });

	  });



  // $('form').submit(function(){
  //   socket.emit('chat message', $('#m').val());
  //   $('#m').val('');
  //   return false;
  // });

// io.on('connection', function(socket){
//   socket.on('chat message', function(msg){
//     console.log('message: ' + msg);
//   });
// });




});