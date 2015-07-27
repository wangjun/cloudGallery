'use strict';
$(document).ready(function () {
    $('input').on('keypress keyup keydown', function (event) {
        if( (event.keyCode === 13) ) {
            event.preventDefault();
        }
    });
});
