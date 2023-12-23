import T6Themes from "./t6-themes.mjs";
import TraitTypesConfig from "./forms/trait-types-config.mjs";
import T6ItemModel from "./models/t6-item-model.mjs";
import TraitTypeTemplates from "./forms/trait-type-templates.mjs";

export default async function initializeAppConfig() {
    game.settings.register('t6', 'theme', {
        name: 'T6.Settings.Theme.Name',
        config: true, // false if you don't want it to show in module config
        type: String,
        scope: "client",
        choices: T6Themes.options,
        requiresReload: true,
        restricted: false,
        default: "punk"
    });
    game.settings.register('t6', 'complications', {
        name: 'T6.Settings.Complications.Name',
        hint: 'T6.Settings.Complications.Description',
        label: "T6.Settings.Complications.Label",
        config: true,
        scope: "world",
        type: Boolean,
        restricted: true,
        default: true
    });
    game.settings.register('t6', 'traumas', {
        name: 'T6.Settings.Traumas.Name',
        hint: 'T6.Settings.Traumas.Description',
        label: "T6.Settings.Traumas.Label",
        config: true,
        scope: "world",
        type: Boolean,
        requiresReload: true,
        restricted: true,
        default: true
    });
    if (game.settings.get('t6', 'traumas')) {
        const tables = game.tables.reduce((obj, table) => {
            return {...obj, [table._id]: table.name}
        }, {})
        game.settings.register('t6', 'traumasTable', {
            name: 'T6.Settings.TraumasTable.Name',
            hint: 'T6.Settings.TraumasTable.Description',
            config: true,
            scope: "world",
            type: String,
            choices: tables,
            restricted: true,
            default: true
        });
    }

    game.settings.registerMenu('t6', 'traitTypesMenu', {
        name: 'T6.Settings.TraitTypes.Name',
        hint: 'T6.Settings.TraitTypes.Description',
        label: "T6.Settings.TraitTypes.Label",
        scope: "world",
        config: true,       // false if you don't want it to show in module config
        type: TraitTypesConfig,
        restricted: true
    });

    game.settings.register('t6', 'traitConfigData', {
        scope: 'world',     // "world" = sync to db, "client" = local storage
        config: false,      // we will use the menu above to edit this setting
        type: Object,
        default: TraitTypeTemplates.templates["punk"]
    });
}