import { FeaturesService, SettingsService, StatusService, YamahaClient, YamahaExtendedControlClient } from './yamaha';

export const settings = new SettingsService();
export const yamaha = new YamahaClient(new YamahaExtendedControlClient(settings));
export const featuresService = new FeaturesService(yamaha);
export const statusService = new StatusService(yamaha, featuresService);
