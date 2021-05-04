import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { IonInfiniteScroll } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';
import { Storage } from '@ionic/storage';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ModalPage } from './ui/modal/modal.page';
import { HeroService } from './services/hero.service';
import { HeroCategory } from './utils/heroCategory.enum'
import { title } from 'process';

//const { network } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public actionSheetController: ActionSheetController,
    public modalController: ModalController,
    public heroService: HeroService,
    public toastController: ToastController,
    public alertController: AlertController,
    public storage: Storage,
    public network: Network
  ) {
      this.initializeApp();
      this.network.onDisconnect().subscribe(() => {
        this.storage.set('heroes', this.heroes)
      });

      this.network.onConnect().subscribe(() => {
        this.list();
        this.syncOfflineData();
      });
  }

  response:any = [];
  heroes: any = [];
  heroesOffline: any = []
  count: number = 0;
  heroCategory = HeroCategory;
  // networkListener: PluginListenerHandle;
  //networkStatus: NetworkStatus;

  @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;
    
  async ngOnInit() {
      if (this.network.type !== 'NONE') {
        this.list();
        this.syncOfflineData();
      } else {
        this.storage.get('heroes')
        .then((heroes) => { this.heroes = heroes; });
      }
  }

  a() {
    console.log('chamou')
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
    .subscribe(
      response => {
        this.response = response;
        this.response = this.response.slice().reverse();
        this.incrementHeroes();
      },
      error => this.presentToast(`Houve um erro ao listar os heróis: ${error.message}`)
    );
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

  delete(id) {
    if (this.network.type !== 'NONE') {
      this.heroService.delete(id)
      .subscribe(
        () => {
        this.presentToast('Heroi deletado!');
        this.list();
        },
        error => this.presentToast(`Houve um erro ao deletar o herói: ${error.message}`)
      )
    } else {
      this.presentToast('Você precisa de conexão para deletar');
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

  async syncOfflineData() {
    let editedHeroes = this.heroesOffline.filter(hero => hero.Id.toString().length < 9)
    let newHeroes = this.heroesOffline.filter(hero => hero.Id.toString().length >= 9)
    if (await this.SyncEditOffline(editedHeroes) === false && await this.syncNewOffline(newHeroes) === false)
      this.presentToast('Os dados foram sincronizados');
  }

  SyncEditOffline(heroes): boolean {
    let error = false;
    for (let editedHero of heroes) {
      this.heroService.edit(editedHero)
      .subscribe(
        () => {},
        error => {
          this.presentToast(`Houve um erro ao sincronizar o herói ${editedHero.Name}: ${error.message}`);
          error = true;
        }
      )
    }
    return error;
  }

  syncNewOffline(heroes): boolean {
    let error = false;
    for (let newHero of heroes) {
      delete newHero.Id;
      this.heroService.add(newHero)
      .subscribe(
        () => {},
        error => this.presentToast(`Houve um erro ao sincronizar o herói ${newHero.Name}: ${error.message}`)
      )
    }
    return error;
  }
}
