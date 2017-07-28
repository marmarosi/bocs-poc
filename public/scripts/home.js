function showDoll() {
  const doll = bo.getDoll();
  document.getElementById("bundle").innerHTML = doll.name + ': ' + doll.category;
}
