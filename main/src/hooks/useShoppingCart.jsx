export function useShoppingCart() {
    function addItemToCart(item) {
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        cart.push(item);
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }

    function removeItemFromCart(itemId) {
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        cart = cart.filter(item => item.itemId !== itemId);
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }

    function getCartItems() {
        return JSON.parse(localStorage.getItem('shoppingCart')) || [];
    }

    function clearCart() {
        localStorage.removeItem('shoppingCart');
    }

    function getCartItemCount() {
        const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        return cart.length;
    }

    return { addItemToCart, removeItemFromCart, getCartItems, clearCart, getCartItemCount };
}