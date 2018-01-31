var post = $('.js-post-tmp').html(),
	postTemplate = Handlebars.compile(post);

$(function(){
	$.get('/api/post/list').then(function(resp){
		$('.main-container').html('');
		
		$('.main-container').append(postTemplate(resp));
	});
})