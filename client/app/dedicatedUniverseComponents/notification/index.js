import angular from 'angular';

import 'ovh-angular-user-pref';

import ducNotification from './notification.service';

const moduleName = 'ducNotification';

angular
  .module(moduleName, [
    'ovh-angular-user-pref',
  ])
  .service('DucNotification', ducNotification);

export default moduleName;
