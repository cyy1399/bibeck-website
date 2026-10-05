// Pure disclosure interaction. No financial input, state storage, or analysis calls.
document.querySelectorAll('a[href="#why"]').forEach(link => {
  link.addEventListener("click", () => {
    const panel = document.getElementById("why");
    if (panel instanceof HTMLDetailsElement) panel.open = true;
  });
});
