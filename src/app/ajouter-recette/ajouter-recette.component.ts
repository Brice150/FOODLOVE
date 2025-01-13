import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ToastrService } from 'ngx-toastr';
import { RecipeType } from '../core/enums/recipe-type';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-ajouter-recette',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatStepperModule,
    MatSliderModule,
    MatSelectModule,
  ],
  templateUrl: './ajouter-recette.component.html',
  styleUrl: './ajouter-recette.component.css',
})
export class AjouterRecetteComponent implements OnInit {
  recipeForm!: FormGroup;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;
  RecipeType: string[] = Object.values(RecipeType);
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);

  ngOnInit(): void {
    this.recipeForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      type: [RecipeType.PLAT, [Validators.required]],
      duration: [
        1,
        [Validators.required, Validators.min(1), Validators.max(999)],
      ],
    });

    this.firstFormGroup = this.fb.group({
      nickname: [
        '',
        [
          Validators.required,
          Validators.maxLength(30),
          Validators.minLength(2),
        ],
      ],
      distanceSearch: [100, [Validators.required]],
    });

    this.secondFormGroup = this.fb.group({
      gender: ['', [Validators.required]],
    });

    this.thirdFormGroup = this.fb.group({
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(30)],
      ],
    });

    this.recipeForm = this.fb.group({
      firstFormGroup: this.firstFormGroup,
      secondFormGroup: this.secondFormGroup,
      thirdFormGroup: this.thirdFormGroup,
    });
  }

  addRecipe(): void {}
}
