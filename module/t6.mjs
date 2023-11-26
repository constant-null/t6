import T6Actor from "./t6-actor.mjs";
import T6Item from "./t6-item.mjs";
import T6PCSheet from "./sheets/t6-pc-sheet.mjs";
import TraitTypesConfig from "./forms/trait-types-config.mjs";
import T6TraitSheet from "./sheets/t6-trait-sheet.mjs";

Hooks.once("init", function () {
    console.log("T6 | Initializing T6 System");
    CONFIG.debug.hooks = true;

    CONFIG.Actor.documentClass = T6Actor;
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("t6", T6PCSheet, { makeDefault: true, label: "T6.Sheets.CharacterSheetName" });
    // Actors.registerSheet("efs", EFSNPCSheet, { label: "EFS.Sheets.NPC" });

    CONFIG.Item.documentClass = T6Item;
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("t6", T6TraitSheet, { makeDefault: true, label: "T6.Sheets.ItemSheetName" })

    preloadTemplates();
    initializeAppConfig();
});

Hooks.on("renderCameraViews", function (app, html, data){
    const cameraGM = html.find("span:contains('GM')");
    cameraGM.text(game.i18n.localize("T6.Narrator"));
});

Hooks.on("renderPlayerList", function (app, html, data){
    const cameraGM = html.find("span:contains('GM')");
    cameraGM.text(cameraGM.text().replace('GM', game.i18n.localize("T6.Narrator")));
});

async function preloadTemplates() {
    return loadTemplates([
        "systems/t6/templates/parts/trait-list.html",
    ]);
}

async function initializeAppConfig() {
    game.settings.registerMenu('t6', 'traitTypesMenu', {
        name: 'T6.Settings.TraitTypes.Name',
        hint: 'T6.Settings.TraitTypes.Description',
        label: "T6.Settings.TraitTypes.Label",
        config: true,       // false if you dont want it to show in module config
        type: TraitTypesConfig,
        restricted: true
    });

    game.settings.register('t6', 'traitTypes', {
        scope: 'world',     // "world" = sync to db, "client" = local storage
        config: false,      // we will use the menu above to edit this setting
        type: Array,
        default: ['Personal', "History", "Troubles", "Equipment", "Cyberware"]        // can be used to set up the default structure
    });
}