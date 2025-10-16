/**
 * SideCard MundoM
 * CreatedBy: Cainhooow
 * With: KairosDev
 */

jQuery(document).ready(function ($) {
    'use strict';

    const MundomCart = {
        elements: {
            trigger: $('#mundom-cart-trigger'),
            overlay: $('#mundom-cart-overlay'),
            menu: $('#mundom-sidecart-menu'),
            closeBtn: $('#close-cart-menu'),
            cartCount: $('.cart-count'),
            cartItems: $('#cart-items-list'),
            cartEmpty: $('#cart-empty'),
            cartFooter: $('#cart-footer'),
            cartTotal: $('#cart-total'),
            loading: $('#cart-loading'),
            continueBtn: $('#continue-shopping'),
            viewCartBtn: $('#view-cart'),
            checkoutBtn: $('#checkout')
        },

        init: function () {
            this.bindEvents();
            this.loadCartData();
            this.observeCartChanges();
        },

        bindEvents: function () {
            this.elements.trigger.on('click', this.openMenu.bind(this));
            this.elements.closeBtn.on('click', this.closeMenu.bind(this));
            this.elements.overlay.on('click', this.closeMenu.bind(this));

            this.elements.continueBtn.on('click', this.closeMenu.bind(this));
            this.elements.viewCartBtn.on('click', () => window.location.href = mundom_ajax.cart_url);
            this.elements.checkoutBtn.on('click', () => window.location.href = mundom_ajax.checkout_url);

            $(document).on('keydown', (e) => {
                if (e.key === 'Escape') this.closeMenu();
            });

            this.elements.cartItems.on('click', '.quantity-btn', this.handleQuantityChange.bind(this));
            this.elements.cartItems.on('click', '.remove-btn', this.handleRemoveItem.bind(this));
            this.elements.cartItems.on('change', '.quantity-input', this.handleQuantityInput.bind(this));
        },

        openMenu: function () {
            this.elements.overlay.addClass('active');
            this.elements.menu.addClass('active');
            $('body').addClass('mundom-cart-open');
            this.loadCartData();
        },

        closeMenu: function () {
            this.elements.overlay.removeClass('active');
            this.elements.menu.removeClass('active');
            $('body').removeClass('mundom-cart-open');
        },

        loadCartData: function () {
            this.showLoading();

            $.ajax({
                url: mundom_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'mundom_get_cart_data',
                    nonce: mundom_ajax.nonce
                },
                success: (response) => {
                    if (response.success) {
                        this.updateCartDisplay(response.data);
                    }
                },
                error: () => {
                    this.hideLoading();
                    console.error('Erro ao carregar dados do carrinho');
                }
            });
        },

        updateCartDisplay: function (data) {
            this.hideLoading();
            this.updateCartCount(data.count);

            if (data.is_empty) {
                this.showEmptyCart();
            } else {
                this.showCartItems(data);
            }
        },

        showLoading: function () {
            this.elements.loading.show();
            this.elements.cartEmpty.hide();
            this.elements.cartItems.parent().hide();
            this.elements.cartFooter.hide();
        },

        hideLoading: function () {
            this.elements.loading.hide();
        },

        showEmptyCart: function () {
            this.elements.cartEmpty.show();
            this.elements.cartItems.parent().hide();
            this.elements.cartFooter.hide();
            this.hideTrigger();
        },

        showCartItems: function (data) {
            this.elements.cartEmpty.hide();
            this.elements.cartItems.parent().show();
            this.elements.cartFooter.show();

            this.renderCartItems(data.items);
            this.elements.cartTotal.html(data.total);
            this.showTrigger();
        },

        renderCartItems: function (items) {
            const itemsHtml = items.map(item => this.createCartItemHtml(item)).join('');
            this.elements.cartItems.html(itemsHtml);
        },

        createCartItemHtml: function (item) {
            const imageHtml = item.image ?
                `<img src="${item.image}" alt="${item.name}" loading="lazy">` :
                '<div class="no-image"><i class="ri-image-line"></i></div>';

            const hideQuantityControls = item.stock_quantity !== null && item.stock_quantity < 2;
            const quantityControlsClass = hideQuantityControls ? 'quantity-controls-hidden' : '';
            const maxQuantity = item.max_quantity || 9999;

            return `
                <div class="cart-item" data-key="${item.key}" data-max-quantity="${maxQuantity}">
                    <div class="cart-item-image">
                        ${imageHtml}
                    </div>
                    <div class="cart-item-info">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <div class="cart-item-price">R$ ${parseFloat(item.price).toFixed(2).replace('.', ',')}</div>
                        <div class="cart-item-controls">
                            <div class="quantity-controls ${quantityControlsClass}" ${hideQuantityControls ? 'style="display: none;"' : ''}>
                                <button class="quantity-btn decrease" data-action="decrease" ${item.quantity <= 1 || hideQuantityControls ? 'disabled' : ''}>
                                    <i class="ri-subtract-line"></i>
                                </button>
                                <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="${maxQuantity}" readonly>
                                <button class="quantity-btn increase" data-action="increase" ${item.quantity >= maxQuantity || hideQuantityControls ? 'disabled' : ''}>
                                    <i class="ri-add-line"></i>
                                </button>
                            </div>
                            ${hideQuantityControls ? `<div class="quantity-display">Qtd: ${item.quantity}</div>` : ''}
                            <button class="remove-btn" title="Remover item">
                                <i class="ri-delete-bin-line"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },

        handleQuantityChange: function (e) {
            e.preventDefault();
            const $btn = $(e.currentTarget);

            if ($btn.prop('disabled')) {
                return;
            }

            const $cartItem = $btn.closest('.cart-item');
            const $quantityInput = $cartItem.find('.quantity-input');
            const cartItemKey = $cartItem.data('key');
            const maxQuantity = $cartItem.data('max-quantity') || 9999;
            const action = $btn.data('action');
            let currentQuantity = parseInt($quantityInput.val());

            if (action === 'increase' && currentQuantity < maxQuantity) {
                currentQuantity++;
            } else if (action === 'decrease' && currentQuantity > 1) {
                currentQuantity--;
            } else {
                return;
            }

            this.updateCartItem(cartItemKey, currentQuantity, $cartItem);
        },

        handleQuantityInput: function (e) {
            const $input = $(e.currentTarget);
            const $cartItem = $input.closest('.cart-item');
            const cartItemKey = $cartItem.data('key');
            const maxQuantity = $cartItem.data('max-quantity') || 9999;
            let quantity = parseInt($input.val());

            if (isNaN(quantity) || quantity < 1) {
                quantity = 1;
            } else if (quantity > maxQuantity) {
                quantity = maxQuantity;
            }

            $input.val(quantity);
            this.updateCartItem(cartItemKey, quantity, $cartItem);
        },

        handleRemoveItem: function (e) {
            e.preventDefault();
            const $btn = $(e.currentTarget);
            const $cartItem = $btn.closest('.cart-item');
            const cartItemKey = $cartItem.data('key');

            $cartItem.addClass('removing');

            setTimeout(() => {
                this.removeCartItem(cartItemKey);
            }, 400);
        },

        updateCartItem: function (cartItemKey, quantity, $cartItem) {
            $cartItem.css('opacity', '0.6');

            $.ajax({
                url: mundom_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'mundom_update_cart_item',
                    cart_item_key: cartItemKey,
                    quantity: quantity,
                    nonce: mundom_ajax.nonce
                },
                success: (response) => {
                    if (response.success) {
                        this.updateCartDisplay(response.data);
                        this.showUpdateFeedback($cartItem, 'success');
                    } else {
                        this.showUpdateFeedback($cartItem, 'error');
                    }
                },
                error: () => {
                    this.showUpdateFeedback($cartItem, 'error');
                },
                complete: () => {
                    $cartItem.css('opacity', '1');
                }
            });
        },

        removeCartItem: function (cartItemKey) {
            $.ajax({
                url: mundom_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'mundom_remove_cart_item',
                    cart_item_key: cartItemKey,
                    nonce: mundom_ajax.nonce
                },
                success: (response) => {
                    if (response.success) {
                        this.updateCartDisplay(response.data);
                        this.showNotification('Item removido do carrinho', 'success');
                    }
                },
                error: () => {
                    this.showNotification('Erro ao remover item', 'error');
                }
            });
        },

        showUpdateFeedback: function ($cartItem, type) {
            const $feedback = $('<div class="update-feedback"></div>');
            $feedback.text(type === 'success' ? '✓' : '✗');
            $feedback.addClass(type);

            $cartItem.append($feedback);

            setTimeout(() => {
                $feedback.fadeOut(() => $feedback.remove());
            }, 1000);
        },

        showNotification: function (message, type = 'info') {
            const $notification = $(`
                <div class="mundom-notification ${type}">
                    <i class="ri-${type === 'success' ? 'check' : 'error-warning'}-line"></i>
                    <span>${message}</span>
                </div>
            `);

            $('body').append($notification);

            setTimeout(() => {
                $notification.addClass('show');
            }, 100);

            setTimeout(() => {
                $notification.removeClass('show');
                setTimeout(() => $notification.remove(), 300);
            }, 3000);
        },

        updateCartCount: function (count) {
            this.elements.cartCount.text(count);

            if (count > 0) {
                this.showTrigger();
            } else {
                this.hideTrigger();
            }
        },

        showTrigger: function () {
            if (!this.elements.trigger.is(':visible')) {
                this.elements.trigger.show().addClass('bounceIn');
            }
        },

        hideTrigger: function () {
            this.elements.trigger.hide().removeClass('bounceIn');
        },

        observeCartChanges: function () {
            $(document.body).on('wc_fragments_refreshed wc_fragments_loaded', () => {
                this.loadCartData();
            });

            $(document.body).on('added_to_cart', (event, fragments, cart_hash, button) => {
                this.loadCartData();
                this.showNotification('Produto adicionado ao carrinho!', 'success');

                if (this.shouldAutoOpenCart()) {
                    setTimeout(() => this.openMenu(), 500);
                }
            });
        },
        // abrir carrinho automaticamente ao adicionar itens
        shouldAutoOpenCart: function () {
            return false;
        }
    };

    const notificationStyles = `
        <style>
            .mundom-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(31, 32, 32, 0.95);
                backdrop-filter: blur(20px);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                z-index: 100000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                border-left: 3px solid #667eea;
            }
            
            .mundom-notification.success {
                border-left-color: #2ed573;
            }
            
            .mundom-notification.error {
                border-left-color: #ff4757;
            }
            
            .mundom-notification.show {
                transform: translateX(0);
            }
            
            .update-feedback {
                position: absolute;
                top: 50%;
                right: 1rem;
                transform: translateY(-50%);
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
            }
            
            .update-feedback.success {
                background: #2ed573;
                color: white;
            }
            
            .update-feedback.error {
                background: #ff4757;
                color: white;
            }
            
            body.mundom-cart-open {
                overflow: hidden;
            }
            
            .quantity-controls-hidden,
            .quantity-controls[style*="display: none"] {
                display: none !important;
            }
            
            .quantity-display {
                background: rgba(255, 255, 255, 0.1);
                padding: 0.5rem 1rem;
                border-radius: 8px;
                color: #fff;
                font-size: 0.9rem;
            }
            
            .quantity-btn:disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }
            
            @media (max-width: 480px) {
                .mundom-notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    transform: translateY(-100%);
                }
                
                .mundom-notification.show {
                    transform: translateY(0);
                }
            }
        </style>
    `;

    $('head').append(notificationStyles);

    // Inicializar o carrinho
    MundomCart.init();

    // Expor para uso global se necessário
    window.MundomCart = MundomCart;
});
/**
 * SideCard MundoM
 * CreatedBy: Cainhooow
 * With: KairosDev
 */