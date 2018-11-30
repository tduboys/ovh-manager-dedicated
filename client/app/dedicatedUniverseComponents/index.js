import angular from 'angular';

import ducBandwidth from './bandwidth';
import ducBytes from './bytes';
import ducContract from './contract';
import ducPrice from './price';
import ducTabs from './tabs';
import ducTranslate from './translate';

const moduleName = 'dedicatedUniverseComponents';

angular
  .module(moduleName, [
    ducBandwidth,
    ducBytes,
    ducContract,
    ducPrice,
    ducTabs,
    ducTranslate,
  ]);

export default moduleName;
