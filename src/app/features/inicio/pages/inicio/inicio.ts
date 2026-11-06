import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth-service';
import { MasVendidos } from '../../mas-vendidos';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [MasVendidos],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {
  protected readonly auth = inject(AuthService);
}
