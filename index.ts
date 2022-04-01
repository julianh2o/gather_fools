import { API_KEY, SPACE_ID } from "./api_key";
import { Game } from "@gathertown/gather-game-client";
global.WebSocket = require("isomorphic-ws");
import _ from "lodash";

// gather game client setup
const game = new Game(SPACE_ID,() => Promise.resolve({ apiKey: API_KEY }));
game.connect();

const AprilFools = (game: Game) => {
  game.subscribeToEvent("mapSetObjects",({mapSetObjects}) => {
    console.log("set",mapSetObjects);
    console.log(_.map(Object.values(mapSetObjects),"_name"));

  });
  game.subscribeToEvent("playerMoves",({playerMoves}) => {
    console.log("move",playerMoves);
  });
};

AprilFools(game);



// check every 5s
/*
setInterval(async () => {
  let playing = "";
  let emoji = "";

  if (res.data.is_playing === true) {
    if (res.data.currently_playing_type === "track") {
      playing =
        res.data.item.name + " ∙ " + res.data.item.artists[0].name + " (Spotify)";
      emoji = "🎶";
    } else if (res.data.currently_playing_type === "episode") {
      playing = "listening to some podcast (Spotify)";
      emoji = "🎧";
    }
    else console.log("unexpected value in 'currently_playing_type'")
  }
  else { // listening to nothing
    playing = "";
    emoji = "";
  }; 

  if (playing !== "") {
    console.log(playing);
  }
  else console.log("stopped listening");

  game.engine.sendAction({
    $case: "setEmojiStatus",
    setEmojiStatus: {
      emojiStatus: emoji,
    },
  });
  game.engine.sendAction({
    $case: "setTextStatus",
    setTextStatus: {
      textStatus: playing,
    },
  });
}, 5000);

*/