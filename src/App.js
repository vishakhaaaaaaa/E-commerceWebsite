import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import "./styles.css";

/* ---------------- PRODUCT CARD ---------------- */
const ProductCard = memo(({ product, onAddToCart }) => {
  const isOutOfStock = product.stock === 0;

  // Badge logic
  let badge = product.category;
  if (product.price < 50) badge = "Low Price";
  else if (product.price >= 50 && product.price < 150) badge = "Mini";
  else badge = "Trending";

  return (
    <div className="product-card">
      <span className="category-tag">{badge}</span>
      <img
        src={product.thumbnail}
        alt={product.title}
        className="product-img"
      />
      <div className="card-details">
        <h3 className="product-title">{product.title}</h3>

        <div className="price-row">
          <p className="price">${product.price}</p>
          <p className={`status ${isOutOfStock ? "out" : "in"}`}>
            {isOutOfStock ? "Out of Stock" : "In Stock"}
          </p>
        </div>

        <button
          className="add-btn"
          disabled={isOutOfStock}
          onClick={() => onAddToCart(product)}
        >
          {isOutOfStock ? "Unavailable" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
});

/* ---------------- CART ---------------- */
const Cart = ({ cartItems, onRemove }) => {
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  if (cartItems.length === 0) {
    return <div className="cart-empty">Your cart is empty</div>;
  }

  return (
    <div className="cart-container">
      <h2>Your Cart ({cartItems.length})</h2>

      {cartItems.map((item, index) => (
        <div key={`${item.id}-${index}`} className="cart-item">
          <span>{item.title}</span>

          <div className="cart-actions">
            <span>${item.price}</span>
            <button className="remove-btn" onClick={() => onRemove(index)}>
              Remove
            </button>
          </div>
        </div>
      ))}

      <div className="cart-total">
        <strong>Total: ${total.toFixed(2)}</strong>
      </div>
    </div>
  );
};

/* ---------------- APP ---------------- */
export default function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  /* FETCH PRODUCTS */
  useEffect(() => {
    fetch("https://dummyjson.com/products?limit=20")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products);
        setLoading(false);
      });
  }, []);

  /* SAVE CART */
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  /* ADD TO CART */
  const addToCart = useCallback((product) => {
    setCart((prev) => [...prev, product]);
  }, []);

  /* REMOVE */
  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  /* SEARCH */
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  return (
    <div className={`App ${showCart ? "show-cart" : ""}`}>
      {/* HEADER */}
      <header className="header">
        <h1 className="logo" onClick={() => setShowCart(false)}>
          Mini Shop
        </h1>

        <div className="header-actions">
          {showCart ? (
            <button className="back-btn" onClick={() => setShowCart(false)}>
              ← Back to Products
            </button>
          ) : (
            <button
              className="cart-toggle-btn"
              onClick={() => setShowCart(true)}
            >
              Cart ({cart.length})
            </button>
          )}
        </div>
      </header>

      {/* MAIN */}
      <div className="main-layout">
        <div className="product-section">
          {!showCart && (
            <input
              className="search-bar"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}

          {loading ? (
            <p>Loading...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="no-products">No products found</p>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
              ))}
            </div>
          )}
        </div>

        <aside className="cart-sidebar">
          {showCart && <Cart cartItems={cart} onRemove={removeFromCart} />}
        </aside>
      </div>
    </div>
  );
}
