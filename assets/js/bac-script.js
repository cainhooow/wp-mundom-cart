jQuery(document).ready(function ($) {
    var $btn = $(".animated-add-to-cart-button");
    var $form = $("form.variations_form");

    // Debug: Log quando o script carrega
    console.log("BAC Script carregado", {
        animatedCartButton: typeof animatedCartButton !== 'undefined' ? animatedCartButton : 'undefined',
        botaoEncontrado: $btn.length
    });

    // Para produtos variáveis - habilita o botão quando uma variação é selecionada
    if ($form.length) {
        $form.on("found_variation", function (event, variation) {
            console.log("Variação encontrada:", variation);
            $btn.removeClass("disabled").prop("disabled", false);
            $btn.data("variation-id", variation.variation_id);
            $btn.data("variation", variation.attributes);
        });

        $form.on("reset_data", function () {
            console.log("Dados resetados");
            $btn.addClass("disabled").prop("disabled", true);
            $btn.removeData("variation-id");
            $btn.removeData("variation");
        });
    }

    $btn.on("click", function (e) {
        e.preventDefault();

        var $thisBtn = $(this);

        if ($thisBtn.hasClass("loading") || $thisBtn.hasClass("disabled")) {
            console.log("Botão desabilitado ou carregando");
            return;
        }

        var productId = $thisBtn.data("product-id");
        var productType = $thisBtn.data("product-type");
        var quantity = $("input.qty").val() || 1;
        var variationId = $thisBtn.data("variation-id") || 0;
        var variation = $thisBtn.data("variation") || {};

        console.log("Tentando adicionar ao carrinho:", {
            productId: productId,
            quantity: quantity,
            variationId: variationId,
            variation: variation
        });

        $thisBtn.addClass("adding");

        setTimeout(function () {
            $thisBtn.removeClass("adding").addClass("loading");

            var ajaxData = {
                action: "animated_add_to_cart",
                product_id: productId,
                quantity: quantity,
                nonce: animatedCartButton.nonce
            };

            // Adiciona dados de variação se for produto variável
            if (productType === "variable" && variationId) {
                ajaxData.variation_id = variationId;
                ajaxData.variation = variation;
            }

            console.log("Enviando requisição AJAX:", ajaxData);

            $.ajax({
                url: animatedCartButton.ajax_url,
                type: "POST",
                data: ajaxData,
                success: function (response) {
                    console.log("Sucesso:", response);
                    $thisBtn.removeClass("loading").addClass("success");
                    $thisBtn.find(".button-text").text("Adicionado!");

                    showFeedback(response.data.message, "success");

                    // Atualiza contador do carrinho
                    $(".cart-contents-count").text(response.data.cart_count);

                    // Trigger do WooCommerce para atualizar mini cart
                    $(document.body).trigger("added_to_cart", [response.fragments, response.cart_hash, $thisBtn]);

                    if (typeof window.WooUpsellModal !== 'undefined' && typeof window.WooUpsellModal.openModal === 'function') {
                        window.WooUpsellModal.openModal(productId);
                    }
                    setTimeout(function () {
                        $thisBtn.removeClass("success");
                        $thisBtn.find(".button-text").text("Adicionar ao Carrinho");
                    }, 2000);
                },
                error: function (xhr, status, error) {
                    console.error("Erro AJAX:", {
                        status: status,
                        error: error,
                        response: xhr.responseText,
                        xhr: xhr
                    });

                    $thisBtn.removeClass("loading");

                    var errorMsg = "Erro ao adicionar produto";
                    if (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message) {
                        errorMsg = xhr.responseJSON.data.message;
                    }

                    showFeedback(errorMsg, "error");
                }
            });
        }, 600);
    });

    function showFeedback(message, type) {
        var $feedback = $(".cart-feedback");
        if (!$feedback.length) {
            $btn.after('<div class="cart-feedback"></div>');
            $feedback = $(".cart-feedback");
        }
        $feedback.text(message).addClass("show " + type);

        setTimeout(function () {
            $feedback.removeClass("show " + type);
        }, 3000);
    }
});