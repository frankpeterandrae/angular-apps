import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	featuresService: {
		getPowerZones: vi.fn()
	},
	statusService: {
		refresh: vi.fn()
	},
	yamaha: {
		standby: vi.fn()
	}
}));

vi.mock('../services', () => ({
	featuresService: mocks.featuresService,
	statusService: mocks.statusService,
	yamaha: mocks.yamaha
}));

vi.mock('@elgato/streamdeck', () => ({
	action: () => (target: unknown) => target,
	SingletonAction: class {}
}));

import { PowerOffAllActionImpl } from './power-off-all.action.impl';

describe('PowerOffAllActionImpl', () => {
	let action: PowerOffAllActionImpl;

	beforeEach(() => {
		vi.clearAllMocks();

		mocks.featuresService.getPowerZones.mockResolvedValue([
			{ id: 'main', label: 'Main Zone' },
			{ id: 'zone2', label: 'Zone 2' }
		]);

		mocks.yamaha.standby.mockResolvedValue(undefined);
		mocks.statusService.refresh.mockResolvedValue(undefined);

		action = new PowerOffAllActionImpl();
	});

	it('sets title and image on appear', async () => {
		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.setTitle).toHaveBeenCalledWith('All\nStandby');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/power-off-all/key');
	});

	it('ignores non-key actions on appear', async () => {
		const keyAction = {
			isKey: vi.fn().mockReturnValue(false),
			setTitle: vi.fn(),
			setImage: vi.fn()
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.setTitle).not.toHaveBeenCalled();
		expect(keyAction.setImage).not.toHaveBeenCalled();
	});

	it('switches all power zones to standby', async () => {
		await action.onKeyDown({} as never);

		expect(mocks.featuresService.getPowerZones).toHaveBeenCalledOnce();

		expect(mocks.yamaha.standby).toHaveBeenCalledTimes(2);
		expect(mocks.yamaha.standby).toHaveBeenCalledWith('main');
		expect(mocks.yamaha.standby).toHaveBeenCalledWith('zone2');

		expect(mocks.statusService.refresh).toHaveBeenCalledOnce();
	});

	it('refreshes status when no power zones are available', async () => {
		mocks.featuresService.getPowerZones.mockResolvedValue([]);

		await action.onKeyDown({} as never);

		expect(mocks.yamaha.standby).not.toHaveBeenCalled();
		expect(mocks.statusService.refresh).toHaveBeenCalledOnce();
	});

	it('does not refresh status when switching a zone fails', async () => {
		mocks.yamaha.standby.mockRejectedValueOnce(new Error('standby failed'));

		await expect(action.onKeyDown({} as never)).rejects.toThrow('standby failed');

		expect(mocks.statusService.refresh).not.toHaveBeenCalled();
	});
});
