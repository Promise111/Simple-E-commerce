const backdrop = document.querySelector(".backdrop");
const sideDrawer = document.querySelector(".mobile-nav");
const menuToggle = document.querySelector("#side-menu-toggle");

function backdropClickHandler() {
  backdrop.style.display = "none";
  sideDrawer.classList.remove("open");
}

function menuToggleClickHandler() {
  backdrop.style.display = "block";
  sideDrawer.classList.add("open");
}

backdrop.addEventListener("click", backdropClickHandler);
menuToggle.addEventListener("click", menuToggleClickHandler);

const paymentForm = document.getElementById("paymentForm");
paymentForm.addEventListener("submit", payWithPaystack, false);
function payWithPaystack(e) {
  e.preventDefault();
  let handler = PaystackPop.setup({
    key: "pk_test_25f07f3d1348933c8ff809d9204a9ef9c0675bcd", // Replace with your public key
    email: document.getElementById("email-address").value,
    amount: document.getElementById("amount").value * 100,
    channels: ["card"],
    // channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
    // ref: ''+Math.floor((Math.random() * 1000000000) + 1), // generates a pseudo-unique reference. Please replace with a reference you generated. Or remove the line entirely so our API will generate one for you
    // label: "Optional string that replaces customer email"
    // onClose: function(){
    //   alert('Window closed.');
    // },
    callback: function (response) {
      // let message = "Payment complete! Reference: " + response.reference;
      // alert(message);
      // window.location = "http://www.yoururl.com/verify_transaction.php?reference=" + response.reference;
      window.location =
        "http://localhost:3000/create-order/" + response.reference;
    },
  });
  handler.openIframe();
}
