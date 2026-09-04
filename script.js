let cart = [];
let selectedSize = null;
let currentIndex = 0;

const cartToggle = document.getElementById('cart-toggle');
const cartPanel = document.getElementById('cart-panel');
const cartItemsDiv = document.getElementById('cart-items');
const cartCountSpan = document.getElementById('cart-count');
const cartTotalSpan = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const mainImage = document.getElementById('main-image');

const hamburgerToggle = document.getElementById('hamburger-toggle');
const mobileNav = document.getElementById('mobile-nav');
const searchToggle = document.getElementById('search-toggle');
const searchBar = document.getElementById('search-bar');
const galleryPrev = document.getElementById('gallery-prev');
const galleryNext = document.getElementById('gallery-next');
const searchInput = document.getElementById('search-input');
const searchResult = document.getElementById('search-result');

let thumbs = [];

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

function showImage(index) {
    if (thumbs.length === 0) return;
    if (index < 0) index = thumbs.length - 1;
    if (index >= thumbs.length) index = 0;
    currentIndex = index;
    mainImage.src = thumbs[currentIndex].dataset.full;
    thumbs.forEach(t => t.classList.remove('active'));
    thumbs[currentIndex].classList.add('active');
}

function attachGallery() {
    thumbs = Array.from(document.querySelectorAll('.thumb'));

    thumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            showImage(index);
        });
    });

    if (galleryPrev) {
        galleryPrev.addEventListener('click', () => showImage(currentIndex - 1));
    }
    if (galleryNext) {
        galleryNext.addEventListener('click', () => showImage(currentIndex + 1));
    }

    // Swipe support for touch devices
    let touchStartX = 0;
    mainImage.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    mainImage.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 40) {
            if (diff < 0) {
                showImage(currentIndex + 1); // swiped left -> next image
            } else {
                showImage(currentIndex - 1); // swiped right -> previous image
            }
        }
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

cartToggle.addEventListener('click', () => {
    cartPanel.classList.toggle('hidden');
});

const cartClose = document.getElementById('cart-close');

cartClose.addEventListener('click', () => {
    cartPanel.classList.add('hidden');
});

if (hamburgerToggle && mobileNav) {
    hamburgerToggle.addEventListener('click', () => {
        mobileNav.classList.toggle('hidden');
    });
}

if (searchToggle && searchBar) {
    searchToggle.addEventListener('click', () => {
        searchBar.classList.toggle('active');
    });
}

if (searchInput && searchResult) {
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim().toLowerCase();

            if (query.includes('hoodie')) {
                searchResult.textContent = '';
                searchResult.classList.remove('not-found');
                document.getElementById('product').scrollIntoView({ behavior: 'smooth' });
                searchBar.classList.remove('active');
            } else {
                searchResult.textContent = 'Product not found';
                searchResult.classList.add('not-found');
            }
        }
    });
}

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