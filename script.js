
// ROAST. COFFEE STORE
// Каталог, фильтры, корзина, демо-заказы

const products = [
  {
    id: "ethiopia",
    name: "Эфиопия Иргачефф",
    short: "ETHIOPIA",
    origin: "Эфиопия",
    notes: "Жасмин · цитрус · чёрный чай",
    roast: "light",
    price: 990,
    bag: "#dfaa68",
    ink: "#4b2b20",
    tile: "#ead7be"
  },
  {
    id: "kenya",
    name: "Кения AA",
    short: "KENYA AA",
    origin: "Кения",
    notes: "Красные ягоды · карамель",
    roast: "light",
    price: 1190,
    bag: "#a74735",
    ink: "#fff0d6",
    tile: "#e9c1b0"
  },
  {
    id: "brazil",
    name: "Бразилия Сантос",
    short: "BRAZIL",
    origin: "Бразилия",
    notes: "Орехи · шоколад · карамель",
    roast: "medium",
    price: 790,
    bag: "#7b654b",
    ink: "#f6e3bb",
    tile: "#ddd3c2"
  },
  {
    id: "colombia",
    name: "Колумбия Супремо",
    short: "COLOMBIA",
    origin: "Колумбия",
    notes: "Карамель · красное яблоко",
    roast: "medium",
    price: 950,
    bag: "#ba723c",
    ink: "#fff1d9",
    tile: "#efd7bb"
  },
  {
    id: "daily",
    name: "Daily Ritual",
    short: "DAILY RITUAL",
    origin: "Фирменный бленд",
    notes: "Тёмный шоколад · миндаль",
    roast: "medium",
    price: 850,
    bag: "#543226",
    ink: "#f4ddab",
    tile: "#d4b79b"
  },
  {
    id: "midnight",
    name: "Midnight Espresso",
    short: "MIDNIGHT",
    origin: "Эспрессо-бленд",
    notes: "Какао · специи · горький шоколад",
    roast: "dark",
    price: 890,
    bag: "#282723",
    ink: "#d6b58c",
    tile: "#c6c0b3"
  },
  {
    id: "italian",
    name: "Italian Classic",
    short: "ITALIAN",
    origin: "Классический бленд",
    notes: "Горький шоколад · жареный орех",
    roast: "dark",
    price: 820,
    bag: "#624132",
    ink: "#f4e5c7",
    tile: "#dbc4ae"
  },
  {
    id: "decaf",
    name: "Slow Evening",
    short: "DECAF",
    origin: "Без кофеина",
    notes: "Молочный шоколад · печенье",
    roast: "decaf",
    price: 1050,
    bag: "#6d7770",
    ink: "#f4ead8",
    tile: "#d6dfd5"
  }
];

const roastNames = {
  light: "Светлая обжарка",
  medium: "Средняя обжарка",
  dark: "Тёмная обжарка",
  decaf: "Без кофеина"
};

const productMap = new Map(
  products.map(product => [product.id, product])
);

const FREE_SHIPPING = 3500;
const SHIPPING_COST = 350;
const STORAGE_KEY = "roast-coffee-cart-v1";

// ЭЛЕМЕНТЫ

const productGrid = document.querySelector("#productGrid");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const filters = document.querySelector("#filters");
const resultsCount = document.querySelector("#resultsCount");

const cartOpen = document.querySelector("#cartOpen");
const cartClose = document.querySelector("#cartClose");
const cartDrawer = document.querySelector("#cartDrawer");
const overlay = document.querySelector("#overlay");

const cartCount = document.querySelector("#cartCount");
const cartItems = document.querySelector("#cartItems");
const subtotalElement = document.querySelector("#subtotal");
const shippingElement = document.querySelector("#shipping");
const totalElement = document.querySelector("#grandTotal");
const shippingMessage = document.querySelector("#shippingMessage");

const checkoutButton = document.querySelector("#checkoutButton");
const orderDialog = document.querySelector("#orderDialog");
const orderClose = document.querySelector("#orderClose");
const orderText = document.querySelector("#orderText");
const copyOrder = document.querySelector("#copyOrder");
const copyStatus = document.querySelector("#copyStatus");

const toast = document.querySelector("#toast");

// СОСТОЯНИЕ

let activeFilter = "all";
let cart = loadCart();
let toastTimer = null;

// ФОРМАТ ДЕНЕГ

function rubles(amount) {
  return new Intl.NumberFormat("ru-RU")
    .format(amount) + " ₽";
}

// ЗАГРУЗКА КОРЗИНЫ

function loadCart() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );

    if (
      !saved ||
      typeof saved !== "object" ||
      Array.isArray(saved)
    ) {
      return {};
    }

    const valid = {};

    for (const [id, quantity] of Object.entries(saved)) {
      if (
        productMap.has(id) &&
        Number.isInteger(quantity) &&
        quantity > 0
      ) {
        valid[id] = Math.min(quantity, 99);
      }
    }

    return valid;
  } catch {
    return {};
  }
}

