import T6Actor from "./documents/t6-actor.mjs";
import T6Item from "./documents/t6-item.mjs";
import T6PCSheet from "./sheets/t6-pc-sheet.mjs";
import T6TraitSheet from "./sheets/t6-trait-sheet.mjs";
import registerHandlebarsHelpers from "./handlebars-helpers.mjs";
import T6NPCSheet from "./sheets/t6-npc-sheet.mjs";
import T6ChatMessage from "./chat/t6-chat-message.mjs";
import T6Die from "./die/t6-die.mjs";
import {T6} from "./config.mjs";
import Socket from "../sockets/socket.mjs";
import T6Combatant from "./documents/t6-combatant.mjs";
import T6Combat from "./documents/t6-combat.mjs";
import T6VehicleSheet from "./sheets/t6-vehicle-sheet.mjs";
import T6Themes from "./t6-themes.mjs";
import initializeAppSettings from "./t6-settings.mjs";
import T6ItemModel from "./models/t6-item-model.mjs";

Hooks.once("init", function () {
    console.log("T6 | Initializing T6 System");
    CONFIG.debug.hooks = false;
    CONFIG.T6 = T6

    CONFIG.Item.dataModels.trait = T6ItemModel;

    CONFIG.Combatant.documentClass = T6Combatant;
    CONFIG.Combat.documentClass = T6Combat;
    CONFIG.Actor.documentClass = T6Actor;
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("t6", T6PCSheet, {makeDefault: true, label: "T6.UI.CharacterSheetName"});
    Actors.registerSheet("t6", T6NPCSheet, {label: "T6.UI.NPCSheetName"});
    Actors.registerSheet("t6", T6VehicleSheet, {label: "T6.UI.VehicleSheetName"});

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

    initMacroHelpers()
});

Hooks.once("setup", function () {
    initializeAppSettings();
    T6Themes.injectStyle()
});

Hooks.on("renderCameraViews", function (app, html, data) {
    const cameraGM = html.find("span:contains('GM')");
    cameraGM.text(game.i18n.localize("T6.Narrator"));
});

Hooks.on("renderPlayerList", function (app, html, data) {
    const cameraGM = html.find("span:contains('GM')");
    cameraGM.text(cameraGM.text().replace('GM', game.i18n.localize("T6.Narrator")));
});

function initMacroHelpers() {
    game.T6 = {};
    game.T6.rollRandomCharacter = rollRandomCharacter;
}

async function preloadTemplates() {
    return loadTemplates([
        "systems/t6/templates/parts/trait-list.html",
    ]);
}

async function rollRandomCharacter() {
    const randomTablesPack = game.packs.get("t6.moscowpunk-random-tables")

    const table = await randomTablesPack.getDocument("3zUn7qCDeIHGDaz9")
    const roll = await table.roll()
    while (roll.results[0].range === roll.results[1].range) {
        roll.results[1] = (await roll.results[1].parent.roll()).results[0];
    }
    while (roll.results[2].range === roll.results[3].range) {
        roll.results[3] = (await roll.results[3].parent.roll()).results[0];
    }
    table.draw(roll)
}