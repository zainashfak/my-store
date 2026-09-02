let cart = [];
let selectedSize = null;

const cartToggle = document.getElementById('cart-toggle');
const cartPanel = document.getElementById('cart-panel');
const cartItemsDiv = document.getElementById('cart-items');
const cartCountSpan = document.getElementById('cart-count');
const cartTotalSpan = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const mainImage = document.getElementById('main-image');

function attachCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            if (!selectedSize) {
                alert('Please select a size first');
                return;
            }
            const name = button.dataset.name;
            const price = parseFloat(button.dataset.price);
            cart.push({ name, price, quantity: 1, size: selectedSize });
            renderCart();
        });
    });
}

function attachGallery() {
    document.querySelectorAll('.thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
            mainImage.src = thumb.dataset.full;
            document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });
}

function attachSizeButtons() {
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedSize = btn.dataset.size;
        });
    });
}

cartToggle.addEventListener('click', (e) => {
    e.preventDefault();
    cartPanel.classList.toggle('hidden');
});

const cartClose = document.getElementById('cart-close');

cartClose.addEventListener('click', () => {
    cartPanel.classList.add('hidden');
});

function renderCart() {
    cartItemsDiv.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <span>${item.name} (${item.size}) - Rs ${item.price}</span>
            <button data-index="${index}">Remove</button>
        `;
        cartItemsDiv.appendChild(itemDiv);
    });

    cartCountSpan.textContent = cart.length;
    cartTotalSpan.textContent = total;

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

attachCartButtons();
attachGallery();
attachSizeButtons();