import { Component, OnInit } from '@angular/core';
import { HeroService } from '../../services/hero.service';
import { IHero } from '../../interface/hero.interface';
import { HeroCategory } from '../../utils/heroCategory.enum'
import { ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'modal-page',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
})
export class ModalPage implements OnInit {

  heroCategory = HeroCategory;
  category;
  keys;
  hero = {} as IHero
  title = ''
  label = ''

  constructor(public heroService: HeroService,
              public toastController: ToastController,
              private modalController: ModalController) { }


  ngOnInit() {
    console.log(this.heroCategory)
    let index = Object.keys(this.heroCategory).filter(k => !isNaN(Number(k)));
    this.keys = index.map(Number);
  }

  add() {
    if (this.hero.Id)
      this.edit()
    else
      if(!this.hero.Name) {
        this.presentToast('O nome é obritatório!')
        return false;
      }
      if(!this.hero.CategoryId) {
        this.presentToast('A categoria é obrigatória!')
        return false;
      }
      this.heroService.add(this.hero)
      .subscribe(() => {
        this.presentToast('herói recrutado!');
        this.dismiss();
      })
  }

  edit() {
    this.heroService.edit(this.hero)
    .subscribe(() => {
      this.presentToast('herói editado!');
      this.dismiss();
    })
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  dismiss() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }
}
