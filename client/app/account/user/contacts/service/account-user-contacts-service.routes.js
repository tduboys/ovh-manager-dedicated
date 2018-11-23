angular
  .module('UserAccount')
  .config(($stateProvider) => {
    $stateProvider.state(
      'app.account.useraccount.contacts.services',
      {
        url: '/services?serviceName&category',
        component: 'accountUserContactsService',
      },
    );
  });
