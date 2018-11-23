{
  class controller {
    constructor(
      $location,
      $q,
      $scope,
      $stateParams,
      $translate,

      accountUserContacts,
      Alerter,
      User,

      ACCOUNT_USER_CONTACTS_SERVICE_SERVICES,
    ) {
      this.$location = $location;
      this.$q = $q;
      this.$scope = $scope;
      this.$stateParams = $stateParams;
      this.$translate = $translate;

      this.accountUserContacts = accountUserContacts;
      this.Alerter = Alerter;
      this.User = User;

      this.ACCOUNT_USER_CONTACTS_SERVICE_SERVICES = ACCOUNT_USER_CONTACTS_SERVICE_SERVICES;
    }

    $onInit() {
      this.services = [];

      return this.fetchingInitialData();
    }

    fetchingInitialData() {
      this.isFetchingInitialData = true;

      return this.fetchingUser()
        .then(() => this.fetchingServices())
        .finally(() => {
          this.isFetchingInitialData = false;
        });
    }

    fetchingUser() {
      return this.User
        .getUser()
        .then((user) => {
          this.user = user;
        })
        .catch((error) => {
          this.Alerter.alertFromSWS(
            this.$translate.instant('account_user_contacts_services_fetchingUser_error'),
            error,
            'useraccount.alerts.dashboardContacts',
          );
        });
    }

    fetchingServices() {
      return this.accountUserContacts
        .getServices()
        .then((services) => {
          if (!_(services).isArray()) {
            throw new Error(`accountUserContactsService.fetchingServices: invalid data from the API (${services})`);
          }

          const servicesToFetchServiceInfoOf = services
            .filter(service => this.ACCOUNT_USER_CONTACTS_SERVICE_SERVICES[service.category] != null
                && this.ACCOUNT_USER_CONTACTS_SERVICE_SERVICES[service.category]
                  .allowsManagingContacts);

          const promises = servicesToFetchServiceInfoOf
            .map(service => this.accountUserContacts
              .getServiceInfos({
                path: service.path,
                serviceName: service.serviceName,
              })
              .then((serviceInfos) => {
                const categoryName = this.$translate.instant(`useraccount_contacts_service_category_${service.category}`) === `useraccount_contacts_service_category_${service.category}` ? service.category : this.$translate.instant(`useraccount_contacts_service_category_${service.category}`);

                this.services.push({
                  categoryName,
                  serviceName: service.serviceName,
                  adminContact: serviceInfos.contactAdmin,
                  technicalContact: serviceInfos.contactTech,
                  billingContact: serviceInfos.contactBilling,
                });
              }));

          return this.$q.all(promises);
        })
        .catch((error) => {
          this.Alerter.alertFromSWS(
            this.$translate.instant('account_user_contacts_services_fetchingServices_error'),
            error,
            'useraccount.alerts.dashboardContacts',
          );
        });
    }
  }

  angular
    .module('UserAccount')
    .component('accountUserContactsService', {
      controller,
      templateUrl: 'account/user/contacts/service/account-user-contacts-service.html',
    });
}
