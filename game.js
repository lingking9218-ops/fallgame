// ========================================
// 🎮 AI Card Challenge
// game.js
// 遊戲核心＋挑戰類型選擇
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
// 🎯 挑戰類型
// ========================================

const challengeTypes = [

    {
        id: "absolute_pitch",
        name: "🎵 絕對音感挑戰",
        description:
            "同時播放 3 個音，挑戰者需要聽出是哪 3 個音。"
    },

    {
        id: "rhythm",
        name: "🥁 節拍挑戰",
        description:
            "出題者設定節奏，挑戰者使用按鈕打出相同節奏。"
    },

    {
        id: "taiko",
        name: "🥁 太鼓達人",
        description:
            "按照節奏擊打音符。"
    },

    {
        id: "hard_taiko",
        name: "⚡ 困難版太鼓",
        description:
            "使用上下左右四條音軌進行挑戰。"
    },

    {
        id: "devil_music",
        name: "💀 魔鬼音之挑戰",
        description:
            "WASD＋空白鍵控制爵士鼓，RTYUIOP演奏七個音。"
    },

    {
        id: "sight_reading",
        name: "🎼 視譜挑戰",
        description:
            "使用 ASDF＋TYUIOP 進行雙手視奏。"
    }

];


// ========================================
// 🎮 遊戲資料
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
// 遊戲是否開始
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
// 房主開始遊戲
// ========================================

