var myApp = {
    init : function () {
        $.ajax({
            url: 'http://claws-for-thought.blogspot.co.uk/',
        }).done(function (data) {
            var posts = $(data).find('.mobile-post-outer');
            $('#testArea').html(posts);
        })
    }
}