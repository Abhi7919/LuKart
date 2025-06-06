const toggle = document.getElementById('mobile-menu');
const navLinks = document.getElementById('nav-links');

toggle.addEventListener('click',() => {
    navLinks.classList.toggle('active');
});

// User Authentication
class Auth {
    static saveUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    static getUser() {
        return JSON.parse(localStorage.getItem('user'));
    }

    static logout() {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    static isLoggedIn() {
        return !!this.getUser();
    }
}

// Shopping Cart
class Cart {
    static getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static addToCart(product) {
        const cart = this.getCart();
        cart.push(product);
        this.saveCart(cart);
    }

    static updateQuantity(productId, change) {
        const cart = this.getCart();
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = (item.quantity || 1) + change;
            if (item.quantity < 1) item.quantity = 1;
            this.saveCart(cart);
            this.updateCartDisplay();
        }
    }

    static updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        const cart = this.getCart();
        
        if (!cartItems) return;
        
        cartItems.innerHTML = '';
        let subtotal = 0;
        
        cart.forEach(item => {
            const price = parseFloat(item.price.replace('₹', '').replace(',', ''));
            const quantity = item.quantity || 1;
            subtotal += price * quantity;
            
            cartItems.innerHTML += `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="Cart.updateQuantity(${item.id}, -1)">-</button>
                            <span>${quantity}</span>
                            <button class="quantity-btn" onclick="Cart.updateQuantity(${item.id}, 1)">+</button>
                        </div>
                        <p class="item-price">₹${(price * quantity).toFixed(2)}</p>
                    </div>
                    <button class="remove-btn" onclick="Cart.removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            `;
        });

        // Update summary
        const itemCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
        document.getElementById('itemCount').textContent = itemCount;
        document.getElementById('itemCountSummary').textContent = itemCount;
        document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        
        // Calculate discount (10% for demo)
        const discount = subtotal * 0.1;
        document.getElementById('discount').textContent = `-₹${discount.toFixed(2)}`;
        
        // Update total
        const delivery = subtotal > 0 ? 99 : 0;
        const total = subtotal - discount + delivery;
        document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
    }

    static removeFromCart(productId) {
        const cart = this.getCart();
        const updatedCart = cart.filter(item => item.id !== productId);
        this.saveCart(updatedCart);
        this.updateCartDisplay();
    }

    static clearCart() {
        localStorage.removeItem('cart');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Simple validation
            Auth.saveUser({ email, name: email.split('@')[0] });
            window.location.href = 'index.html';
        });
    }

    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            
            Auth.saveUser({ email, name });
            window.location.href = 'index.html';
        });
    }

    // Add to Cart Buttons
    const addToCartButtons = document.querySelectorAll('.add-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const product = {
                id: Date.now(),
                name: productCard.querySelector('h3').textContent,
                price: productCard.querySelector('.price').textContent,
                image: productCard.querySelector('img').src
            };
            Cart.addToCart(product);
            alert('Product added to cart!');
        });
    });

    // Update Cart Page
    const cartItems = document.getElementById('cartItems');
    if (cartItems) {
        const cart = Cart.getCart();
        let total = 0;
        
        cart.forEach(item => {
            total += parseFloat(item.price.replace('₹', '').replace(',', ''));
            cartItems.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p>${item.price}</p>
                    </div>
                    <button onclick="Cart.removeFromCart(${item.id})">Remove</button>
                </div>
            `;
        });

        document.getElementById('subtotal').textContent = `₹${total.toFixed(2)}`;
        document.getElementById('total').textContent = `₹${(total + 99).toFixed(2)}`;
    }

    // Initialize cart display if on cart page
    if (document.getElementById('cartItems')) {
        Cart.updateCartDisplay();
    }
});