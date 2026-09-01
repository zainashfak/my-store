let cart = [];

const cartToggle = document.getElementById('cart-toggle');
const cartPanel = document.getElementById('cart-panel');
const cartItemsDiv = document.getElementById('cart-items');
const cartCountSpan = document.getElementById('cart-count');
const cartTotalSpan = document.getElementById('cart-total');
const productList = document.getElementById('product-list');
const checkoutBtn = document.getElementById('checkout-btn');

const API_URL = 'https://my-store-production-d0c3.up.railway.app';

async function loadProducts() {
    try {
        const res = await fetch(`${API_URL}/api/products`);
        const products = await res.json();

        productList.innerHTML = '';

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-name="${product.name}" data-price="${product.price}">Add to Cart</button>
            `;
            productList.appendChild(card);
        });

        attachCartButtons();
    } catch (err) {
        console.error('Failed to load products:', err);
        productList.innerHTML = '<p>Could not load products. Is the backend running?</p>';
    }
}

function attachCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const name = button.dataset.name;
            const price = parseFloat(button.dataset.price);
            cart.push({ name, price, quantity: 1 });
            renderCart();
        });
    });
}

cartToggle.addEventListener('click', (e) => {
    e.preventDefault();
    cartPanel.classList.toggle('hidden');
});

function renderCart() {
    cartItemsDiv.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <span>${item.name} - $${item.price.toFixed(2)}</span>
            <button data-index="${index}">Remove</button>
        `;
        cartItemsDiv.appendChild(itemDiv);
    });

    cartCountSpan.textContent = cart.length;
    cartTotalSpan.textContent = total.toFixed(2);

    document.querySelectorAll('.cart-item button').forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.dataset.index);
            cart.splice(index, 1);
            renderCart();
        });
    });
}

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'checkout.html';
});

loadProducts();