startGameButton.addEventListener(
    "click",
    () => {

        if (!isHost) {

            return;

        }


        if (
            playerConnections.length < 1
        ) {

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


    setupRound();


    broadcast({

        type: "GAME_START",

        gameData: gameData

    });


    showGameScreen();

}


// ========================================
// 設定本戰
// ========================================

function setupRound() {

    gameData.roundWinner = null;


    // 奇數戰
    // 玩家1 出題
    // 玩家2 挑戰

    if (
        gameData.round % 2 === 1
    ) {

        gameData.currentChallenge = {

            creator: 1,

            challenger: 2,

            type: null

        };

    }

    // 偶數戰
    // 玩家2 出題
    // 玩家1 挑戰

    else {

        gameData.currentChallenge = {

            creator: 2,

            challenger: 1,

            type: null

        };

    }


    updateGameUI();


    nextRoundButton.classList.add(
        "hidden"
    );

}


// ========================================
// 顯示遊戲畫面
// ========================================

function showGameScreen() {

    roomScreen.classList.add(
        "hidden"
    );

    gameScreen.classList.remove(
        "hidden"
    );

    resultScreen.classList.add(
        "hidden"
    );


    updateGameUI();

}


// ========================================
// 更新遊戲畫面
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

    else {

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

    const challengeType =
        document.getElementById(
            "challengeType"
        );


    if (
        gameData.currentChallenge.type
    ) {

        const type =
            challengeTypes.find(
                item =>
                    item.id ===
                    gameData.currentChallenge.type
            );


        if (type) {

            challengeType.textContent =
                type.name;

        }

    }

    else {

        if (
            myPlayerNumber === creator
        ) {

            challengeType.innerHTML =
                createChallengeButtons();

        }

        else {

            challengeType.textContent =
                "⏳ 等待出題者選擇挑戰類型...";

        }

    }


    // ====================================
    // 遊戲訊息
    // ====================================

    const gameMessage =
        document.getElementById(
            "gameMessage"
        );


    if (
        gameData.currentChallenge.type
    ) {

        const type =
            challengeTypes.find(
                item =>
                    item.id ===
                    gameData.currentChallenge.type
            );


        if (myPlayerNumber === creator) {

            gameMessage.textContent =
                `🎨 你選擇了「${type.name}」`;

        }

        else {

            gameMessage.textContent =
                `🎯 等待出題者開始「${type.name}」`;

        }

    }

    else {

        if (
            myPlayerNumber === creator
        ) {

            gameMessage.textContent =
                "🎨 請選擇本戰挑戰類型";

        }

        else {

            gameMessage.textContent =
                "⏳ 等待出題者選擇挑戰...";

        }

    }

}


// ========================================
// 建立挑戰類型按鈕
// ========================================

function createChallengeButtons() {

    let html = "";


    challengeTypes.forEach(
        type => {

            html += `

                <button
                    class="challenge-button"
                    onclick="selectChallenge('${type.id}')"
                >

                    ${type.name}

                </button>

            `;

        }
    );


    return html;

}


// ========================================
// 選擇挑戰類型
// ========================================

function selectChallenge(typeId) {

    if (!isHost) {

        // 玩家2也可能成為出題者
        if (
            !gameData.currentChallenge ||
            gameData.currentChallenge.creator !==
            myPlayerNumber
        ) {

            return;

        }

    }


    if (
        gameData.currentChallenge.creator !==
        myPlayerNumber
    ) {

        return;

    }


    if (
        gameData.currentChallenge.type
    ) {

        return;

    }


    const selected =
        challengeTypes.find(
            type =>
                type.id === typeId
        );


    if (!selected) {

        return;

    }


    gameData.currentChallenge.type =
        typeId;


    // ====================================
    // 房主直接廣播
    // ====================================

    if (isHost) {

        broadcast({

            type: "CHALLENGE_SELECTED",

            gameData: gameData

        });


        updateGameUI();

        return;

    }


    // ====================================
    // 玩家2是出題者
    // ====================================

    sendToHost({

        type: "CHALLENGE_SELECTED",

        gameData: gameData

    });


    updateGameUI();

}


// ========================================
// 接收挑戰類型
// ========================================

function receiveChallengeSelection(
    data
) {

    if (!isHost) {

        gameData =
            data.gameData;

        updateGameUI();

        return;

    }


    // 房主收到玩家2選擇
    gameData =
        data.gameData;


    broadcast({

        type: "CHALLENGE_SELECTED",

        gameData: gameData

    });


    updateGameUI();

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


        if (
            gameData.score1 >= 3 ||
            gameData.score2 >= 3
        ) {

            finishGame();

            return;

        }


        gameData.round++;


        setupRound();


        broadcast({

            type: "NEXT_ROUND",

            gameData: gameData

        });

    }
);


// ========================================
// 測試用：判定本戰勝者
// ========================================

function testRoundWinner(
    playerNumber
) {

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


    if (playerNumber === 1) {

        gameData.score1++;

    }

    else {

        gameData.score2++;

    }


    broadcast({

        type: "ROUND_RESULT",

        gameData: gameData

    });


    updateGameUI();


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
// 接收遊戲資料
// ========================================

function handleGameData(data) {

    if (
        data.type === "GAME_START"
    ) {

        gameData =
            data.gameData;

        gameStarted = true;

        showGameScreen();

        return;

    }


    if (
        data.type === "CHALLENGE_SELECTED"
    ) {

        receiveChallengeSelection(
            data
        );

        return;

    }


    if (
        data.type === "NEXT_ROUND"
    ) {

        gameData =
            data.gameData;

        updateGameUI();

        return;

    }


    if (
        data.type === "ROUND_RESULT"
    ) {

        gameData =
            data.gameData;

        updateGameUI();

        return;

    }


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
// 更新開始遊戲按鈕
// ========================================

function updateStartButton() {

    if (!startGameButton) {

        return;

    }


    if (!isHost) {

        startGameButton.disabled =
            true;

        startGameButton.textContent =
            "⏳ 等待房主開始";

        return;

    }


    if (
        !playerConnections ||
        playerConnections.length < 1
    ) {

        startGameButton.disabled =
            true;

        startGameButton.textContent =
            "🎮 等待玩家加入";

        return;

    }


    startGameButton.disabled =
        false;

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


    message.textContent =
        text;

}
