angular.module('App').controller('DedicatedCloudSubDatacenterVeeamBackupEnableAgoraCtrl', class {
  constructor($q, $state, $stateParams, $translate, $window,
    Alerter, DedicatedCloud, OvhHttp, User) {
    this.$q = $q;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.$window = $window;
    this.Alerter = Alerter;
    this.DedicatedCloud = DedicatedCloud;
    this.OvhHttp = OvhHttp;
    this.User = User;

    this.loading = {
      init: false,
    };

    this.model = {
      version: 'classic',
    };
  }

  closeModal() {
    this.$state.go('^');
  }

  onBackupEnableFormSubmit() {
    if (!this.hosts || !this.hosts.length || !this.offer) {
      return this.closeModal();
    }

    const productToOrder = {
      productId: 'privateCloud',
      serviceName: this.$stateParams.productId,
      planCode: this.offer.planCode,
      duration: 'P1M',
      pricingMode: 'pcc-servicepack-nsx',
      quantity: 1,
      configuration: [{
        label: 'datacenter_id',
        value: this.datacenter.datacenterId,
      }, {
        label: 'offer_type',
        value: this.model.version,
      }],
    };

    return this.User.getUrlOf('express_order')
      .then((url) => {
        this.$window.open(`${url}review?products=${JSURL.stringify([productToOrder])}`, '_blank');
      })
      .catch((error) => {
        this.Alerter.error([this.$translate.instant('dedicatedCloud_tab_veeam_enable_fail'), _.get(error, 'data.message')].join(' '));
      })
      .finally(() => this.closeModal());
  }

  getBackupOffer() {
    return this.OvhHttp.get('/order/cartServiceOption/privateCloud/{serviceName}', {
      rootPath: 'apiv6',
      urlParams: {
        serviceName: this.$stateParams.productId,
      },
    }).then(offers => _.find(offers, { family: 'backup' }));
  }

  $onInit() {
    this.loading.init = true;

    return this.$q.all({
      datacenter: this.DedicatedCloud
        .getDatacenterInfoProxy(this.$stateParams.productId, this.$stateParams.datacenterId),
      hosts: this.DedicatedCloud
        .getHostsLexi(this.$stateParams.productId, this.$stateParams.datacenterId),
      offer: this.getBackupOffer(),
      veamBackupUrl: this.User.getUrlOf('veeamBackup'),
    }).then(({
      datacenter, hosts, offer, veamBackupUrl,
    }) => {
      this.datacenter = datacenter;
      this.hosts = hosts;
      this.offer = offer;
      this.veamBackupUrl = veamBackupUrl;
    }).catch((error) => {
      this.Alerter.error([this.$translate.instant('dedicatedCloud_tab_veeam_enable_fail'), _.get(error, 'data.message')].join(' '));
    }).finally(() => {
      this.loading.init = false;
    });
  }
});
