import { Component, OnInit } from '@angular/core';
import { HeroService } from '../../services/hero.service';
import { IHero } from '../../interface/hero.interface';
import { HeroCategory } from '../../utils/heroCategory.enum'
import { ToastController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';
import { Storage } from '@ionic/storage';

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
  heroesOffiline:any = []
  title = ''
  label = ''

  constructor(public heroService: HeroService,
              public toastController: ToastController,
              private modalController: ModalController,
              public storage: Storage,
              public network: Network) {
                this.network.onDisconnect().subscribe(() => {
                  
                });

                this.network.onConnect().subscribe(() => {

                });
              }


  async ngOnInit() {
    let index = Object.keys(this.heroCategory).filter(k => !isNaN(Number(k)));
    this.keys = index.map(Number);
    this.storage.get('heroesOffline').then((heroes) => this.heroesOffiline = heroes || []);
  }

  add() {
    if(!this.hero.Name) {
      this.presentToast('O nome é obritatório!')
      return false;
    }
    if(!this.hero.CategoryId) {
      this.presentToast('A categoria é obrigatória!')
      return false;
    }
    if (this.network.type !== 'NONE')
      if (this.hero.Id)
        this.edit()
      this.heroService.add(this.hero)
      .subscribe(
        () => {
          this.presentToast('herói recrutado!');
          this.dismiss();
        },
        error => this.presentToast(`Houve um erro ao recrutar o herói: ${error.message}`)
      )
    if (this.network.type === 'NONE') {
      if (this.hero.Id)
        this.edit()
      this.hero.Id = Math.floor(100000000 + Math.random() * 900000000)
      this.heroesOffiline.unshift(this.hero);
      this.storage.set('heroesOffline', this.heroesOffiline);
      this.presentToast('herói recrutado em modo off-line');
      this.dismiss();
    }
  }

  edit() {
    if (this.network.type !== 'NONE')
      this.heroService.edit(this.hero)
      .subscribe(
        () => {
          this.presentToast('herói editado!');
          this.dismiss();
        },
        error => this.presentToast(`Houve um erro ao editar o herói: ${error.message}`)
      )
    else {
      this.heroesOffiline[this.heroesOffiline.indexOf(this.hero.Id)] = this.hero
      this.storage.set('heroesOffline', this.heroesOffiline);
      this.presentToast('herói editado em modo offline');
      this.dismiss();
    }
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
