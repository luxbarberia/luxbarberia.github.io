import { icon } from "./icons.js";

export const CategoryManager = ({ settings }) => `
  <section class="card">
    <div class="section-head">
      <div>
        <span class="eyebrow">Categorias</span>
        <h2>Administrar categorias</h2>
      </div>
    </div>
    <form class="inline-form" data-form="add-category">
      <input name="category" type="text" placeholder="Nueva categoria" required />
      <button class="icon-btn" type="submit" aria-label="Agregar">${icon("plus")}</button>
    </form>
    <div class="tag-list">
      ${settings.categories
        .map(
          (category) => `
            <span class="tag">${category}<button data-action="remove-category" data-category="${category}" aria-label="Eliminar ${category}">${icon("x")}</button></span>
          `
        )
        .join("")}
    </div>
  </section>
`;
