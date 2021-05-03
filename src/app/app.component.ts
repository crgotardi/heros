import { Component, ViewChild } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { IonInfiniteScroll } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
// import { Network } from '@ionic-native/network/ngx';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ModalPage } from './ui/modal/modal.page';
import { HeroService } from './services/hero.service';
import { HeroCategory } from './utils/heroCategory.enum'
import { title } from 'process';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public actionSheetController: ActionSheetController,
    public modalController: ModalController,
    public heroService: HeroService,
    public toastController: ToastController,
    public alertController: AlertController,
    //private network: Network
  ) {
      this.initializeApp();
  }

  response:any = [];
  heroes: any = [];
  count: number = 0;
  heroCategory = HeroCategory;

  @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;
    
  ngOnInit() {
    this.list()
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  async presentActionSheet(hero) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Ações',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Editar',
        icon: 'brush',
        handler: () => {
          this.presentModal(hero, 'Edite seu heroi', 'Salvar alterações')
        }
      }, {
        text: 'Excluir',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.presentAlertConfirm(hero)
        }
      }]
    });
    await actionSheet.present();

    const { role } = await actionSheet.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  async presentModal(hero, title, label) {
    const modal = await this.modalController.create({
      component: ModalPage,
      cssClass: 'my-custom-class',
      mode: 'ios',
      backdropDismiss: true,
      showBackdrop: true,
      componentProps: { 
        hero: hero,
        title: title,
        label: label
      }
    });
    return await modal.present();
  }

  list() {
    this.heroService.list()
    .subscribe(response => {
      this.response = response;
      this.response = this.response.slice().reverse();
      this.incrementHeroes();
    });
  }

  incrementHeroes() {
    for (let i = 0; i < 10; i++) { 
      this.heroes.push(this.response[this.count]);
      this.count++ 
    }
  }

  loadData(event) {
    this.incrementHeroes();
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  edit(hero) {
    this.heroService.edit(hero)
    .subscribe(() => {
      this.presentToast('heroi editado!');
      this.dismiss();
    })
  }

  delete(id) {
    this.heroService.delete(id)
    .subscribe(() => {
      this.presentToast('Heroi deletado!');
      this.list();
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

  async presentAlertConfirm(hero) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      message: 'Você vai dispensar este herói?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('cancelado');
          }
        }, 
        {
          text: 'Sim',
          handler: () => {
            this.delete(hero.Id)
          }
        }
      ]
    });

    await alert.present();
  }

  /*disconnectSubscription = this.network.onDisconnect().subscribe(() => {
    console.log('network was disconnected :-(');
  });

  connectSubscription = this.network.onConnect().subscribe(() => {
    console.log('network connected!');

    setTimeout(() => {
      if (this.network.type === 'wifi') {
        console.log('we got a wifi connection, woohoo!');
      }
    }, 3000);
  });*/
}
