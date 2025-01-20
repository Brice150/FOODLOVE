import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
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
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatStepperModule } from '@angular/material/stepper';
import { ToastrService } from 'ngx-toastr';
import { RecipeType } from '../core/enums/recipe-type';
import { RecipeService } from '../core/services/recipe.service';
import { Recipe } from '../core/interfaces/recipe';
import { v4 as uuidv4 } from 'uuid';
import { Router, RouterModule } from '@angular/router';

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
    RouterModule,
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
  templateUrl: './ajouter-recette.component.html',
  styleUrl: './ajouter-recette.component.css',
})
export class AjouterRecetteComponent implements OnInit {
  recipeForm!: FormGroup;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;
  RecipeType: string[] = Object.values(RecipeType).filter(
    (recipe) => recipe !== RecipeType.SELECTION
  );
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);
  imagePreview: string | null = null;
  recipeService = inject(RecipeService);
  router = inject(Router);

  ngOnInit(): void {
    this.firstFormGroup = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      type: [RecipeType.PLAT, [Validators.required]],
      duration: [30, []],
    });

    this.secondFormGroup = this.fb.group({
      ingredients: [''],
    });

    this.thirdFormGroup = this.fb.group({
      steps: [''],
    });

    this.recipeForm = this.fb.group({
      firstFormGroup: this.firstFormGroup,
      secondFormGroup: this.secondFormGroup,
      thirdFormGroup: this.thirdFormGroup,
    });
  }

  addPicture(files: File[]): void {
    for (let file of files) {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const maxDimension = 1200;
          const width = img.width;
          const height = img.height;
          let newWidth, newHeight;

          if (width > height) {
            newWidth = Math.min(width, maxDimension);
            newHeight = (height / width) * newWidth;
          } else {
            newHeight = Math.min(height, maxDimension);
            newWidth = (width / height) * newHeight;
          }

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = newWidth;
          canvas.height = newHeight;
          ctx!.drawImage(img, 0, 0, newWidth, newHeight);
          let quality = 0.7;
          let dataURL = canvas.toDataURL('image/jpeg', quality);

          this.imagePreview = dataURL;

          this.toastr.info('Image ajouté', 'Recette', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        };
      };
    }
  }

  addRecipe(): void {
    if (this.recipeForm.valid) {
      const newRecipe: Recipe = {
        id: uuidv4(),
        name: this.recipeForm.get('firstFormGroup.name')?.value,
        type: this.recipeForm.get('firstFormGroup.type')?.value,
        duration: this.recipeForm.get('firstFormGroup.duration')?.value,
        picture: this.imagePreview,
        ingredients: [],
        steps: [],
      };
      this.recipeService.addRecipe(newRecipe);
      this.router.navigate([`/recettes/${newRecipe.type}/${newRecipe.id}`]);
      this.toastr.info('Recette ajoutée', 'Recette', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom info',
      });
    }
  }
}
