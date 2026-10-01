import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, CurrencyPipe, FormsModule],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
})
export class CartPage {
  readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);
  private readonly title = inject(Title);

  constructor() {
    this.title.setTitle('NEXALAB | Carrito');
  }

  updateQty(id: string, quantity: number) {
    this.cart.updateQuantity(id, Number(quantity));
  }

  remove(id: string) {
    this.cart.remove(id);
    this.toast.info('Producto eliminado del carrito.');
  }
}
