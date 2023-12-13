import T6Actor from "./t6-actor.mjs";
import T6Item from "./t6-item.mjs";
import T6PCSheet from "./sheets/t6-pc-sheet.mjs";
import T6TraitSheet from "./sheets/t6-trait-sheet.mjs";
import registerHandlebarsHelpers from "./handlebars-helpers.mjs";
import T6NPCSheet from "./sheets/t6-npc-sheet.mjs";
import T6ChatMessage from "./chat/t6-chat-message.mjs";
import T6Die from "./die/t6-die.mjs";
import {T6} from "./config.mjs";
import Socket from "../sockets/socket.mjs";
import T6Combatant from "./t6-combatant.mjs";
import T6Combat from "./t6-combat.mjs";

Hooks.once("init", function () {
    console.log("T6 | Initializing T6 System");
    CONFIG.debug.hooks = true;
    CONFIG.T6 = T6

    CONFIG.Combatant.documentClass = T6Combatant;
    CONFIG.Combat.documentClass = T6Combat;
    CONFIG.Actor.documentClass = T6Actor;
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("t6", T6PCSheet, {makeDefault: true, label: "T6.UI.CharacterSheetName"});
    Actors.registerSheet("t6", T6NPCSheet, {label: "T6.UI.NPCSheetName"});

    CONFIG.ChatMessage.documentClass = T6ChatMessage;
    CONFIG.ChatMessage.template = "systems/t6/templates/chat/chat-message.html"

    CONFIG.Item.documentClass = T6Item;
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("t6", T6TraitSheet, {makeDefault: true, label: "T6.UI.ItemSheetName"})

    CONFIG.Dice.types = [T6Die, FateDie]
    CONFIG.Dice.terms.d = T6Die;

    preloadTemplates();
    registerHandlebarsHelpers();

    Socket.initialize("t6");
    T6Actor.listenWoundChange()
});

Hooks.once("setup", function () {
    initializeAppConfig();
});

Hooks.on("renderCameraViews", function (app, html, data) {
    const cameraGM = html.find("span:contains('GM')");
    cameraGM.text(game.i18n.localize("T6.Narrator"));
});

Hooks.on("renderPlayerList", function (app, html, data) {
    const cameraGM = html.find("span:contains('GM')");
    cameraGM.text(cameraGM.text().replace('GM', game.i18n.localize("T6.Narrator")));
});

async function preloadTemplates() {
    return loadTemplates([
        "systems/t6/templates/parts/trait-list.html",
        "systems/t6/templates/parts/pc-traits.html",
        "systems/t6/templates/parts/npc-traits.html"
    ]);
}

async function initializeAppConfig() {
    game.settings.register('t6', 'traitTypes', {
        name: 'T6.Settings.TraitTypes.Name',
        hint: 'T6.Settings.TraitTypes.Description',
        label: "T6.Settings.TraitTypes.Label",
        config: true, // false if you don't want it to show in module config
        type: String,
        restricted: true,
        default: game.i18n.localize('T6.Settings.TraitTypes.Default')
    });
    game.settings.register('t6', 'complications', {
        name: 'T6.Settings.Complications.Name',
        hint: 'T6.Settings.Complications.Description',
        label: "T6.Settings.Complications.Label",
        config: true,
        type: Boolean,
        restricted: true,
        default: true
    });
    game.settings.register('t6', 'traumas', {
        name: 'T6.Settings.Traumas.Name',
        hint: 'T6.Settings.Traumas.Description',
        label: "T6.Settings.Traumas.Label",
        config: true,
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
            type: String,
            choices: tables,
            restricted: true,
            default: true
        });
    }


    // game.settings.registerMenu('t6', 'traitTypesMenu', {
    //     name: 'T6.Settings.TraitTypes.Name',
    //     hint: 'T6.Settings.TraitTypes.Description',
    //     label: "T6.Settings.TraitTypes.Label",
    //     config: true,       // false if you don't want it to show in module config
    //     type: TraitTypesConfig,
    //     restricted: true
    // });
    //
    // game.settings.register('t6', 'traitTypes', {
    //     scope: 'world',     // "world" = sync to db, "client" = local storage
    //     config: false,      // we will use the menu above to edit this setting
    //     type: Array,
    //     default: ['Personal', "History", "Equipment", "Cyberware", "Troubles"]        // can be used to set up the default structure
    // });
}

