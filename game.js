// ========================================
// 🎮 AI Card Challenge
// game.js
// 5 戰 3 勝系統
// ========================================


// ========================================
// HTML 元素
// ========================================

const menu =
    document.getElementById("menu");

const roomScreen =
    document.getElementById("roomScreen");

const gameScreen =
    document.getElementById("gameScreen");

const resultScreen =
    document.getElementById("resultScreen");

const roomCodeInput =
    document.getElementById("roomCode");

const displayRoomCode =
    document.getElementById("displayRoomCode");

const message =
    document.getElementById("message");

const createRoomButton =
    document.getElementById("createRoom");

const joinRoomButton =
    document.getElementById("joinRoom");

const leaveRoomButton =
    document.getElementById("leaveRoom");

const startGameButton =
    document.getElementById("startGame");

const nextRoundButton =
    document.getElementById("nextRound");


// ========================================
// 遊戲資料
// ========================================

let gameData = {

    started: false,

    round: 1,

    score1: 0,

    score2: 0,

    maxRounds: 5,

    currentChallenge: null,

    roundWinner: null,

    gameWinner: null

};


// ========================================
// 我的玩家編號
// ========================================

let myPlayerNumber = 0;


// ========================================
// 是否已經進入遊戲
// ========================================

let gameStarted = false;


// ========================================
// 建立房間
// ========================================

createRoomButton.addEventListener(
    "click",
    async () => {

        createRoomButton.disabled = true;

        joinRoomButton.disabled = true;


        showMessage(
            "⏳ 正在建立房間..."
        );


        const roomCode =
            await createRoom();


        if (!roomCode) {

            showMessage(
                "❌ 建立房間失敗"
            );


            createRoomButton.disabled = false;

            joinRoomButton.disabled = false;

            return;

        }


        // 房主
        myPlayerNumber = 1;


        menu.classList.add("hidden");

        roomScreen.classList.remove("hidden");


        displayRoomCode.textContent =
            roomCode;


        updateStartButton();

        showMessage("");

    }
);


// ========================================
// 加入房間
// ========================================

joinRoomButton.addEventListener(
    "click",
    async () => {

        const roomCode =
            roomCodeInput.value.trim();


        if (!/^\d{4}$/.test(roomCode)) {

            showMessage(
                "⚠️ 請輸入 4 位數房號"
            );

            return;

        }


        createRoomButton.disabled = true;

        joinRoomButton.disabled = true;


        showMessage(
            "⏳ 正在加入房間..."
        );


        const success =
            await joinRoom(roomCode);


        if (!success) {

            showMessage(
                "❌ 無法加入房間"
            );


            createRoomButton.disabled = false;

            joinRoomButton.disabled = false;

            return;

        }


        // 房客
        myPlayerNumber = 2;


        menu.classList.add("hidden");

        roomScreen.classList.remove("hidden");


        displayRoomCode.textContent =
            roomCode;


        updateStartButton();

        showMessage("");

    }
);


// ========================================
// 離開房間
// ========================================

leaveRoomButton.addEventListener(
    "click",
    () => {

        if (peer) {

            peer.destroy();

        }


        location.reload();

    }
);


// ========================================
// 開始遊戲
// ========================================

startGameButton.addEventListener(
    "click",
    () => {

        // 只有房主可以開始
        if (!isHost) {

            return;

        }


        // 必須有第二位玩家
        if (playerConnections.length < 1) {

            return;

        }


        startGame();

    }
);


// ========================================
// 開始遊戲
// ========================================

function startGame() {

    if (!isHost) {

        return;

    }


    gameData = {

        started: true,

        round: 1,

        score1: 0,

        score2: 0,

        maxRounds: 5,

        currentChallenge: null,

        roundWinner: null,

        gameWinner: null

    };


    gameStarted = true;


    // 第 1 戰
    setupRound();


    // 通知玩家 2
    broadcast({

        type: "GAME_START",

        gameData: gameData

    });


    showGameScreen();

}


