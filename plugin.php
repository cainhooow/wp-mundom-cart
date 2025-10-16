<?php

/**
 * Plugin Name: SideCart MundoM
 * Description: Plugin para criar um carrinho flutuante e personalizado
 * Version: 1.5.6
 * Author: Cainhooow
 * Requires Plugins: modal-api, woocommerce
 * Text Domain: sidecart-mundom
 */

if (!defined('ABSPATH')) {
    exit;
}

define('M_SIDECART_PLUGIN_VERSION', '1.5.6');

class SideCartMundoM
{
    public function __construct()
    {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('wp_body_open', array($this, 'render_cart_menu'));

        add_action('wp_ajax_mundom_update_cart_item', array($this, 'update_cart_item'));
        add_action('wp_ajax_nopriv_mundom_update_cart_item', array($this, 'update_cart_item'));
        add_action('wp_ajax_mundom_remove_cart_item', array($this, 'remove_cart_item'));
        add_action('wp_ajax_nopriv_mundom_remove_cart_item', array($this, 'remove_cart_item'));
        add_action('wp_ajax_mundom_get_cart_data', array($this, 'get_cart_data'));
        add_action('wp_ajax_nopriv_mundom_get_cart_data', array($this, 'get_cart_data'));

        add_action('wp_ajax_animated_add_to_cart', array($this, 'ajax_add_to_cart'));
        add_action('wp_ajax_nopriv_animated_add_to_cart', array($this, 'ajax_add_to_cart'));

        add_action('woocommerce_after_add_to_cart_quantity', array($this, 'render_qty_manage_buttons'));
        add_filter('woocommerce_add_to_cart_fragments', array($this, 'cart_fragments'));

        add_filter('woocommerce_quantity_input_args', array($this, 'modify_quantity_field'), 10, 2);
        add_action('woocommerce_before_add_to_cart_quantity', array($this, 'hide_quantity_wrapper_start'));
        add_action('woocommerce_after_add_to_cart_quantity', array($this, 'hide_quantity_wrapper_end'), 999);

        add_action('template_redirect', array($this, 'setup_custom_button'));
    }

