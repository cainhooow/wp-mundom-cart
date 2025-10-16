/**
 * Quantity Manage ext for Woocommerce
 * CreatedBy: Cainhooow
 * With: KairosDev
 */
jQuery(document).ready(function ($) {
    const $qtyInput = $('.quantity input.qty');
    const $incrementBtn = $('#qty-manage-increment');
    const $decrementBtn = $('#qty-manage-decrement');

    if (!$qtyInput.length) return;

    $incrementBtn.on('click', function () {
        let currentValue = parseInt($qtyInput.val()) || 0;
        const max = parseInt($qtyInput.attr('max')) || 9999;
        const step = parseInt($qtyInput.attr('step')) || 1;

        if (currentValue < max) {
            $qtyInput.val(currentValue + step).trigger('change');
        }
    });

    $decrementBtn.on('click', function () {
        let currentValue = parseInt($qtyInput.val()) || 0;
        const min = parseInt($qtyInput.attr('min')) || 1;
        const step = parseInt($qtyInput.attr('step')) || 1;

        if (currentValue > min) {
            $qtyInput.val(currentValue - step).trigger('change');
        }
    });
});
/**
 * Quantity Manage ext for Woocommerce
 * CreatedBy: Cainhooow
 * With: KairosDev
 */