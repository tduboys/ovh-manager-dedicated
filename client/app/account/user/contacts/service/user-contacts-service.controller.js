angular
  .module('UserAccount')
  .controller('userContactsServiceCtrl', class userContactsServiceCtrl {
    constructor(
      $location,
      $q,
      $scope,
      $stateParams,
      $translate,

      Alerter,
      Contacts,
    ) {
      this.$location = $location;
      this.$q = $q;
      this.$scope = $scope;
      this.$stateParams = $stateParams;
      this.$translate = $translate;

      this.Alerter = Alerter;
      this.Contacts = Contacts;
    }

    $onInit() {
      this.allServicesIds = [];
      this.servicesTemp = {};
      this.servicesToDelete = [];

      this.loaders = {
        services: false,
        serviceInfos: false,
        changeContact: false,
      };

      this.servicesIds = [];
      this.allServices = [];
      this.services = [];
      this.categories = [];
      this.editLine = -1;


      this.$scope.$on('useraccount.contact.changed', this.init);
    }

    getUser() {
      return this.User
        .getUser()
        .then((user) => {
          this.user = user;
        })
        .catch((error) => {
          this.Alerter.alertFromSWS(this.$translate.instant('user_account_contacts_error'), error, 'useraccount.alerts.dashboardContacts');
        });
    }

    init() {
      return this.$q
        .all([
          this.getUser(),
          this.getServices(true),
        ])
        .then(() => {
          if (this.$stateParams.serviceName) {
            this.serviceFilter = this.allServices
              .find(service => service.serviceName === this.$stateParams.serviceName);
            this.categoryFilter = this.$stateParams.category;
            this.updateFilters();
          }
        });
    }

    getServices(forceRefresh) {
      this.loaders.services = true;
      this.categoryFilter = null;
      this.serviceFilter = null;

      return this.Contacts
        .getServices(forceRefresh)
        .then((services) => {
          const servicesFiltered = services.filter(service => this.Contacts
            .availableService.indexOf(service.category) !== -1
                && this.Contacts.noAvailableService.indexOf(service.category) === -1);

          servicesFiltered.forEach((s) => {
            const key = [s.category.replace(/\s/, '-'), s.serviceName].join('::');
            this.servicesTemp[key] = s;
            if (this.categories.indexOf(s.category) === -1) {
              this.categories.push(s.category);
            }
          });
          this.servicesIds = Object.keys(this.servicesTemp);
          this.allServices = servicesFiltered;
          this.allServicesIds = angular.copy(this.servicesIds);
        })
        .catch((err) => {
          this.Alerter.alertFromSWS(this.$translate.instant('user_account_contacts_error'), err, 'useraccount.alerts.dashboardContacts');
        })
        .finally(() => {
          this.loaders.services = false;
        });
    }

    transformItem(id) {
      this.loaders.services = true;

      return this.Contacts
        .getServiceInfos({
          path: this.servicesTemp[id].path,
          serviceName: this.servicesTemp[id].serviceName,
        })
        .then((serviceInfos) => {
          const nicMatch = this.Contacts.excludeNics
            .filter(nic => nic.test(serviceInfos.contactTech)).length === 0;

          if (serviceInfos.status === 'expired' || !nicMatch) {
            this.servicesToDelete.push(id);
            return null;
          }

          this.servicesTemp[id].contactTech = serviceInfos.contactTech;
          this.servicesTemp[id].contactAdmin = serviceInfos.contactAdmin;
          this.servicesTemp[id].contactBilling = serviceInfos.contactBilling;

          return this.servicesTemp[id];
        });
    }

    onTransformItemDone() {
      this.loaders.services = false;

      if (this.servicesToDelete.length > 0) {
        this.servicesIds = this.servicesIds.filter(s => this.servicesToDelete.indexOf(s) === -1);
      }
    }

    updateFilters() {
      this.$location.search('serviceName', _.get(this.serviceFilter, 'serviceName', null));
      this.$location.search('category', _.get(this, 'categoryFilter', null));

      this.servicesthis.allServicesIds
        .filter(id => (this.categoryFilter ? id.indexOf(this.categoryFilter) === 0 : true))
        .filter(id => (this.serviceFilter
          ? id.indexOf(this.serviceFilter.serviceName) !== -1
          : true));
    }

    openEditLine(index, service) {
      this.editLine = index;
      _.set(service, 'newContactAdmin', service.contactAdmin);
      _.set(service, 'newContactTech', service.contactTech);
      _.set(service, 'newContactBilling', service.contactBilling);
    }

    changeContact(service) {
      this.loaders.changeContact = true;

      this.Contacts.changeContact({
        service,
        contactAdmin: service.newContactAdmin,
        contactBilling: service.newContactBilling,
        contactTech: service.newContactTech,
      })
        .then(
          () => {
            this.editLine = -1;
            this.Alerter.success(this.$translate.instant('user_account_change_contacts_success'), 'useraccount.alerts.dashboardContacts');
          },
          (err) => {
            this.Alerter.alertFromSWS(this.$translate.instant('user_account_change_contacts_error'), err, 'useraccount.alerts.dashboardContacts');
          },
        )
        .finally(() => {
          this.loaders.changeContact = false;
        });
    }
  });
