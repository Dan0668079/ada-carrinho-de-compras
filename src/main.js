import "./style.css";

// ----------------------
// Constantes e Referências
// ----------------------

// URL da API (pegando diretamente os personagens 1, 2 e 3 da documentação)
const API_URL = "https://rickandmortyapi.com/api/character/1,2,3";
// Nome da chave usada no localStorage
const STORAGE_KEY = "cartItems";

// Referências para elementos do HTML
const productsContainer = document.getElementById("products"); // Lista de produtos
const cartContainer = document.getElementById("cart_products"); // Lista do carrinho
const cartTotalElement = document.getElementById("cart_total"); // Total de itens
const checkoutBtn = document.getElementById("cart_checkout"); // Botão de finalizar compra

// ----------------------
// Estado da aplicação
// ----------------------

// Produtos vindos da API
let products = [];
// Itens do carrinho (se já existir no localStorage, recupera; senão começa vazio)
let cartItems = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// ----------------------
// Funções Utilitárias
// ----------------------

// Salva os itens do carrinho no localStorage
const saveCart = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));

// Calcula o valor total dos itens no carrinho
const getCartTotal = () =>
  cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

// Busca um item específico do carrinho pelo id
const findCartItem = (id) => cartItems.find((item) => item.id === id);

// Gera um preço aleatório para cada produto (a API não fornece preços)
const getRandomPrice = () => Number((Math.random() * (50 - 10) + 10).toFixed(2));

// ----------------------
// API e Produtos
// ----------------------

// Busca os produtos da API
async function fetchProducts() {
  try {
    const res = await fetch(API_URL); // Faz a requisição
    if (!res.ok) throw new Error("Erro ao carregar API"); // Caso não consiga acessar

    const data = await res.json(); // Converte resposta para JSON

    // Transforma os dados da API para o formato do projeto
    products = data.map((p) => ({
      id: p.id,
      name: p.name,
      image: p.image,
      price: getRandomPrice(), // atribui preço aleatório
    }));

    renderProducts(); // Renderiza os produtos na tela
  } catch (err) {
    console.error(err);
    productsContainer.innerHTML =
      "<p>Não foi possível carregar os produtos. Tente novamente mais tarde.</p>";
  }
}

// Renderiza a lista de produtos disponíveis
function renderProducts() {
  productsContainer.innerHTML = ""; // Limpa antes de redesenhar

  products.forEach((product) => {
    // Verifica se o produto já está no carrinho
    const itemInCart = findCartItem(product.id);
    const quantity = itemInCart ? itemInCart.quantity : 0;

    // Cria o elemento HTML para o produto
    const item = document.createElement("div");
    item.classList.add("item");
    item.dataset.id = product.id; // salva o id no dataset (para identificar depois)

    item.innerHTML = `
      <div class="item__group">
        <img src="${product.image}" alt="${product.name}" class="sticker" />
        <h3>${product.name}</h3>
      </div>
      <div class="item__group">
        <div class="quantity-control">
          <button type="button" class="quantity-btn decrease">-</button>
          <span class="quantity-value">${quantity}</span>
          <button type="button" class="quantity-btn increase">+</button>
        </div>
        <button type="button" class="delete-btn">&times;</button>
      </div>
    `;
    productsContainer.appendChild(item);
  });
}

// ----------------------
// Carrinho
// ----------------------

// Renderiza os itens do carrinho e o valor total
function renderCart() {
  cartContainer.innerHTML = ""; // Limpa antes de redesenhar

  // Para cada item do carrinho, cria um elemento na lista
  cartItems.forEach((item) => {
    const cartEl = document.createElement("div");
    cartEl.classList.add("item");
    cartEl.dataset.id = item.id;

    cartEl.innerHTML = `
      <div class="item__group">
        <img src="${item.image}" alt="${item.name}" class="image" />
        <h3>${item.name}</h3>
      </div>
      <div class="item__group">
        <output class="quantity-value">${item.quantity}</output>
      </div>
    `;
    cartContainer.appendChild(cartEl);
  });

  // Atualiza o total de compras
  cartTotalElement.textContent = `R$ ${getCartTotal().toFixed(2)}`;

  // Ativa ou desativa o botão de checkout
  checkoutBtn.disabled = cartItems.length === 0;

  // Salva no localStorage
  saveCart();
}

// Atualiza a quantidade de itens no carrinho
function updateCart(productId, action) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const item = findCartItem(productId);

  // Se aumentar
  if (action === "increase") {
    item ? (item.quantity += 1) : cartItems.push({ ...product, quantity: 1 });
  }

  // Se diminuir
  if (action === "decrease" && item) {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      cartItems = cartItems.filter((i) => i.id !== productId); // remove do carrinho
    }
  }

  // Se excluir completamente
  if (action === "delete") {
    cartItems = cartItems.filter((i) => i.id !== productId);
  }

  // Atualiza a tela
  renderProducts();
  renderCart();
}

// ----------------------
// Eventos
// ----------------------

// Clique nos botões de produtos (aumentar, diminuir, excluir)
productsContainer.addEventListener("click", (e) => {
  const btn = e.target;
  const itemEl = btn.closest(".item"); // pega o produto clicado
  if (!itemEl) return;

  const productId = Number(itemEl.dataset.id);

  if (btn.classList.contains("increase")) updateCart(productId, "increase");
  if (btn.classList.contains("decrease")) updateCart(productId, "decrease");
  if (btn.classList.contains("delete-btn")) updateCart(productId, "delete");
});

// Clique no botão de finalizar compra
checkoutBtn.addEventListener("click", () => {
  alert("Compra finalizada com sucesso!");
  cartItems = []; // limpa o carrinho
  renderProducts(); // reseta os produtos
  renderCart(); // reseta o carrinho
});

// ----------------------
// Inicialização
// ----------------------

// Quando a página carregar:
window.addEventListener("DOMContentLoaded", () => {
  fetchProducts(); // Busca produtos da API
  renderCart();    // Renderiza carrinho (se houver dados no localStorage)
});
