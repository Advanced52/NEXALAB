import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AdminApiService } from '../../core/services/admin-api.service';
import { ToastService } from '../../core/services/toast.service';

type AspectPreset = '1:1' | '4:3' | '16:9' | '3:1';

@Component({
  selector: 'app-image-upload',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUpload),
      multi: true,
    },
  ],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.scss',
})
export class ImageUpload implements ControlValueAccessor {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);

  readonly label = input('Imagen');
  readonly hint = input(
    'Sube una imagen y elige el encuadre (como portada de Facebook)',
  );
  readonly defaultAspect = input<AspectPreset>('1:1');
  /** Preferir zona superior al abrir (útil para banners con personas) */
  readonly preferTop = input(false);

  @ViewChild('frameEl') frameEl?: ElementRef<HTMLDivElement>;
  @ViewChild('sourceImg') sourceImgRef?: ElementRef<HTMLImageElement>;

  value = signal('');
  uploading = signal(false);
  disabled = signal(false);
  editorOpen = signal(false);

  sourceUrl = signal<string | null>(null);
  sourceFileName = signal('image.jpg');
  aspect = signal<AspectPreset>('1:1');
  zoom = signal(1);
  /** Desplazamiento desde el centro del marco azul */
  offsetX = signal(0);
  offsetY = signal(0);
  naturalWidth = signal(0);
  naturalHeight = signal(0);
  baseWidth = signal(0);
  baseHeight = signal(0);

  private dragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private originOffsetX = 0;
  private originOffsetY = 0;

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onFileSelected(event: Event) {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    inputEl.value = '';
    if (!file || this.disabled()) return;

    if (!file.type.startsWith('image/')) {
      this.toast.error('Selecciona un archivo de imagen');
      return;
    }

    if (this.sourceUrl()) {
      URL.revokeObjectURL(this.sourceUrl()!);
    }

    this.sourceUrl.set(URL.createObjectURL(file));
    this.sourceFileName.set(file.name || 'image.jpg');
    this.aspect.set(this.defaultAspect());
    this.zoom.set(1);
    this.offsetX.set(0);
    this.offsetY.set(0);
    this.editorOpen.set(true);
  }

  onImageLoaded(event: Event) {
    const img = event.target as HTMLImageElement;
    this.naturalWidth.set(img.naturalWidth);
    this.naturalHeight.set(img.naturalHeight);
    // Esperar layout del marco azul
    requestAnimationFrame(() => {
      this.recomputeBaseSize(true);
    });
  }

  setAspect(preset: AspectPreset) {
    this.aspect.set(preset);
    this.zoom.set(1);
    requestAnimationFrame(() => this.recomputeBaseSize(true));
  }

  onZoomChange(event: Event) {
    this.zoom.set(Number((event.target as HTMLInputElement).value));
    this.clampOffsets();
  }

  startDrag(event: PointerEvent) {
    if (!this.editorOpen()) return;
    event.preventDefault();
    this.dragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.originOffsetX = this.offsetX();
    this.originOffsetY = this.offsetY();
  }

  @HostListener('document:pointermove', ['$event'])
  onPointerMove(event: PointerEvent) {
    if (!this.dragging) return;
    this.offsetX.set(this.originOffsetX + (event.clientX - this.dragStartX));
    this.offsetY.set(this.originOffsetY + (event.clientY - this.dragStartY));
    this.clampOffsets();
  }

  @HostListener('document:pointerup')
  onPointerUp() {
    this.dragging = false;
  }

  cancelEditor() {
    if (this.sourceUrl()) {
      URL.revokeObjectURL(this.sourceUrl()!);
    }
    this.sourceUrl.set(null);
    this.editorOpen.set(false);
  }

  async useFullImage() {
    const url = this.sourceUrl();
    if (!url) return;
    try {
      const blob = await fetch(url).then((r) => r.blob());
      const file = new File([blob], this.sourceFileName(), {
        type: blob.type || 'image/jpeg',
      });
      await this.uploadFile(file);
      this.cancelEditor();
    } catch {
      this.toast.error('No se pudo preparar la imagen completa');
    }
  }

  async applyCrop() {
    const img = this.sourceImgRef?.nativeElement;
    const frame = this.frameEl?.nativeElement;
    if (!img || !frame || !this.sourceUrl()) return;

    const geometry = this.getGeometry(frame.clientWidth, frame.clientHeight);
    if (!geometry) return;

    const { sx, sy, sw, sh } = geometry;
    const outW = Math.min(1800, Math.max(1, Math.round(sw)));
    const outH = Math.max(1, Math.round((outW * sh) / sw));

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.toast.error('No se pudo procesar el recorte');
      return;
    }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, outW, outH);
    ctx.drawImage(
      img,
      Math.max(0, sx),
      Math.max(0, sy),
      Math.min(img.naturalWidth - Math.max(0, sx), sw),
      Math.min(img.naturalHeight - Math.max(0, sy), sh),
      0,
      0,
      outW,
      outH,
    );

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.92),
    );
    if (!blob) {
      this.toast.error('No se pudo generar la imagen recortada');
      return;
    }

    const baseName = this.sourceFileName().replace(/\.[^.]+$/, '');
    await this.uploadFile(
      new File([blob], `${baseName}-crop.jpg`, { type: 'image/jpeg' }),
    );
    this.cancelEditor();
  }

  onUrlInput(event: Event) {
    const url = (event.target as HTMLInputElement).value;
    this.value.set(url);
    this.onChange(url);
    this.onTouched();
  }

  clear() {
    this.value.set('');
    this.onChange('');
    this.onTouched();
  }

  /** Posición absoluta de la imagen dentro del marco azul */
  imageStyle() {
    const frame = this.frameEl?.nativeElement;
    const scale = this.zoom();
    const w = this.baseWidth() * scale;
    const h = this.baseHeight() * scale;
    const frameW = frame?.clientWidth || w;
    const frameH = frame?.clientHeight || h;

    const left = (frameW - w) / 2 + this.offsetX();
    const top = (frameH - h) / 2 + this.offsetY();

    return {
      width: `${w}px`,
      height: `${h}px`,
      left: `${left}px`,
      top: `${top}px`,
    };
  }

  frameAspect(): string {
    switch (this.aspect()) {
      case '4:3':
        return '4 / 3';
      case '16:9':
        return '16 / 9';
      case '3:1':
        return '3 / 1';
      default:
        return '1 / 1';
    }
  }

  private getGeometry(frameW: number, frameH: number) {
    const nw = this.naturalWidth();
    const nh = this.naturalHeight();
    if (!nw || !nh) return null;

    const scale = this.zoom();
    const displayedW = this.baseWidth() * scale;
    const displayedH = this.baseHeight() * scale;
    const imageLeft = (frameW - displayedW) / 2 + this.offsetX();
    const imageTop = (frameH - displayedH) / 2 + this.offsetY();

    return {
      sx: (-imageLeft / displayedW) * nw,
      sy: (-imageTop / displayedH) * nh,
      sw: (frameW / displayedW) * nw,
      sh: (frameH / displayedH) * nh,
    };
  }

  private async uploadFile(file: File) {
    this.uploading.set(true);
    return new Promise<void>((resolve, reject) => {
      this.api.uploadImage(file).subscribe({
        next: (res) => {
          this.value.set(res.url);
          this.onChange(res.url);
          this.onTouched();
          this.uploading.set(false);
          this.toast.success('Imagen cargada');
          resolve();
        },
        error: (err) => {
          this.uploading.set(false);
          this.toast.error(err?.error?.message || 'No se pudo subir la imagen');
          reject(err);
        },
      });
    });
  }

  private recomputeBaseSize(resetOffset = false) {
    const frame = this.frameEl?.nativeElement;
    const nw = this.naturalWidth();
    const nh = this.naturalHeight();
    if (!frame || !nw || !nh) return;

    const frameW = frame.clientWidth;
    const frameH = frame.clientHeight;
    if (frameW < 2 || frameH < 2) return;

    const imageRatio = nw / nh;
    const frameRatio = frameW / frameH;

    // Cubrir el marco azul (cover), como Facebook
    if (imageRatio > frameRatio) {
      const height = frameH;
      this.baseHeight.set(height);
      this.baseWidth.set(height * imageRatio);
    } else {
      const width = frameW;
      this.baseWidth.set(width);
      this.baseHeight.set(width / imageRatio);
    }

    if (resetOffset) {
      this.offsetX.set(0);
      // Banners: mostrar arriba (caras). Productos: centro.
      const preferTop =
        this.preferTop() ||
        this.aspect() === '16:9' ||
        this.aspect() === '3:1';
      if (preferTop) {
        const scale = this.zoom();
        const displayedH = this.baseHeight() * scale;
        const maxY = Math.max(0, (displayedH - frameH) / 2);
        this.offsetY.set(maxY);
      } else {
        this.offsetY.set(0);
      }
    }

    this.clampOffsets();
  }

  private clampOffsets() {
    const frame = this.frameEl?.nativeElement;
    if (!frame) return;

    const scale = this.zoom();
    const displayedW = this.baseWidth() * scale;
    const displayedH = this.baseHeight() * scale;
    const maxX = Math.max(0, (displayedW - frame.clientWidth) / 2);
    const maxY = Math.max(0, (displayedH - frame.clientHeight) / 2);

    this.offsetX.set(Math.min(maxX, Math.max(-maxX, this.offsetX())));
    this.offsetY.set(Math.min(maxY, Math.max(-maxY, this.offsetY())));
  }
}
