import {Injectable} from '@angular/core';
import {Notyf} from 'notyf';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private notyf = new Notyf();

  success(message: string) {
    this.notyf.success(message);
  }

  info(message: string) {
    this.notyf.open({type: 'info', message});
  }

  warning(message: string) {
    this.notyf.open({type: 'warning', message});
  }

  error(message: string) {
    this.notyf.error(message);
  }
}
