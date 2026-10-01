import { Injectable, computed, signal } from '@angular/core';

export interface CartLine {
  id: string;
  itemType: 'product' | 'variant' | 'service';
  productId?: string;
  variantId?: string;
  serviceId?: string;
  divisionId?: string;
  divisionName: string;
  name: string;
  variantLabel?: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  slugPath: string;
}

const STORAGE_KEY = 'nexalab_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly itemsSignal = signal<CartLine[]>(this.read());

  readonly items = this.itemsSignal.asReadonly();
  readonly count = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0),
  );
  readonly subtotal = computed(() =>
    this.itemsSignal().reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    ),
  );

  add(line: Omit<CartLine, 'id' | 'quantity'> & { quantity?: number }) {
    const quantity = line.quantity ?? 1;
    const key = this.lineKey(line);
    const current = [...this.itemsSignal()];
    const existing = current.find((item) => this.lineKey(item) === key);

    if (existing) {
      existing.quantity += quantity;
      this.persist(current);
      return;
    }

    current.push({
      ...line,
      id: crypto.randomUUID(),
      quantity,
    });
    this.persist(current);
  }

  updateQuantity(id: string, quantity: number) {
    const current = this.itemsSignal()
      .map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item,
      )
      .filter((item) => item.quantity > 0);
    this.persist(current);
  }

  remove(id: string) {
    this.persist(this.itemsSignal().filter((item) => item.id !== id));
  }

  clear() {
    this.persist([]);
  }

  private lineKey(line: {
    itemType: string;
    productId?: string;
    variantId?: string;
    serviceId?: string;
  }) {
    return `${line.itemType}:${line.variantId || line.productId || line.serviceId}`;
  }

  private persist(items: CartLine[]) {
    this.itemsSignal.set(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  private read(): CartLine[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartLine[]) : [];
    } catch {
      return [];
    }
  }
}
