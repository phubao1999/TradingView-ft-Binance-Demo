import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TvChartComponent } from './components/tv-chart/tv-chart.component';
import { HttpService } from './services/http/http.service';

@NgModule({
  declarations: [AppComponent, TvChartComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [HttpClientModule, HttpService],
  bootstrap: [AppComponent],
})
export class AppModule {}
