import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { GoogleMapsModule} from '@angular/google-maps'
import {environment} from '../environment'; // Standalone-Komponente

@NgModule({
  declarations: [], // keine klassischen Komponenten nötig
  imports: [
    BrowserModule,
    AppComponent // Standalone-Komponenten können direkt importiert werden
  ],
  providers: [{
    provide: 'googleMapsApiKey',
    useValue: environment.googleMapsApiKey
  }],
})
export class AppModule {}
