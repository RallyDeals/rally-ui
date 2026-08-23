import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputOtpModule } from 'primeng/inputotp';


@Component({
  selector: 'app-otp-input',
  imports: [FormsModule, InputOtpModule],
  templateUrl: './otp-input.html',
  styleUrl: './otp-input.css',
})
export class OtpInput {
  readonly length = input<number>(6);
  readonly disabled = input<boolean>(false);
  readonly value = model<string>('');
  readonly completed = output<string>();

  onValueChange(value: string): void {
    this.value.set(value ?? '');
    if (value && value.length === this.length()) {
      this.completed.emit(value);
    }
  }
}
