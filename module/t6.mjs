import T6Actor from "./t6-actor.mjs";
import T6Item from "./t6-item.mjs";
import T6PCSheet from "./sheets/t6-pc-sheet.mjs";

Hooks.once("init", function () {
    console.log("T6 | Initializing T6 System");
    CONFIG.debug.hooks = true;

    CONFIG.Actor.documentClass = T6Actor;
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("t6", T6PCSheet, { makeDefault: true, label: "T6.Sheets.CharacterSheetName" });
    // Actors.registerSheet("efs", EFSNPCSheet, { label: "EFS.Sheets.NPC" });

    CONFIG.Item.documentClass = T6Item;
    // Items.unregisterSheet("core", ItemSheet);
    // Items.registerSheet("efs", EFSItemSheet, { makeDefault: true, label: "EFS.Sheets.Item" })
});

Hooks.on("renderCameraViews", function (app, html, data){
    const cameraGM = html.find("span:contains('GM')");
    cameraGM.text(game.i18n.localize("T6.Narrator"));
});

Hooks.on("renderPlayerList", function (app, html, data){
    const cameraGM = html.find("span:contains('GM')");
    cameraGM.text(cameraGM.text().replace('GM', game.i18n.localize("T6.Narrator")));
});