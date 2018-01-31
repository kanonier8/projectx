var post = $('.js-post-tmp').html(),
	postTemplate = Handlebars.compile(post);

$(function(){
	var id = window.location.pathname.split('/post/')[1];
	$.get('/api/post/item?id='+id).then(function(resp){
		$('.main-container').html('');
		
		$('.main-container').append(postTemplate(resp));
	});
})