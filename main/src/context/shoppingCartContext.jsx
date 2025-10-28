/* eslint-disable react-refresh/only-export-components */
import {
	createContext,
	useContext,
	useState,
	useEffect,
	useMemo,
	useCallback,
} from 'react';
import PropTypes from 'prop-types';

const ShoppingCartContext = createContext(null);

/**
 * @typedef {object} CartItem
 * @property {string} itemId
 * @property {string} name
 * @property {number} price
 * @property {number} quantity
 * @property {any} [otherProps]
 */

/**
 * Provides shopping cart state and actions to its children.
 * @param {{children: React.ReactNode}} props
 */
export function ShoppingCartProvider({ children }) {
	const [cart, setCart] = useState(() => {
		try {
			const storedCart = localStorage.getItem('shoppingCart');
			return storedCart ? JSON.parse(storedCart) : [];
		} catch (error) {
			console.error(
				'Failed to parse shopping cart from localStorage',
				error
			);
			return [];
		}
	});

	useEffect(() => {
		localStorage.setItem('shoppingCart', JSON.stringify(cart));
	}, [cart]);

	const addItemToCart = useCallback((item, quantity = 1) => {
		setCart((prevCart) => {
			const newCart = [...prevCart];
			const existingIndex = newCart.findIndex(
				(cartItem) => cartItem.itemId === item.itemId
			);

			if (existingIndex >= 0) {
				newCart[existingIndex] = {
					...newCart[existingIndex],
					quantity: newCart[existingIndex].quantity + quantity,
				};
			} else {
				newCart.push({ ...item, quantity });
			}
			return newCart;
		});
	}, []);

	const removeItemFromCart = useCallback((itemId) => {
		setCart((prevCart) =>
			prevCart.filter((cartItem) => cartItem.itemId !== itemId)
		);
	}, []);

	const updateItemQuantity = useCallback((itemId, quantity) => {
		const newQuantity = Math.max(0, quantity);
		setCart((prevCart) => {
			return prevCart
				.map((cartItem) => {
					if (cartItem.itemId === itemId) {
						return { ...cartItem, quantity: newQuantity };
					}
					return cartItem;
				})
				.filter((cartItem) => cartItem.quantity > 0);
		});
	}, []);

	const clearCart = useCallback(() => {
		setCart([]);
	}, []);

	const cartItemCount = useMemo(
		() => cart.reduce((total, item) => total + item.quantity, 0),
		[cart]
	);

	const value = useMemo(
		() => ({
			cart,
			addItemToCart,
			removeItemFromCart,
			updateItemQuantity,
			clearCart,
			cartItemCount,
		}),
		[
			cart,
			addItemToCart,
			removeItemFromCart,
			updateItemQuantity,
			clearCart,
			cartItemCount,
		]
	);

	return (
		<ShoppingCartContext.Provider value={value}>
			{children}
		</ShoppingCartContext.Provider>
	);
}

ShoppingCartProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

/**
 * Hook to access the shopping cart context.
 * @returns {{
 *   cart: CartItem[];
 *   addItemToCart: (item: object, quantity: number) => void;
 *   removeItemFromCart: (itemId: string) => void;
 *   updateItemQuantity: (itemId: string, quantity: number) => void;
 *   clearCart: () => void;
 *   cartItemCount: number;
 * }}
 */
export function useShoppingCart() {
	const context = useContext(ShoppingCartContext);
	if (!context) {
		throw new Error(
			'useShoppingCart must be used within a ShoppingCartProvider'
		);
	}
	return context;
}
