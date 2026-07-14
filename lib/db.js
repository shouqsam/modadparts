import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { formatList, toStringList } from "./productFields";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

// Simple in-process write queue to avoid concurrent read-modify-write races.
let writeQueue = Promise.resolve();
function enqueue(task) {
  const result = writeQueue.then(task, task);
  writeQueue = result.catch(() => {});
  return result;
}

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(PRODUCTS_FILE);
  } catch {
    await fs.writeFile(PRODUCTS_FILE, "[]", "utf-8");
  }
}

export async function readProducts() {
  await ensureFile();
  const raw = await fs.readFile(PRODUCTS_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeProducts(products) {
  await ensureFile();
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
}

export function normalizeProduct(input) {
  const price = Number(input.price);
  const quantity = Number(input.quantity);
  const brands = toStringList(input.brands ?? input.brand);
  const categories = toStringList(input.categories ?? input.category);
  const normalizedBrands = brands.length ? brands : ["غير محدد"];

  return {
    name: String(input.name || "").trim(),
    partNumber: String(input.partNumber || "").trim(),
    brands: normalizedBrands,
    categories,
    // Keep legacy string fields in sync for older UI/export code paths.
    brand: formatList(normalizedBrands),
    category: formatList(categories),
    price: Number.isFinite(price) ? price : 0,
    quantity: Number.isFinite(quantity) ? Math.max(0, Math.trunc(quantity)) : 0,
    image: input.image || "",
    description: String(input.description || "").trim()
  };
}

function withEngagement(product) {
  if (!product) return null;
  return {
    ...product,
    likes: Number.isFinite(Number(product.likes)) ? Math.max(0, Math.trunc(Number(product.likes))) : 0,
    ratings: Array.isArray(product.ratings) ? product.ratings : []
  };
}

export function getAverageRating(ratings = []) {
  if (!ratings.length) return 0;
  const sum = ratings.reduce((acc, r) => acc + Number(r.stars || 0), 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

export async function getProducts() {
  const products = await readProducts();
  return products.map(withEngagement).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function getProductById(id) {
  const products = await readProducts();
  return withEngagement(products.find((p) => p.id === id) || null);
}

export async function addProduct(data) {
  return enqueue(async () => {
    const products = await readProducts();
    const now = Date.now();
    const product = {
      id: crypto.randomUUID(),
      ...normalizeProduct(data),
      likes: 0,
      ratings: [],
      createdAt: now,
      updatedAt: now
    };
    products.push(product);
    await writeProducts(products);
    return withEngagement(product);
  });
}

export async function addProductsBulk(items) {
  return enqueue(async () => {
    const products = await readProducts();
    const now = Date.now();
    const created = items.map((item) => ({
      id: crypto.randomUUID(),
      ...normalizeProduct(item),
      likes: 0,
      ratings: [],
      createdAt: now,
      updatedAt: now
    }));
    const merged = products.concat(created);
    await writeProducts(merged);
    return created.map(withEngagement);
  });
}

export async function toggleProductLike(id, liked) {
  return enqueue(async () => {
    const products = await readProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const current = withEngagement(products[idx]);
    const likes = liked
      ? current.likes + 1
      : Math.max(0, current.likes - 1);
    const updated = { ...current, likes, updatedAt: Date.now() };
    products[idx] = updated;
    await writeProducts(products);
    return updated;
  });
}

export async function addProductRating(id, { name, stars, comment }) {
  return enqueue(async () => {
    const products = await readProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const ratingStars = Math.min(5, Math.max(1, Math.trunc(Number(stars))));
    if (!Number.isFinite(ratingStars)) return null;

    const current = withEngagement(products[idx]);
    const rating = {
      id: crypto.randomUUID(),
      name: String(name || "زائر").trim().slice(0, 40) || "زائر",
      stars: ratingStars,
      comment: String(comment || "").trim().slice(0, 500),
      createdAt: Date.now()
    };
    const updated = {
      ...current,
      ratings: [rating, ...current.ratings],
      updatedAt: Date.now()
    };
    products[idx] = updated;
    await writeProducts(products);
    return { product: updated, rating };
  });
}

export async function deleteProductRating(productId, ratingId) {
  return enqueue(async () => {
    const products = await readProducts();
    const idx = products.findIndex((p) => p.id === productId);
    if (idx === -1) return null;

    const current = withEngagement(products[idx]);
    const nextRatings = current.ratings.filter((r) => r.id !== ratingId);
    if (nextRatings.length === current.ratings.length) return null;

    const updated = {
      ...current,
      ratings: nextRatings,
      updatedAt: Date.now()
    };
    products[idx] = updated;
    await writeProducts(products);
    return updated;
  });
}

export async function updateProduct(id, data) {
  return enqueue(async () => {
    const products = await readProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const previous = withEngagement(products[idx]);
    const updated = {
      ...previous,
      ...normalizeProduct({ ...previous, ...data }),
      likes: previous.likes,
      ratings: previous.ratings,
      updatedAt: Date.now()
    };
    products[idx] = updated;
    await writeProducts(products);
    return updated;
  });
}

export async function deleteProduct(id) {
  return enqueue(async () => {
    const products = await readProducts();
    const next = products.filter((p) => p.id !== id);
    const changed = next.length !== products.length;
    if (changed) await writeProducts(next);
    return changed;
  });
}
