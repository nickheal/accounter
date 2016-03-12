var myApp = {
    init : function () {
        myApp.loadPosts();
        myApp.background();
    },
    loadPosts : function () {
        $('body').append($('<div class="loader"></div>'));

        $.ajax({
            url: 'http://claws-for-thought.blogspot.co.uk/',
        }).done(function (data) {
            var posts = $(data).find('.mobile-post-outer');
            $('#testArea').html(posts);
            $('.loader').addClass('finished');
            setInterval(function () {
                $('.mobile-post-outer').each(function () {
                    $(this).addClass('loaded');
                })
            }, 1)
        })
    },
    background : function () {
        var backgroundLoop = new TimelineMax({repeat:-1, yoyo:true, paused:true});
        backgroundLoop.to('body', 5, {'background-color': 'rgb(210, 210, 210)'});

        backgroundLoop.play();
    }
}