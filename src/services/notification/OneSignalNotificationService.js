
import { oneSignalConfig } from '../../constants/defaultValues';

var OneSignal = window.OneSignal;
var userData = JSON.parse(localStorage.getItem('user'));
export class OneSignalNotificationService {
  oneSignalUserId;

  isOneSignalInitialized = false;

  init() {
    OneSignal.push(() => {
      OneSignal.init({
        appId: oneSignalConfig.appID,
        autoRegister: false,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: false,
        },
        welcomeNotification: {
          disable: true,
        },
        persistNotification: false,
        notificationClickHandlerMatch: 'origin',
        notificationClickHandlerAction: 'focus',
      });
      OneSignal.on('popoverShown', function() {
        console.log('Slide Prompt Shown');
      });
    });

    // this._globalEventService.listen('CORE:LOGOUT:SUCCESS').subscribe(() => {
    //   this.unsubscribe();
    // });

    this.isOneSignalInitialized = true;
  }

  deleteTag(tag) {
    OneSignal.push(() => {
      OneSignal.deleteTag(tag);
    });
  }

  deleteTags(tags) {
    OneSignal.push(() => {
      OneSignal.deleteTags(tags);
    });
  }

  getUserID() {
    OneSignal.push(() => {
      OneSignal.getUserId().then(userId => {
        this.oneSignalUserId = userId;
      });
    });
  }

  eventListenerHandler = (event) => {
    const data = (event.data || {});
    const command = data.command;
    const payload = data.payload;
    const payloadData = payload.data;

    if (payloadData) {
      for (const k in payloadData) {
        const v = payloadData[k];
        if (typeof v === 'string' && (v.startsWith('{') && v.endsWith('}')) || (v.startsWith('[') && v.endsWith(']'))) {
          try {
            // try to normalize the data as javascript object
            payloadData[k] = JSON.parse(v);
          } catch (e) {
            // ignore
          }
        }
      }
    }
    // console.log(command)
    switch (command) {
      case 'notification.displayed':
        this.onNotificationReceived(payload);
        break;
      case 'notification.clicked':
        this.onNotificationClicked(payload);
        break;
    }
  };

  startListenForEvents() {
    if (navigator.serviceWorker && navigator.serviceWorker.addEventListener) {
      navigator.serviceWorker.addEventListener('message', this.eventListenerHandler);
    }
  }

  stopListenForEvents() {
    if (navigator.serviceWorker && navigator.serviceWorker.removeEventListener) {
      navigator.serviceWorker.removeEventListener('message', this.eventListenerHandler);
    }
  }

  onNotificationClicked(event) {
    this._globalEventService.emit('PUSH_NOTIFICATION_CLICKED', event);
  }

  onNotificationReceived(event) {
    // console.log(event)
    return event;
    // this._globalEventService.emit('PUSH_NOTIFICATION_RECEIVED', event);
  }

  removeExternalUserId() {
    OneSignal.push(() => {
      OneSignal.removeExternalUserId();
    });
  }

  sendTag(key, value) {
    OneSignal.push(() => {
      OneSignal.sendTag(key, value);
    });
  }

  sendTags(tags) {
    OneSignal.push(() => {
      OneSignal.sendTags(tags);
    });
  }

  setExternalUserId(userId) {
    OneSignal.push(() => {
      OneSignal.setExternalUserId(userId);
    });
  }

  subscribe() {
    const user = userData;
    if (!this.isOneSignalInitialized) {
      this.init();
    } else {
      return;
    }

    OneSignal.push(() => {
      OneSignal.showNativePrompt();

      OneSignal.setSubscription(true);
    });

    this.getUserID();

    this.setExternalUserId(user.user_id);
    // console.log(user)
    this.sendTags({
      userId: user.user_id,
    });

    this.startListenForEvents();
  }

  unsubscribe() {
    OneSignal.push(() => {
      OneSignal.setSubscription(false);
    });

    this.removeExternalUserId();
    this.deleteTags(['userId']);
    this.stopListenForEvents();
  }
}
