import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CartProvider, useCart } from './CartContext';

function TestComponent() {
  const { items, addItem, removeItem, updateQuantity, clearCart } = useCart();
  return (
    <div>
      <div data-testid="cart-count">{items.length}</div>
      <button onClick={() => addItem({ id: 'p1', name: 'Product 1', price: 100 })}>Add P1</button>
      <button onClick={() => updateQuantity('p1', 5)}>Update P1 to 5</button>
      <button onClick={() => removeItem('p1')}>Remove P1</button>
      <button onClick={clearCart}>Clear</button>
    </div>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds items, updates quantity, removes, and clears correctly', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-count').textContent).toBe('0');

    // Add to cart
    act(() => screen.getByText('Add P1').click());
    expect(screen.getByTestId('cart-count').textContent).toBe('1');

    // Update quantity
    act(() => screen.getByText('Update P1 to 5').click());
    
    // Check localStorage manually to verify state
    const savedCart = JSON.parse(localStorage.getItem('cart'));
    expect(savedCart[0].quantity).toBe(5);

    // Remove item
    act(() => screen.getByText('Remove P1').click());
    expect(screen.getByTestId('cart-count').textContent).toBe('0');
  });
});
