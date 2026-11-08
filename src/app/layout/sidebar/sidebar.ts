import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { MENU } from '../../core/config/menu';
import { AuthService } from '../../core/auth/auth-service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  private readonly auth = inject(AuthService);

  readonly menu = computed(() =>
    MENU.filter(opcion =>
      !opcion.permiso || this.auth.tienePermiso(opcion.permiso)
    )
  );
}
