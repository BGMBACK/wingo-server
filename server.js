const express = require("express");
const admin = require("firebase-admin");

const serviceAccount =
require("./serviceAccountKey.json");

admin.initializeApp({
  credential:
  admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();

app.get("/", (req,res)=>{
  res.send("WinGo Server Running");
});

// =======================
// 🌍 GLOBAL TIMER
// =======================

setInterval(async()=>{

  try{

    let ref =
    db.collection("gameControl")
    .doc("timer");

    let snap =
    await ref.get();

    // FIRST CREATE
    if(!snap.exists){

      await ref.set({

        time:30,

        result:null,

        updatedAt:Date.now()

      });

      return;

    }

    let data =
    snap.data();

    let current =
    typeof data.time === "number"
    ? data.time
    : 30;

    current = current - 1;

    // RESULT
    if(current < 1){

      let result =
      Math.floor(Math.random()*10);

      // SAVE HISTORY
      await db.collection("gameHistory")
      .add({

        result:result,

        time:Date.now()

      });

      // RESET TIMER
      await ref.update({

        time:30,

        result:result,

        updatedAt:Date.now()

      });

      console.log(
        "NEW RESULT:",
        result
      );

    }else{

      // CONTINUE TIMER
      await ref.update({

        time:current

      });

    }

  }catch(err){

    console.log(
      "SERVER ERROR:",
      err
    );

  }

},1000);

const PORT =
process.env.PORT || 3000;

app.listen(PORT, ()=>{

  console.log(
    "Server running"
  );

});