// ========================================
// 設定一戰
// ========================================

function setupRound() {

    gameData.roundWinner = null;


    // 奇數戰：
    // 玩家1 出題
    // 玩家2 挑戰
    //
    // 偶數戰：
    // 玩家2 出題
    // 玩家1 挑戰

    if (
        gameData.round % 2 === 1
    ) {

        gameData.currentChallenge = {

            creator: 1,

            challenger: 2

        };

    } else {

        gameData.currentChallenge = {

            creator: 2,

            challenger: 1

        };

    }


    updateGameUI();

}


// ========================================
// 顯示遊戲畫面
// ========================================

function showGameScreen() {

    roomScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");

    resultScreen.classList.add("hidden");


    updateGameUI();

}


// ========================================
// 更新遊戲 UI
// ========================================

function updateGameUI() {

    if (!gameStarted) {

        return;

    }


    // ====================================
    // 戰局
    // ====================================

    document.getElementById(
        "roundNumber"
    ).textContent =
        `第 ${gameData.round} 戰 / 5 戰`;


    // ====================================
    // 分數
    // ====================================

    document.getElementById(
        "score1"
    ).textContent =
        gameData.score1;


    document.getElementById(
        "score2"
    ).textContent =
        gameData.score2;


    // ====================================
    // 身分
    // ====================================

    const creator =
        gameData.currentChallenge.creator;

    const challenger =
        gameData.currentChallenge.challenger;


    if (
        myPlayerNumber === creator
    ) {

        document.getElementById(
            "myRole"
        ).textContent =
            "🎨 我的身分：出題者";


        document.getElementById(
            "opponentRole"
        ).textContent =
            "🎯 對手：挑戰者";

    }


    else if (
        myPlayerNumber === challenger
    ) {

        document.getElementById(
            "myRole"
        ).textContent =
            "🎯 我的身分：挑戰者";


        document.getElementById(
            "opponentRole"
        ).textContent =
            "🎨 對手：出題者";

    }


    // ====================================
    // 挑戰類型
    // ====================================

    document.getElementById(
        "challengeType"
    ).textContent =
        "🎲 尚未選擇挑戰類型";


    // ====================================
    // 遊戲訊息
    // ====================================

    document.getElementById(
        "gameMessage"
    ).textContent =
        `${creator}號玩家是出題者，${challenger}號玩家是挑戰者。`;

}


// ========================================
// 下一戰
// ========================================

nextRoundButton.addEventListener(
    "click",
    () => {

        if (!isHost) {

            return;

        }


        if (
            gameData.roundWinner === null
        ) {

            return;

        }


        // 已有人 3 勝
        if (
            gameData.score1 >= 3 ||
            gameData.score2 >= 3
        ) {

            finishGame();

            return;

        }


        // 進入下一戰
        gameData.round++;


        setupRound();


        broadcast({

            type: "NEXT_ROUND",

            gameData: gameData

        });

    }
);


// ========================================
// 模擬本戰勝者
// ========================================
//
// 目前還沒有真正挑戰遊戲
// 先保留測試功能
//

function testRoundWinner(playerNumber) {

    if (!isHost) {

        return;

    }


    if (
        gameData.roundWinner !== null
    ) {

        return;

    }


    gameData.roundWinner =
        playerNumber;


    // 加分
    if (playerNumber === 1) {

        gameData.score1++;

    } else {

        gameData.score2++;

    }


    document.getElementById(
        "gameMessage"
    ).textContent =
        `🏆 第 ${gameData.round} 戰：玩家 ${playerNumber} 勝利！`;


    // 廣播結果
    broadcast({

        type: "ROUND_RESULT",

        gameData: gameData

    });


    updateGameUI();


    // 有人 3 勝
    if (
        gameData.score1 >= 3 ||
        gameData.score2 >= 3
    ) {

        setTimeout(
            finishGame,
            1000
        );

        return;

    }


    // 顯示下一戰
    nextRoundButton.classList.remove(
        "hidden"
    );

}


