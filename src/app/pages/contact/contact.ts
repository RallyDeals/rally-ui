import { Component } from '@angular/core';
import { ContactHeader } from './contact-header/contact-header';
import { ContactInfo } from './contact-info/contact-info';
import { ContactForm } from './contact-form/contact-form';
import { ContactMap } from './contact-map/contact-map';

@Component({
  selector: 'app-contact',
  imports: [ContactHeader, ContactInfo, ContactForm, ContactMap],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {}
