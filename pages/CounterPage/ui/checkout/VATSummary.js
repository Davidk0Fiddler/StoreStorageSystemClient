export function RenderVATSummary({ afa27, afa18, afa5, afa0 }) {
  const afa27Area = document.getElementById("afa-27-area");

  const afa18Area = document.getElementById("afa-18-area");

  const afa5Area = document.getElementById("afa-5-area");

  const afa0Area = document.getElementById("afa-0-area");

  if (afa27Area) {
    afa27Area.textContent = `${afa27}Ft`;
  }

  if (afa18Area) {
    afa18Area.textContent = `${afa18}Ft`;
  }

  if (afa5Area) {
    afa5Area.textContent = `${afa5}Ft`;
  }

  if (afa0Area) {
    afa0Area.textContent = `${afa0}Ft`;
  }
}
