var app = (function () {
    'use strict';

    var app, storage, vis, tools, el;

    el = {
        $body: $('body')
    }

    tools = {
        convertSerializedArrayToObj: function (arr) {
            var returnObj, i, item;

            returnObj = {};
            for (i = 0; i < arr.length; i++) {
                item = arr[i];
                returnObj[item.name] = item.value;
            }

            return returnObj;
        }
    }

    storage = {
        init: function () {
            if (!localStorage.getItem('lastSync')) {
                localStorage.setItem('lastSync', Date());
            }
            if (!localStorage.getItem('cachedItems')) {
                var emptyArr = [];
                localStorage.setItem('cachedItems', JSON.stringify(emptyArr));
            }
        },

        getUser: function () {
            return localStorage.getItem('user') || '';
        },

        setUser: function (user) {
            return localStorage.setItem('user', user);
        },

        getCache: function () {
            return JSON.parse(localStorage.getItem('cachedItems'));
        },

        addItem: function (item) {
            var cache;

            cache = localStorage.getItem('cachedItems');
            cache = JSON.parse(cache);

            cache.push(item);

            localStorage.setItem('cachedItems', JSON.stringify(cache));

            app.updateCacheDisplay();
        },

        deleteItem: function (timestamp) {
            var cache, i;

            cache = localStorage.getItem('cachedItems');
            cache = JSON.parse(cache);

            for (i = 0; i < cache.length; i++) {
                if (cache[i].date === timestamp) {
                    cache.splice(i, 1);
                    break;
                }
            }

            localStorage.setItem('cachedItems', JSON.stringify(cache));

            app.updateCacheDisplay();
        },

        sync: function () {
            vis.showLoading();
            $.ajax({
                method: 'POST',
                data: {data: storage.getCache()},
                url: 'http://192.168.0.5:8888/accounter/api/set_items.php',
                success: function (data) {
                    vis.hideLoading();
                    localStorage.setItem('cachedItems', JSON.stringify([]));
                    app.updateCacheDisplay();
                },
                error: function (err) {
                    vis.hideLoading();
                    alert('Couldn\'t connect');
                }
            });
        }
    }

    vis = {
        init: function () {
            var $document, $settings;

            $document = $(document);
            $settings = $('#settings');

            $settings.on('click', function (e) {
                e.preventDefault();
                vis.showSettings();
            });

            $document.on('click', '.popup-close', function (e) {
                var $this = $(this);
                $this.parent().parent().remove();
            });
        },
        showLoading: function () {
            if (!$('#loading-screen').length) {
                el.$body.append('<div id="loading-screen"></div>');
            }
        },

        hideLoading: function () {
            $('#loading-screen').remove();
        },

        showSettings: function () {
            el.$body.append('<div class="popup-wrapper"><div class="popup settings"><button class="popup-close">&times;</button><h2>Settings</h2><input placeholder="Username" id="edit-username" value="' + storage.getUser() + '"></div></div>');

            setTimeout(function () {
                $('.popup-wrapper').addClass('active');
                $('.popup').addClass('active');

                $('#edit-username').on('change', function () {
                    var newName;
                    newName = $(this).val();
                    storage.setUser(newName);
                    app.updateUser();
                });
            }, 0);
        }
    }

    app = {
        init: function () {
            var $form, $sync, $document;

            $form = $('#add-item-form');
            $sync = $('#sync');
            $document = $(document);

            $form.on('submit', function (e) {
                e.preventDefault();
                app.addItem();
            });

            $sync.on('click', function (e) {
                e.preventDefault();
                storage.sync();
            });

            vis.init();

            $document.on('click', '.delete-cached-item', function (e) {
                var timestamp;

                e.preventDefault();

                timestamp = $(this).parent().attr('data-timestamp');
                storage.deleteItem(timestamp);
            });

            storage.init();
            app.updateUser();

            app.updateCacheDisplay();
        },

        addItem: function () {
            var formData;

            formData = $('#add-item-form').serializeArray();
            formData = tools.convertSerializedArrayToObj(formData);
            formData.user = storage.getUser();
            formData.date = Date();

            storage.addItem(formData);
        },

        updateCacheDisplay: function () {
            var cache, $cacheHolder, myClass, i;

            $cacheHolder = $('#cached-item-display');
            cache = storage.getCache();

            $cacheHolder.empty();

            for (i = 0; i < cache.length; i++) {
                myClass = cache[i].shared ? 'shared' : 'not-shared';
                $cacheHolder.append('<li class="' + myClass + '" data-timestamp="' + cache[i].date + '">' + 
                    '<p class="description">' + cache[i].description + '</p>' +
                    '<p class="price">£' + cache[i].price + '</p>' +
                    '<button class="delete-cached-item">&times;</button>' +
                    '</li>');
            }
        },

        updateUser: function () {
            $('.username').text(storage.getUser());
        }
    }

    return app;

})();


$(document).ready(function () {
    app.init();
})