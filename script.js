let cart = [];

const cartToggle = document.getElementById('cart-toggle');
const cartPanel = document.getElementById('cart-panel');
const cartItemsDiv = document.getElementById('cart-items');
const cartCountSpan = document.getElementById('cart-count');
const cartTotalSpan = document.getElementById('cart-total');
const productList = document.getElementById('product-list');
const checkoutBtn = document.getElementById('checkout-btn');

async function loadProducts() {
    try {
        const res = await fetch('http://localhost:3000/api/products');
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
            cart.push({ name, price });
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

checkoutBtn.addEventListener('click', async () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart })
        });

        const data = await res.json();

        if (data.url) {
            window.location.href = data.url;
        } else {
            alert('Something went wrong starting checkout.');
        }
    } catch (err) {
        console.error(err);
        alert('Could not start checkout. Is the backend running?');
    }
});

loadProducts();