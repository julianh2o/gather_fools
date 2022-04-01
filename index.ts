import { API_KEY, SPACE_ID } from "./api_key";
import { Game } from "@gathertown/gather-game-client";
global.WebSocket = require("isomorphic-ws");
import _ from "lodash";
import fs from "fs";

// gather game client setup
const game = new Game(SPACE_ID,() => Promise.resolve({ apiKey: API_KEY }));
game.connect();

const target = "4th of July bunting (small)";

const withinObject = (x: number, y: number, o: any) => x >= o.x && x < o.x + o.width && y > o.y && y <= o.y+o.height;

let arches: any[] = [];

const loadOutfits = () => {
  try {
    const raw = fs.readFileSync("/tmp/players.json","utf8");
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

const AprilFools = async (game: Game) => {
  const knownOutfits: any = loadOutfits();
  const playerPositions: any = {};
  const playerInfo: any = {};

  const walkedThroughArch = (playerId: string, upwards: boolean) => {
    console.log(`${playerId} walked through arch ${upwards ? "upwards" : "downwards"}}`);

    const otherOutfits = Object.values(_.omit(knownOutfits,playerId))
    const targetCostume = upwards ? knownOutfits[playerId] : _.sample(otherOutfits);

    if (!targetCostume) return;

    game.setName(targetCostume.name,playerId);
    game.setOutfitString(targetCostume.outfitString,playerId);
    game.playSound("https://julianhartline.com/TransporterBeam_short.mp3",0.2,playerId);
  }

  game.subscribeToEvent("playerMoves",({playerMoves},context: any) => {
    const playerId = context.playerId;

    const {x,y} = playerMoves;
    const px = playerPositions[playerId] && playerPositions[playerId].x;
    const py = playerPositions[playerId] && playerPositions[playerId].y

    if (x && y && px && py) {
      const wasInArch = _.find(arches,o => withinObject(px!,py!,o));
      const nowInArch = _.find(arches,o => withinObject(x!,y!,o));
      // console.log({x,y,px,py,wasInArch,nowInArch});

      if (wasInArch && !nowInArch) walkedThroughArch(playerId, y < py);
    }

    playerPositions[playerId] = {...playerPositions[playerId],..._.omit(playerMoves,_.isUndefined as any)}
  });

  const doWrite = () => fs.writeFileSync("/tmp/players.json",JSON.stringify(knownOutfits,null,2));
  const writePlayerFieldUnlessFilled = (playerId: string, field: string, value: string) => {
    const existing = _.get(knownOutfits,`${playerId}.${field}`);
    if (existing) {
      return;
    }
    _.set(knownOutfits,`${playerId}.${field}`,value);
    doWrite();
  }

  game.subscribeToEvent("playerSetsName",({playerSetsName}, context: any) => {
    const {name} = playerSetsName;
    writePlayerFieldUnlessFilled(context.playerId,"name",name);
  });
  game.subscribeToEvent("playerSetsOutfitString",({playerSetsOutfitString}, context: any) => {
    const {outfitString} = playerSetsOutfitString;
    writePlayerFieldUnlessFilled(context.playerId,"outfitString",outfitString);
  });

  await game.waitForInit();
  arches = game.filterObjectsInSpace(o => o._name === target);
  console.log(arches);
};

AprilFools(game);