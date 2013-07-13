// Client Code

console.log('App Loaded');

    $( "#sortable" ).sortable();


   $("#select").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: "http://api.stackoverflow.com/1.1/users",
                data: {
                    filter: request.term,
                    pagesize: 5
                },
                jsonp: "jsonp",
                dataType: "jsonp",
                success: function(data) {
                    response($.map(data.users, function(el, index) {
                        return {
                            value: el.display_name,
                            avatar: "http://www.gravatar.com/avatar/" +
                                el.email_hash
                        };
                    }));
                }
            });
        },
        select: function(e, obj) {
            console.log(obj.item.value);
            $('<li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span><img src=' + obj.item.avatar + '/>' + obj.item.value + '<a class="close">x</a></li>').hide().prependTo("#sortable").show("slide", {direction:"left"},"fast");
            $(".close").on('click', function()
            {
                //$(this).parent().fadeOut("fast");;
                $(this).parent().hide("slide",{direction:"left"},"slow");
            });
        }

    }).data("uiAutocomplete")._renderItem = function (ul, item) {
        return $("<li />")
            .data("item.autocomplete", item)
            .append("<a><img src='" + item.avatar + "' />" + item.value + "</a>")
            .appendTo(ul);
    };   
