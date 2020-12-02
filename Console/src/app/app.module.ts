import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HomeComponent } from './home/home.component';
import { OverviewComponent } from './overview/overview.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { NodesComponent } from './nodes/nodes.component';
import { BlocksComponent } from './blocks/blocks.component';
import { AlladminsComponent } from './alladmins/alladmins.component';
import { AllmerchantsComponent } from './allmerchants/allmerchants.component';
import { AlluserComponent } from './alluser/alluser.component';
import { MyaccountComponent } from './myaccount/myaccount.component';
import { UserprofileComponent } from './alluser/userprofile/userprofile.component';
import { ListusersComponent } from './alluser/listusers/listusers.component';
import { ListmerchantsComponent } from './allmerchants/listmerchants/listmerchants.component';
import { MerchantprofileComponent } from './allmerchants/merchantprofile/merchantprofile.component';
import { ListadminsComponent } from './alladmins/listadmins/listadmins.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    OverviewComponent,
    TransactionsComponent,
    NodesComponent,
    BlocksComponent,
    AlladminsComponent,
    AllmerchantsComponent,
    AlluserComponent,
    MyaccountComponent,
    UserprofileComponent,
    ListusersComponent,
    ListmerchantsComponent,
    MerchantprofileComponent,
    ListadminsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
