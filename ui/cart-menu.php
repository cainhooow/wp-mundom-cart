<!-- 
Title: Mundo Masculino - Carrinho
Author: Cainhooow
With: KairosDev
-->
<div id="mundom-cart-trigger" class="mundom-cart-trigger" style="display: none;">
    <i class="ri-shopping-bag-4-fill"></i>
    <span class="cart-count">0</span>
</div>

<div id="mundom-cart-overlay" class="mundom-cart-overlay"></div>

<div id="mundom-sidecart-menu" class="mundom-sidecart-menu">
    <div class="cart-menu-header">
        <div class="cart-menu-title">
            <h1>
                <i class="ri-shopping-bag-4-line"></i>
                Seu carrinho
            </h1>
        </div>
        <div class="cart-menu-action">
            <i class="ri-close-line" id="close-cart-menu"></i>
        </div>
    </div>

    <div class="cart-content">
        <div class="cart-loading" id="cart-loading">
            <div class="loading-spinner"></div>
            <p>Carregando...</p>
        </div>

        <div class="cart-empty" id="cart-empty" style="display: none;">
            <div class="empty-icon">
                <i class="ri-shopping-bag-line"></i>
            </div>
            <h3>Seu carrinho está vazio</h3>
            <p>Fala time, seu carrinho está vazio</p>
            <p>Adicione produtos no seu carrinho</p>
        </div>

        <div class="cart-items-wrapper">
            <div class="cart-items" id="cart-items-list">
            </div>
        </div>
    </div>

    <div class="cart-footer" id="cart-footer" style="display: none;">
        <div class="cart-total">
            <div class="total-label">Total:</div>
            <div class="total-value" id="cart-total">R$ 0,00</div>
        </div>

        <div class="cart-actions">
            <button class="btn-continue-shopping" id="continue-shopping">
                <i class="ri-arrow-left-line"></i>
                Continuar comprando
            </button>

            <div class="checkout-actions">
                <button class="btn-view-cart" id="view-cart">
                    <i class="ri-shopping-cart-line"></i>
                    Ver carrinho
                </button>

                <button class="btn-checkout" id="checkout">
                    <i class="ri-secure-payment-line"></i>
                    Finalizar compra
                </button>
            </div>
        </div>
    </div>
</div>
<!-- 
Title: Mundo Masculino - Carrinho
Author: Cainhooow
With: KairosDev
-->