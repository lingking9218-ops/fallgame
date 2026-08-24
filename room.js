async function joinRoom(roomCode) {

    return new Promise((resolve) => {

        isHost = false;
        myPlayerNumber = 2;
        currentRoomCode = roomCode;

        peer = new Peer();

        peer.on("open", () => {

            console.log("🔗 正在連線房間:", roomCode);

            const connection =
                peer.connect("AI_CARD_" + roomCode);

            playerConnections = [connection];


            // ========================================
            // ⚠️ 先設定 data 監聽器
            // 不要等 open 之後才設定
            // ========================================

            connection.on("data", (data) => {

                console.log(
                    "📨 玩家2收到:",
                    data
                );


                // 房間加入成功
                if (data.type === "ROOM_JOINED") {

                    updatePlayerList();

                    resolve(true);

                    return;
                }


                // 遊戲開始 / 遊戲同步
                if (
                    typeof handleGameData === "function"
                ) {

                    handleGameData(data);

                }

            });


            // ========================================
            // 連線成功
            // ========================================

            connection.on("open", () => {

                console.log(
                    "✅ 玩家2已連線房主"
                );


                // 告訴房主：
                // 玩家2已經準備好了

                connection.send({

                    type: "PLAYER_JOINED"

                });

            });


            connection.on("error", (error) => {

                console.error(
                    "❌ 加入房間失敗:",
                    error
                );

                resolve(false);

            });


            connection.on("close", () => {

                console.log(
                    "❌ 與房主的連線中斷"
                );

            });

        });


        peer.on("error", (error) => {

            console.error(
                "❌ PeerJS 錯誤:",
                error
            );

            resolve(false);

        });

    });

}