// СОХРАНЕНИЕ КОРЗИНЫ

function saveCart() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(cart)
    );
  } catch {
    // Если хранилище недоступно,
    // корзина продолжит работать до перезагрузки.
  }
}

// УВЕДОМЛЕНИЕ

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(function() {
    toast.classList.remove("visible");
  }, 2200);
}

// КАТАЛОГ

function renderProducts() {
  const query = searchInput.value
    .trim()
    .toLocaleLowerCase("ru-RU");

  let matched = products.filter(function(product) {
    const categoryMatches =
      activeFilter === "all" ||
      product.roast === activeFilter;

    const searchable = [
      product.name,
      product.origin,
      product.notes,
      roastNames[product.roast]
    ].join(" ").toLocaleLowerCase("ru-RU");

    return (
      categoryMatches &&
      searchable.includes(query)
    );
  });

  // Сортировка
  if (sortSelect.value === "low") {
    matched.sort((a, b) => a.price - b.price);
  }

  if (sortSelect.value === "high") {
    matched.sort((a, b) => b.price - a.price);
  }

  if (sortSelect.value === "name") {
    matched.sort((a, b) =>
      a.name.localeCompare(b.name, "ru")
    );
  }

  resultsCount.textContent =
    `Найдено товаров: ${matched.length}`;

  if (matched.length === 0) {
    productGrid.innerHTML = `
      <div class="empty-results">
        <h3>Ничего не найдено</h3>
        <p>Попробуйте другой запрос или фильтр.</p>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = matched.map(function(product) {
    return `
      <article class="product-card">
        <div class="product-visual"
             style="--tile:${product.tile}">

          <span class="product-label">
            ${roastNames[product.roast]}
          </span>

          <div class="coffee-bag"
               style="--bag:${product.bag};--ink:${product.ink}">
            <div class="bag-top"></div>
            <span class="bag-brand">ROAST.</span>
            <span class="bag-symbol">✳</span>
            <span class="bag-name">${product.short}</span>
            <span class="bag-bottom">
              SPECIALTY COFFEE · 250 G
            </span>
          </div>
        </div>

        <div class="product-info">
          <span class="product-origin">
            ${product.origin}
          </span>

          <h3>${product.name}</h3>
          <p>${product.notes}</p>

          <div class="product-bottom">
            <strong>${rubles(product.price)}</strong>

            <button class="add-button"
                    type="button"
                    data-add="${product.id}"
                    aria-label="Добавить ${product.name} в корзину">
              В корзину +
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

// ФИЛЬТРЫ

filters.addEventListener("click", function(event) {
  const button = event.target.closest("[data-filter]");

  if (!button) return;

  activeFilter = button.dataset.filter;

  filters.querySelectorAll("[data-filter]")
    .forEach(function(item) {
      const selected =
        item.dataset.filter === activeFilter;

      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });

  renderProducts();
});

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);

// ДОБАВЛЕНИЕ ТОВАРА

productGrid.addEventListener("click", function(event) {
  const button = event.target.closest("[data-add]");

  if (!button) return;

  const id = button.dataset.add;
  const product = productMap.get(id);

  if (!product) return;

  const quantity = cart[id] || 0;

  if (quantity >= 99) {
    showToast("Максимум 99 штук одного товара");
    return;
  }

  cart[id] = quantity + 1;

  saveCart();
  renderCart();

  showToast(product.name + " добавлен в корзину");
});

// ДАННЫЕ КОРЗИНЫ

function getCartEntries() {
  return products
    .filter(product => (cart[product.id] || 0) > 0)
    .map(product => ({
      product,
      quantity: cart[product.id]
    }));
}

function getTotals() {
  const entries = getCartEntries();

  const subtotal = entries.reduce(function(sum, item) {
    return sum + item.product.price * item.quantity;
  }, 0);

  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING
      ? 0
      : SHIPPING_COST;

  return {
    entries,
    subtotal,
    shipping,
    total: subtotal + shipping
  };
}

// ОТРИСОВКА КОРЗИНЫ

function renderCart() {
  const { entries, subtotal, shipping, total } =
    getTotals();

  const count = entries.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  cartCount.textContent = count;
  subtotalElement.textContent = rubles(subtotal);

  shippingElement.textContent =
    subtotal === 0
      ? "—"
      : shipping === 0
        ? "Бесплатно"
        : rubles(shipping);

  totalElement.textContent = rubles(total);
  checkoutButton.disabled = count === 0;

  if (subtotal === 0) {
    shippingMessage.textContent =
      "Добавьте товары в корзину.";
  } else if (shipping === 0) {
    shippingMessage.textContent =
      "Бесплатная доставка!";
  } else {
    shippingMessage.textContent =
      "До бесплатной доставки ещё " +
      rubles(FREE_SHIPPING - subtotal);
  }

  if (entries.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <h3>Корзина пока пустая</h3>
        <p>Самое время выбрать что-нибудь вкусное.</p>
      </div>
    `;
    return;
  }

  cartItems.innerHTML = entries.map(function(item) {
    const product = item.product;
    const quantity = item.quantity;

    return `
      <article class="cart-item">
        <div class="cart-item-color"
             style="--item-color:${product.bag}">
          ROAST.
        </div>

        <div class="cart-item-info">
          <h3>${product.name}</h3>
          <p>
            ${rubles(product.price)} × ${quantity}
            = ${rubles(product.price * quantity)}
          </p>

          <div class="cart-item-actions">
            <button type="button" data-action="minus"
                    data-id="${product.id}"
                    aria-label="Уменьшить количество">
              −
            </button>

            <strong>${quantity}</strong>

            <button type="button" data-action="plus"
                    data-id="${product.id}"
                    aria-label="Увеличить количество">
              +
            </button>

            <button type="button"
                    class="remove-button"
                    data-action="remove"
                    data-id="${product.id}">
              Удалить
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

// ИЗМЕНЕНИЕ КОЛИЧЕСТВА

cartItems.addEventListener("click", function(event) {
  const button = event.target.closest("[data-action]");

  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (!productMap.has(id)) return;

  if (action === "remove") {
    delete cart[id];
  }

  if (action === "plus") {
    cart[id] = Math.min((cart[id] || 0) + 1, 99);
  }

  if (action === "minus") {
    const next = (cart[id] || 0) - 1;

    if (next <= 0) {
      delete cart[id];
    } else {
      cart[id] = next;
    }
  }

  saveCart();
  renderCart();
});

// ОТКРЫТИЕ КОРЗИНЫ

function openCart() {
  overlay.hidden = false;
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");

  document.body.classList.add("locked");
  cartClose.focus();
}

function closeCart(restoreFocus = true) {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");

  overlay.hidden = true;
  document.body.classList.remove("locked");

  if (restoreFocus) cartOpen.focus();
}

cartOpen.addEventListener("click", openCart);
cartClose.addEventListener("click", () => closeCart());
overlay.addEventListener("click", () => closeCart());

document.addEventListener("keydown", function(event) {
  if (event.key === "Escape" &&
      cartDrawer.classList.contains("open")) {
    closeCart();
  }

  // Не выпускаем фокус за пределы открытой корзины
  if (event.key === "Tab" &&
      cartDrawer.classList.contains("open")) {
    const elements = Array.from(
      cartDrawer.querySelectorAll("button:not(:disabled)")
    );

    const first = elements[0];
    const last = elements[elements.length - 1];

    if (event.shiftKey &&
        document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey &&
               document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

// СОЗДАНИЕ ДЕМО-ЗАКАЗА

checkoutButton.addEventListener("click", function() {
  const { entries, subtotal, shipping, total } =
    getTotals();

  if (entries.length === 0) return;

  const lines = [
    "ROAST. — ДЕМОНСТРАЦИОННЫЙ ЗАКАЗ",
    "",
    "Дата формирования: " +
      new Date().toLocaleString("ru-RU"),
    "",
    "ТОВАРЫ:"
  ];

  entries.forEach(function(item, index) {
    lines.push(
      `${index + 1}. ${item.product.name}`,
      `   ${item.quantity} шт. × ${rubles(item.product.price)}`,
      `   Сумма: ${rubles(item.quantity * item.product.price)}`
    );
  });

  lines.push(
    "",
    `Товары: ${rubles(subtotal)}`,
    `Доставка: ${rubles(shipping)}`,
    `ИТОГО: ${rubles(total)}`,
    "",
    "Это демонстрационный заказ.",
    "Оплата не производилась.",
    "Товары не зарезервированы.",
    "Заказ никуда не отправлен."
  );

  orderText.value = lines.join("\n");
  copyStatus.textContent = "";

  closeCart(false);
  orderDialog.showModal();
});

// ЗАКРЫТИЕ ДЕМО-ЗАКАЗА

orderClose.addEventListener("click", function() {
  orderDialog.close();
});

orderDialog.addEventListener("close", function() {
  cartOpen.focus();
});

// КОПИРОВАНИЕ

copyOrder.addEventListener("click", async function() {
  try {
    if (!navigator.clipboard) {
      throw new Error("Clipboard unavailable");
    }

    await navigator.clipboard.writeText(orderText.value);
    copyStatus.textContent = "Заказ скопирован!";
  } catch {
    orderText.focus();
    orderText.select();

    copyStatus.textContent =
      "Нажмите Ctrl + C, чтобы скопировать текст.";
  }
});

// ПЕРВЫЙ ЗАПУСК

renderProducts();
renderCart();
