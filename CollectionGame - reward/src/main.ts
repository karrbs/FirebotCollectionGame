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
import { run } from "node:test";

interface Params {
  name: string;
}

type CollectionItem = {
  filePath: string;
  id: string;
  name: string;
  fileExt: string;
  addedDate: Number;
};

type Collection = {
  totalCount: number;
  collection: string;
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
      name: "Collection Game - Reward",
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
    };
  },
  run: async (runRequest) => {
    const { logger, customVariableManager, userDb, utils } = runRequest.modules;
    const { metadata } = runRequest.trigger;

    var collectionName = runRequest.parameters.name;

    //effect script

    var itemsList: Array<CollectionItem> =
      customVariableManager.getCustomVariable("cg." + collectionName + ".il");
    // logger.debug("list :" + itemsList);

    var lastSelectedValue =
      "cg" + collectionName + "-" + metadata.username + "ls";
    // var requesterLSV;

    // userDb
    //   .getUserMetadata(metadata.username, lastSelectedValue)
    //   .then((x) => (requesterLSV = x ?? ""))
    //   .catch((err) => sendError(err.toString()));

    // logger.debug(requesterLSV);

    var rnd = Math.floor(Math.random() * (itemsList.length - 0)) + 0;

    var selectedItem = itemsList[rnd];
    var totalCountMdValue = "cg" + collectionName + "Collection";
    var failed = false;
    var test: Collection = await userDb
      .getUserMetadata(metadata.username, totalCountMdValue)
      .then((value: any) => {
        // Type assertion: assume value is of type MySpecificType
        if (value == null || value == undefined || value == "") {
          return { totalCount: 0, collection: "" } as Collection;
        }
        return { ...value } as Collection;
      })
      .catch((y) => {
        return { totalCount: 0, collection: "" } as Collection;
      });

    if (failed || test == null || test == undefined) {
      logger.warn("inside", test.toString());
      test = { totalCount: 0, collection: "" };
    }
    logger.debug("after", test);

    test.totalCount = test.totalCount + 1;
    logger.debug("count", test.collection.length);

    if (test.collection == "") {
      test.collection = selectedItem.name;
    } else {
      test.collection = test.collection + "," + selectedItem.name;
    }

    await userDb.updateUserMetadata(
      metadata.username,
      totalCountMdValue,
      test,
      null
    );
    await userDb
      .updateUserMetadata(
        metadata.username,
        lastSelectedValue,
        selectedItem,
        null
      )
      .then();

    var displayMsg =
      metadata.username +
      " has collected a " +
      selectedItem.name +
      " " +
      collectionName +
      "\! They now have collected " +
      test.totalCount +
      " " +
      collectionName +
      "s\.";
    logger.debug(displayMsg);

    return {
      success: true,
      errorMessage: "Failed to run the script!",
      // If 'success' is false, this message is shown in a Firebot popup.
      effects: [
        {
          type: "firebot:chat",
          message: displayMsg,
          chatter: "Streamer",
        },
        {
          id: "c5d35630-4b85-11ef-9963-3f34f33f1df1",
          type: "firebot:showImage",
          active: true,
          imageType: "local",
          position: "Random",
          customCoords: { top: 0, bottom: null, left: 0, right: null },
          enterAnimation: "jackInTheBox",
          exitAnimation: "rollOut",
          inbetweenAnimation: "wobble",
          inbetweenRepeat: 10,
          inbetweenDuration: "10s",
          width: 250,
          height: 250,
          length: "10",
          file: selectedItem.filePath,
        },
      ],
    };
  },
};

export default script;