// ========================================
// 結束遊戲
// ========================================

function finishGame() {

    if (!isHost) {

        return;

    }


    if (
        gameData.score1 >= 3
    ) {

        gameData.gameWinner = 1;

    }

    else if (
        gameData.score2 >= 3
    ) {

        gameData.gameWinner = 2;

    }

    else {

        return;

    }


    broadcast({

        type: "GAME_FINISH",

        gameData: gameData

    });


    showResult();

}


// ========================================
// 顯示結果
// ========================================

function showResult() {

    gameScreen.classList.add(
        "hidden"
    );

    resultScreen.classList.remove(
        "hidden"
    );


    document.getElementById(
        "winnerText"
    ).textContent =
        `🏆 玩家 ${gameData.gameWinner} 勝利！`;


    document.getElementById(
        "finalScore"
    ).textContent =
        `${gameData.score1} : ${gameData.score2}`;

}


// ========================================
// 接收房間資料
// ========================================
//
// 這個函式會被 room.js 呼叫
//

const originalHandleRoomData =
    typeof handleRoomData === "function"
        ? handleRoomData
        : null;


function handleGameData(data) {

    // ====================================
    // 開始遊戲
    // ====================================

    if (
        data.type === "GAME_START"
    ) {

        gameData =
            data.gameData;

        gameStarted = true;

        showGameScreen();

        return;

    }


    // ====================================
    // 下一戰
    // ====================================

    if (
        data.type === "NEXT_ROUND"
    ) {

        gameData =
            data.gameData;

        nextRoundButton.classList.add(
            "hidden"
        );

        updateGameUI();

        return;

    }


    // ====================================
    // 本戰結果
    // ====================================

    if (
        data.type === "ROUND_RESULT"
    ) {

        gameData =
            data.gameData;


        document.getElementById(
            "gameMessage"
        ).textContent =
            `🏆 第 ${gameData.round} 戰：玩家 ${gameData.roundWinner} 勝利！`;


        updateGameUI();


        if (
            gameData.score1 < 3 &&
            gameData.score2 < 3
        ) {

            nextRoundButton.classList.add(
                "hidden"
            );

        }

        return;

    }


    // ====================================
    // 遊戲結束
    // ====================================

    if (
        data.type === "GAME_FINISH"
    ) {

        gameData =
            data.gameData;

        showResult();

        return;

    }

}


// ========================================
// 修改 room.js 的資料處理
// ========================================
//
// 因為 room.js 已經有 handleRoomData()
// 所以這裡把遊戲資料也交給它
//

const oldHandleRoomData =
    window.handleRoomData;


window.handleRoomData =
    function(data, connection) {

        // 遊戲資料
        if (
            data.type === "GAME_START" ||
            data.type === "NEXT_ROUND" ||
            data.type === "ROUND_RESULT" ||
            data.type === "GAME_FINISH"
        ) {

            handleGameData(data);

            return;

        }


        // 房間資料
        if (
            typeof oldHandleRoomData === "function"
        ) {

            oldHandleRoomData(
                data,
                connection
            );

        }

    };


// ========================================
// 更新開始按鈕
// ========================================

function updateStartButton() {

    if (!startGameButton) {

        return;

    }


    // 只有房主可以開始
    if (!isHost) {

        startGameButton.disabled = true;

        startGameButton.textContent =
            "⏳ 等待房主開始";

        return;

    }


    // 還沒有玩家2
    if (
        !playerConnections ||
        playerConnections.length < 1
    ) {

        startGameButton.disabled = true;

        startGameButton.textContent =
            "🎮 等待玩家加入";

        return;

    }


    // 可以開始
    startGameButton.disabled = false;

    startGameButton.textContent =
        "🎮 開始遊戲";

}


// ========================================
// 系統訊息
// ========================================

function showMessage(text) {

    if (!message) {

        return;

    }


    message.textContent = text;

}
