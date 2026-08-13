import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { SellerLayout } from './layout/seller-layout/seller-layout';
import { SellerDashboard } from './features/seller/seller-dashboard/seller-dashboard';
import { SellerSidebar } from './layout/seller-layout/seller-sidebar/seller-sidebar';
import { DevRoleSwitcher } from './shared/components/dev-role-switcher/dev-role-switcher';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

describe('Seller render smoke', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerLayout, SellerDashboard, SellerSidebar, DevRoleSwitcher],
      providers: [provideRouter(routes), provideHttpClient(withInterceptors([authInterceptor]))],
    }).compileComponents();
  });

  it('renders seller dashboard', async () => {
    const fixture = TestBed.createComponent(SellerDashboard);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Dashboard Overview');
  });

  it('renders seller layout', async () => {
    const fixture = TestBed.createComponent(SellerLayout);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('RALLY.');
  });

  it('renders dev role switcher and switches role', async () => {
    const fixture = TestBed.createComponent(DevRoleSwitcher);
    await fixture.whenStable();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(3);
    const buyerButton = Array.from(buttons).find((b) => (b as HTMLButtonElement).textContent?.trim() === 'buyer');
    (buyerButton as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeRole()).toBe('buyer');
  });
});
