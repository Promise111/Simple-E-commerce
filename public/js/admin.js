async function deleteProduct(btn) {
  const productId = btn.parentNode.querySelector("[name=productId]").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf]").value;
  const element = btn.closest("article");
  fetch("/admin/deleteProduct/" + productId, {
    method: "DELETE",
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      //   element.remove()
      element.parentNode.removeChild(element);
    })
    .catch((error) => {
      error.json();
    });
}
