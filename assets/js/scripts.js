Handlebars.registerHelper("log", function(something) {
	console.log(something);
});

Handlebars.registerHelper('dateConverse', function(date) {
	date = new Date(date).toString().split(' GM')[0];
	return date;
});

$(function(){

	$(window).scroll(function () {
	    var $this = $(this),
	    	scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();
	    if ($this.scrollTop() > 60) {
	       $('.f-nav-menu').addClass('_top');
	       $('.f-to-top').addClass('_show');
	    } else {
	       $('.f-nav-menu').removeClass('_top');
	       $('.f-to-top').removeClass('_show');
	    }
	    if(scrollBottom <= 100){
	    	$('.f-to-top').css({'top':$('footer').position().top-50, 'position': 'absolute'});
	    }else {
	    	$('.f-to-top').css({'top':'inherit','position': 'fixed','bottom':50});
	    }
	});

	$('.f-to-top').on('click',function(){
		 $('html, body').animate({
            scrollTop: 0
        }, 800);
	});
})