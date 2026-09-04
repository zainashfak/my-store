const BACKEND_URL = "https://my-store-production-d0c3.up.railway.app";

document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const orderData = {
    customerName: document.getElementById('customerName').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    items: cart,
    totalAmount
  };

  try {
    const response = await fetch(`${BACKEND_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (data.success) {
      localStorage.removeItem('cart');
      window.location.href = `success.html?orderId=${data.orderId}`;
    } else {
      alert('Something went wrong. Please try again.');
    }
  } catch (err) {
    console.error(err);
    alert('Could not connect to server.');
  }
});