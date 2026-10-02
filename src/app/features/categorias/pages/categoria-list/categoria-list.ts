import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { Categoria } from '../../models/categoria.model';
import { CategoriaService } from '../../services/categoria-service';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './categoria-list.html',
  styleUrl: './categoria-list.css'
})
export class CategoriaList implements OnInit {
  private readonly servicio = inject(CategoriaService);

  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly busqueda = signal('');
  readonly eliminando = signal<number | null>(null);

  readonly categoriasFiltradas = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();

    return this.categorias().filter(categoria =>
      categoria.nombre.toLowerCase().includes(texto)
    );
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');

    this.servicio.listar().subscribe({
      next: (datos) => {
        this.categorias.set(datos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(
          err.error?.mensaje ||
          err.error?.message ||
          'No se pudieron cargar las categorías.'
        );
        this.cargando.set(false);
      }
    });
  }

  eliminar(categoria: Categoria): void {
    if (this.eliminando() !== null) {
      return;
    }

    const confirmado = window.confirm(
      `¿Eliminar la categoría "${categoria.nombre}"? ` +
      'Se borrará de la base de datos.'
    );

    if (!confirmado) {
      return;
    }

    this.eliminando.set(categoria.id);
    this.error.set('');

    this.servicio.eliminar(categoria.id).subscribe({
      next: () => {
        this.eliminando.set(null);
        this.cargar();
      },
      error: (err) => {
        this.eliminando.set(null);
        this.error.set(
          err.error?.mensaje ||
          err.error?.message ||
          'No se pudo eliminar la categoría.'
        );
      }
    });
  }
}
