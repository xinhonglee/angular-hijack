import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { CoreComponent } from './core/core/core.component';
import { coreRoutes } from './core/core.routing';

const appRoutes: Routes = [
    {
        path: '',
        component: CoreComponent,
        children: coreRoutes,
    },
    // {path: '', redirectTo: 'core', pathMatch: 'full'}
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes, { useHash: false })],
    exports: [RouterModule]
})

export class AppRoutingModule {

}
