(function ($) {
    /** spinner Qty*/
    $('.spn-qty .btn:first-of-type').on('click', function () {
        add($('.spn-qty input'));
    });
    $('.spn-qty .btn:last-of-type').on('click', function () {
        sustract($('.spn-qty input'));
    });
    /**
    Spinner Price
    **/
    $('.spn-prc .btn:first-of-type').on('click', function () {
        add($('.spn-prc input'));
    });
    $('.spn-prc .btn:last-of-type').on('click', function () {

        sustract($('.spn-prc input'));
    });
        
    $('.spn-sprc .btn:first-of-type').on('click', function () {
        add($('.spn-sprc input'));
    });
    $('.spn-sprc .btn:last-of-type').on('click', function () {

        sustract($('.spn-sprc input'));
    });

    /** Suma una unidad */
    function add(element) {
        element.val(parseInt(element.val(), 10) + 1);
    }

    /**REsta una unidad, no puede ser negativo**/
    function sustract(element) {
        var current_number = element.val();
        if (current_number > 0) {
            element.val(parseInt(element.val(), 10) - 1);
        }
    }

})(jQuery);