    public function setup_custom_button()
    {
        if (is_product()) {
            wp_enqueue_style('bac-styles', plugin_dir_url(__FILE__) . 'assets/css/bac.css', array(), M_SIDECART_PLUGIN_VERSION);
            wp_enqueue_script('bac-script', plugin_dir_url(__FILE__) . 'assets/js/bac-script.js', array('jquery'), M_SIDECART_PLUGIN_VERSION, true);

            wp_localize_script('bac-script', 'animatedCartButton', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('animated_cart_nonce')
            ));

            add_action('woocommerce_after_add_to_cart_button', array($this, 'custom_add_to_cart_button'));
            add_action('woocommerce_after_add_to_cart_button', array($this, 'hide_default_button_css'), 20);
        }
    }

    public function modify_quantity_field($args, $product)
    {
        if (!$product) {
            return $args;
        }

        $stock_quantity = $product->get_stock_quantity();
        
        if ($stock_quantity !== null && $stock_quantity < 2) {
            $args['min_value'] = 1;
            $args['max_value'] = 1;
            $args['input_value'] = 1;
        }

        return $args;
    }

    public function hide_quantity_wrapper_start()
    {
        global $product;
        
        if (!$product) {
            return;
        }

        $stock_quantity = $product->get_stock_quantity();
        
        if ($stock_quantity !== null && $stock_quantity < 2) {
            echo '<div class="mundom-hide-quantity" style="display: none !important;">';
        }
    }

    public function hide_quantity_wrapper_end()
    {
        global $product;
        
        if (!$product) {
            return;
        }

        $stock_quantity = $product->get_stock_quantity();
        
        if ($stock_quantity !== null && $stock_quantity < 2) {
            echo '</div>';
        }
    }

    public function enqueue_scripts()
    {
        if (!class_exists('WooCommerce')) {
            return;
        }

        wp_enqueue_style('sidecart-mundom-css', plugin_dir_url(__FILE__) . 'assets/css/style.css', array(), M_SIDECART_PLUGIN_VERSION);

        wp_register_script('sidecart-mundom-js', plugin_dir_url(__FILE__) . 'assets/js/cart.js', array('jquery'), M_SIDECART_PLUGIN_VERSION, array(
            'in_footer' => true,
            'strategy' => 'defer'
        ));

        wp_register_script('qty-manage-mundom-js', plugin_dir_url(__FILE__) . 'assets/js/qty-manage.js', array('jquery'), M_SIDECART_PLUGIN_VERSION, array(
            'in_footer' => true,
            'strategy' => 'defer'
        ));

        wp_enqueue_script('sidecart-mundom-js');
        wp_enqueue_script('qty-manage-mundom-js');

        wp_localize_script('sidecart-mundom-js', 'mundom_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('mundom_cart_nonce'),
            'cart_url' => wc_get_cart_url(),
            'checkout_url' => wc_get_checkout_url(),
            'shop_url' => wc_get_page_permalink('shop')
        ));
    }

    public function hide_default_button_css()
    {
        echo '<style>
            .single_add_to_cart_button,
            button.single_add_to_cart_button,
            .woocommerce div.product form.cart .single_add_to_cart_button,
            .woocommerce #content div.product form.cart .single_add_to_cart_button,
            form.cart button.single_add_to_cart_button {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
            .animated-cart-button-wrapper {
                display: block !important;
            }
            .mundom-hide-quantity {
                display: none !important;
            }
        </style>';
    }

    public function custom_add_to_cart_button()
    {
        global $product;

        if (!$product->is_purchasable()) {
            return;
        }

        $is_variable = $product->is_type('variable');
        $disabled_class = $is_variable ? 'disabled' : '';

?>
        <div class="animated-cart-button-wrapper">
            <button type="button"
                class="animated-add-to-cart-button <?php echo $disabled_class; ?>"
                data-product-id="<?php echo esc_attr($product->get_id()); ?>"
                data-product-type="<?php echo esc_attr($product->get_type()); ?>"
                data-quantity="1"
                <?php echo $is_variable ? 'disabled' : ''; ?>>
                <span class="button-icon">
                    <svg class="cart-icon" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                    <svg class="product-icon" viewBox="0 0 24 24" width="16" height="16">
                        <rect x="4" y="4" width="16" height="16" rx="2" />
                    </svg>
                </span>
                <span class="button-text">Adicionar ao Carrinho</span>
                <span class="loading-spinner"></span>
            </button>
            <div class="cart-feedback"></div>
        </div>
<?php
    }

    public function render_qty_manage_buttons()
    {
        global $product;
        
        if (!$product) {
            return;
        }

        $stock_quantity = $product->get_stock_quantity();
        
        if ($stock_quantity !== null && $stock_quantity < 2) {
            return;
        }

        require __DIR__ . '/ui/qty-buttons.php';
    }

    public function render_cart_menu()
    {
        if (!class_exists('WooCommerce')) {
            return;
        }
        require_once __DIR__ . '/ui/cart-menu.php';
    }

    public function ajax_add_to_cart()
    {
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'animated_cart_nonce')) {
            wp_send_json_error(array(
                'message' => 'Sessão expirada. Recarregue a página.'
            ));
            wp_die();
        }

        $product_id = absint($_POST['product_id']);
        $quantity = absint($_POST['quantity']);
        $variation_id = isset($_POST['variation_id']) ? absint($_POST['variation_id']) : 0;
        $variation = isset($_POST['variation']) ? $_POST['variation'] : array();

        if (!$product_id || !$quantity) {
            wp_send_json_error(array(
                'message' => 'Dados inválidos.'
            ));
            wp_die();
        }

        // Para produtos variáveis
        if ($variation_id) {
            $result = WC()->cart->add_to_cart($product_id, $quantity, $variation_id, $variation);
        } else {
            $result = WC()->cart->add_to_cart($product_id, $quantity);
        }

        if ($result) {
            wp_send_json_success(array(
                'message' => 'Produto adicionado ao carrinho!',
                'cart_count' => WC()->cart->get_cart_contents_count()
            ));
        } else {
            wp_send_json_error(array(
                'message' => 'Não foi possível adicionar o produto ao carrinho.'
            ));
        }

        wp_die();
    }

    public function update_cart_item()
    {
        check_ajax_referer('mundom_cart_nonce', 'nonce');

        $cart_item_key = sanitize_text_field($_POST['cart_item_key']);
        $quantity = intval($_POST['quantity']);

        if ($quantity <= 0) {
            WC()->cart->remove_cart_item($cart_item_key);
        } else {
            WC()->cart->set_quantity($cart_item_key, $quantity);
        }

        wp_send_json_success($this->get_cart_data_array());
    }

    public function remove_cart_item()
    {
        check_ajax_referer('mundom_cart_nonce', 'nonce');

        $cart_item_key = sanitize_text_field($_POST['cart_item_key']);
        WC()->cart->remove_cart_item($cart_item_key);

        wp_send_json_success($this->get_cart_data_array());
    }

    public function get_cart_data()
    {
        wp_send_json_success($this->get_cart_data_array());
    }

    private function get_cart_data_array()
    {
        $cart_items = array();
        $cart_total = 0;
        $cart_count = 0;

        if (!WC()->cart->is_empty()) {
            foreach (WC()->cart->get_cart() as $cart_item_key => $cart_item) {
                $product = $cart_item['data'];
                $product_id = $cart_item['product_id'];
                $quantity = $cart_item['quantity'];
                $stock_quantity = $product->get_stock_quantity();

                $cart_items[] = array(
                    'key' => $cart_item_key,
                    'product_id' => $product_id,
                    'name' => $product->get_name(),
                    'price' => $product->get_price(),
                    'quantity' => $quantity,
                    'line_total' => $cart_item['line_total'],
                    'image' => wp_get_attachment_image_src($product->get_image_id(), 'thumbnail')[0] ?? '',
                    'permalink' => $product->get_permalink(),
                    'stock_quantity' => $stock_quantity,
                    'max_quantity' => $stock_quantity !== null ? $stock_quantity : 9999
                );

                $cart_count += $quantity;
            }
            $cart_total = WC()->cart->get_subtotal();
        }

        return array(
            'items' => $cart_items,
            'total' => wc_price($cart_total),
            'count' => $cart_count,
            'is_empty' => WC()->cart->is_empty()
        );
    }

    public function cart_fragments($fragments)
    {
        $fragments['mundom_cart_data'] = $this->get_cart_data_array();
        return $fragments;
    }
}

new SideCartMundoM();