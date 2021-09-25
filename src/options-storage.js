import OptionsSync from "webext-options-sync";

export default new OptionsSync({
	defaults: {
		replyEnabled: true,
	},
	migrations: [OptionsSync.migrations.removeUnused],
	logging: true,
});
