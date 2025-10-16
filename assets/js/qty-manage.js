/**
 * Quantity Manage ext for Woocommerce
 * CreatedBy: Cainhooow
 * With: KairosDev
 */
jQuery(document).ready(function ($) {
    const $qtyInput = $('.quantity input.qty');
    const $incrementBtn = $('#qty-manage-increment');
    const $decrementBtn = $('#qty-manage-decrement');
    const $qtyWrapper = $('.mundom-cart-qty-manage');

    if (!$qtyInput.length) return;

    function checkStockAndToggleControls() {
        const max = parseInt($qtyInput.attr('max')) || 9999;
        const min = parseInt($qtyInput.attr('min')) || 1;

        if (max < 2 || (max === 1 && min === 1)) {
            $qtyWrapper.hide();
            $qtyInput.val(1);
            return false;
        }

        $qtyWrapper.show();
        return true;
    }

    function updateButtonStates() {
        const currentValue = parseInt($qtyInput.val()) || 1;
        const max = parseInt($qtyInput.attr('max')) || 9999;
        const min = parseInt($qtyInput.attr('min')) || 1;

        if (currentValue <= min) {
            $decrementBtn.prop('disabled', true).css('opacity', '0.3');
        } else {
            $decrementBtn.prop('disabled', false).css('opacity', '1');
        }

        if (currentValue >= max) {
            $incrementBtn.prop('disabled', true).css('opacity', '0.3');
        } else {
            $incrementBtn.prop('disabled', false).css('opacity', '1');
        }
    }

    if (!checkStockAndToggleControls()) {
        return; 
    }

    updateButtonStates();

    $qtyInput.on('change input', function () {
        updateButtonStates();
    });

    $incrementBtn.on('click', function (e) {
        e.preventDefault();

        if ($(this).prop('disabled')) {
            return;
        }

        let currentValue = parseInt($qtyInput.val()) || 0;
        const max = parseInt($qtyInput.attr('max')) || 9999;
        const step = parseInt($qtyInput.attr('step')) || 1;

        if (currentValue < max) {
            $qtyInput.val(currentValue + step).trigger('change');
            updateButtonStates();
        }
    });

    $decrementBtn.on('click', function (e) {
        e.preventDefault();

        if ($(this).prop('disabled')) {
            return;
        }

        let currentValue = parseInt($qtyInput.val()) || 0;
        const min = parseInt($qtyInput.attr('min')) || 1;
        const step = parseInt($qtyInput.attr('step')) || 1;

        if (currentValue > min) {
            $qtyInput.val(currentValue - step).trigger('change');
            updateButtonStates();
        }
    });

    $('form.variations_form').on('found_variation', function (event, variation) {
        setTimeout(function () {
            if (!checkStockAndToggleControls()) {
                return;
            }
            updateButtonStates();
        }, 100);
    });

    $('form.variations_form').on('reset_data', function () {
        // Quando os dados são resetados
        checkStockAndToggleControls();
        updateButtonStates();
    });
});
/**
 * Quantity Manage ext for Woocommerce
 * CreatedBy: Cainhooow
 * With: KairosDev
 */