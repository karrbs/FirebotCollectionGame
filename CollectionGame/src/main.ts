import {
  Firebot,
  ScriptReturnObject,
} from "@crowbartools/firebot-custom-scripts-types";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import Datastore from "@seald-io/nedb";
import { stat } from "fs/promises";
import { randomInt, randomUUID } from "crypto";
import { isNumberObject } from "util/types";

interface Params {
  name: string;
  folder: string;
  dbFolderPath: string;
}

type CollectionItem = {
  filePath: string;
  id: string;
  name: string;
  fileExt: string;
  addedDate: Number;
};

function sendError(msg: string): ScriptReturnObject {
  // Return a Promise object
  return {
    success: false,
    errorMessage: msg, // If 'success' is false, this message is shown in a Firebot popup.
    effects: [],
  };
}

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: "Collection Game - Startup",
      description: "A Script for a basic Collection Game",
      author: "Karrbs",
      version: "0.2",
      firebotVersion: "5",
    };
  },
  getDefaultParameters: () => {
    return {
      name: {
        type: "string",
        default: "Collection",
        description: "Collction Name",
        secondaryDescription: "Give a name to your collection.",
      },
      folder: {
        type: "filepath",
        fileOptions: {
          directoryOnly: true, //set this to true if you want the user to only be able to select folders
          filters: [{ name: "", extensions: [] }],
          title: "Please select collection folder",
          buttonLabel: "Select Folder",
        },
      },
      dbFolderPath: {
        type: "filepath",
        default: "..\\db\\cg",
        secondaryDescription: "Pls leave default",
        fileOptions: {
          directoryOnly: true, //set this to true if you want the user to only be able to select folders
          filters: [{ name: "", extensions: [] }],
          title: "Please select a DB folder",
          buttonLabel: "Select Folder",
        },
      },
    };
  },
  run: (runRequest) => {
    const { logger, customVariableManager } = runRequest.modules;

    var collectionName = runRequest.parameters.name;
    var collectionFolderPath = runRequest.parameters.folder;
    var dbFolderPath = runRequest.parameters.dbFolderPath;
    var itemDbPath = dbFolderPath.concat("\/items.txt");

    logger.debug(collectionName);
    logger.debug(collectionFolderPath);
    logger.debug(runRequest.parameters.dbFolderPath);
    logger.debug(dbFolderPath);
    logger.debug(itemDbPath);

    if (!fs.existsSync(dbFolderPath)) {
      fs.mkdirSync(dbFolderPath);
      if (!fs.existsSync(itemDbPath)) {
        fs.writeFileSync(itemDbPath, "");
      }
    }
    var items = "";
    var items = fs.readFileSync(itemDbPath).toString() ?? "";

    if (collectionFolderPath == null && collectionFolderPath == "") {
      return sendError("No folder was givena or could not find file path.");
    }

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    var itemsDbFile: Array<CollectionItem> = [];
    var collectionItems = fs.readdirSync(collectionFolderPath);
    logger.info("before");
    logger.info(items.length.toString());
    if (items != null && items.length > 3) {
      itemsDbFile = JSON.parse(items);
      if (itemsDbFile != undefined && itemsDbFile.length > 0) {
        itemsDbFile.splice(
          itemsDbFile.findIndex(
            (x) =>
              x.name != collectionItems.find((y) => imageExtensions.includes(y.split('.')[1]) && y.split(".")[0] == x.name)
          )
        );
      }
    }
    // Read folder path and get list of files.
    collectionItems.forEach((fileString) => {
      try {
        let filepath = collectionFolderPath + "\\" + fileString;
        var name = fileString.split(".")[0];
        var ext = fileString.split(".")[1];

        if (imageExtensions.includes(ext) && itemsDbFile.find((x) => x.name == undefined ? "" : x.name == name) == null) {
          const item: CollectionItem = {
            filePath: filepath,
            id: randomUUID(),
            name: name.toString(),
            fileExt: ext.toString(),
            addedDate: Date.now(),
          };

          itemsDbFile.push(item);
        }
      } catch (error) {
        // if an error happens
        logger.error(error.toString());
      }
    });

    fs.writeFileSync(itemDbPath, JSON.stringify(itemsDbFile));

    logger.debug("add Variable");

    customVariableManager.addCustomVariable(
      "cg." + collectionName + ".il",
      JSON.stringify(itemsDbFile)
    );
    logger.debug("get Variable");
    return {
      success: true,
      errorMessage: "Failed to run the script!",
      // If 'success' is false, this message is shown in a Firebot popup.
      effects: [],
    };
  },
};

export default script;
