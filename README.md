# Firebot Collection Game

status: Alpha

## About

Created for the need of a simple game that would look at a folder, index it, and then allow the viewers to collected said collection via a channel rewards.

** Collection Game is two scripts and will be rewritten in the near future to be a custom game for. Firebot
*** Based on the the template script that firebot provided

### Features Required
- User DB
- Persist Custom Variables 
- Custom Scripts


## How to use

### Statup Scripts
1. Create an `item.txt` file in a safe directory
2. Add both JS Files `collectionGame - reward`, `collectionGame - startup` to the Scripts Folder.
2. Add `collectionGame - startup` script in the start up scripts
3. Collection Name: Name it what you want. I would keep this simple and that works with reward message.
3. folder: Select a directory that will have all your image files in it
4. dbFolderPath: Select the folder where you put the item.txt

### Reward (command/channel rewards)
1. Add effect `Custom Script`
2. Select `collectionGame - reward`

### Current Reward Message and overlay
Message: `metadata.username + " has collected a " + selectedItem.name + " " + collectionName + "\! They now have collected " + test.totalCount + " " + collectionName + "s\."`
Overlay: Shows Image, Jackinthebox ,wobble, rollout -  total time is 10 image size is 250 by 250 

## TODO

- [ ] merge into 1 scripts
- [ ] validate item.txt
- [ ] integrate reward into events
- [ ] create build and pack script
- [ ] output information into a variable. 

## Current Bugs
- [ ] Can't replay message from action message

## Using
### Setup
1. Create a new repo based off this template (Click "Use this Template" above) or simply fork it
2. `npm install`

### Building
Dev:
1. `npm run build:dev`
- Automatically copies the compiled .js to Firebot's scripts folder.

Release:
1. `npm run build`
- Copy .js from `/dist`

### Note
- Keep the script definition object (that contains the `run`, `getScriptManifest`, and `getDefaultParameters` funcs) in the `main.ts` file as it's important those function names don't get minimized.
- Edit the `"scriptOutputName"` property in `package.json` to change the filename of the outputted script.


