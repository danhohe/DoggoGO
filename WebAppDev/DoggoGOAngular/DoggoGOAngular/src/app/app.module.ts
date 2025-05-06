import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component'; // Standalone-Komponente

@NgModule({
  declarations: [], // keine klassischen Komponenten nötig
  imports: [
    BrowserModule,
    AppComponent // Standalone-Komponenten können direkt importiert werden
  ],
})
export class AppModule {}
