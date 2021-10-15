exports.get404 = async (req, res) => {
  return res.status(404).render("404", {
    pageTitle: "404 Page not found",
    path: "/404"
  });
};
