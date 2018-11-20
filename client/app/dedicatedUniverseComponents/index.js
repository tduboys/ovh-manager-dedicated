import angular from 'angular';

import ducTabs from './tabs';

const moduleName = 'dedicatedUniverseComponents';

angular
  .module(moduleName, [
    ducTabs,
  ]);

export default moduleName;
