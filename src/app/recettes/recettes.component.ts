import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RecetteComponent } from './recette/recette.component';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MenuComponent } from './menu/menu.component';
import { RecipeType } from '../core/enums/recipe-type';

@Component({
  selector: 'app-recettes',
  imports: [CommonModule, RecetteComponent, MenuComponent],
  templateUrl: './recettes.component.html',
  styleUrl: './recettes.component.css',
})
export class RecettesComponent implements OnInit, OnDestroy {
  type: string = '';
  route = inject(ActivatedRoute);
  destroyed$ = new Subject<void>();
  RecipeType = RecipeType;

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroyed$)).subscribe((params) => {
      this.type = params['type'];
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
