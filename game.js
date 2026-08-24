// ========================================
// 🎮 AI Card Challenge
// game.js
// ========================================


// ========================================
// 🎯 挑戰類型
// ========================================

const challengeTypes = [
    {
        id: "absolute_pitch",
        name: "🎵 絕對音感挑戰",
        description: "同時播放 3 個音，挑戰者要聽出三個音。"
    },

    {
        id: "rhythm",
        name: "🥁 節拍挑戰",
        description: "出題者先設定節奏，挑戰者用按鈕打出相同節奏。"
    },

    {
        id: "taiko",
        name: "🥁 太鼓達人",
        description: "按照節奏擊打音符。"
    },

    {
        id: "hard_taiko",
        name: "⚡ 困難版太鼓",
        description: "使用上下左右四條音軌進行挑戰。"
    },

    {
        id: "devil_music",
        name: "💀 魔鬼音之挑戰",
        description: "WASD＋空白鍵控制爵士鼓，RTYUIOP演奏七個音。"
    },

    {
        id: "sight_reading",
        name: "🎼 視譜挑戰",
        description: "使用 ASDF＋TYUIOP 進行雙手視奏。"
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

    currentChallenge: {
        creator: 1,
        challenger: 2,
        type: null
    },

    roundWinner: null,

    gameWinner: null
};


let myPlayerNumber = 0;

let gameStarted = false;


// ========================================
// 🔧 安全取得元素
// ========================================

function $(id) {
    return document.getElementById(id);
}


// ========================================
// 💬 訊息
// ========================================

function showMessage(text) {

    const el = $("message");

    if (el) {
        el.textContent = text;
    }

}


// ========================================
// 🎮 初始化按鈕
// ========================================

const createRoomButton = $("createRoom");
const joinRoomButton = $("joinRoom");
const leaveRoomButton = $("leaveRoom");
const startGameButton = $("startGame");
const nextRoundButton = $("nextRound");


// ========================================
// 🏠 建立房間
// ========================================

if (createRoomButton) {

    createRoomButton.addEventListener(
        "click",
        async () => {

            createRoomButton.disabled = true;

            if (joinRoomButton) {
                joinRoomButton.disabled = true;
            }

            showMessage("⏳ 正在建立房間...");


            const roomCode =
                await createRoom();


            if (!roomCode) {

                showMessage(
                    "❌ 建立房間失敗"
                );

                createRoomButton.disabled = false;

                if (joinRoomButton) {
                    joinRoomButton.disabled = false;
                }

                return;
            }


            myPlayerNumber = 1;


            const menu = $("menu");
            const roomScreen = $("roomScreen");
            const displayRoomCode =
                $("displayRoomCode");


            if (menu) {
                menu.classList.add("hidden");
            }

            if (roomScreen) {
                roomScreen.classList.remove("hidden");
            }

            if (displayRoomCode) {
                displayRoomCode.textContent =
                    roomCode;
            }


            updateStartButton();

            showMessage("");
        }
    );

}


// ========================================
// 🚪 加入房間
// ========================================

if (joinRoomButton) {

    joinRoomButton.addEventListener(
        "click",
        async () => {

            const input = $("roomCode");

            if (!input) {
                return;
            }


            const roomCode =
                input.value.trim();


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


            const menu = $("menu");
            const roomScreen = $("roomScreen");
            const displayRoomCode =
                $("displayRoomCode");


            if (menu) {
                menu.classList.add("hidden");
            }

            if (roomScreen) {
                roomScreen.classList.remove("hidden");
            }

            if (displayRoomCode) {
                displayRoomCode.textContent =
                    roomCode;
            }


            updateStartButton();

            showMessage("");
        }
    );

}


// ========================================
// 🚪 離開房間
// ========================================

if (leaveRoomButton) {

    leaveRoomButton.addEventListener(
        "click",
        () => {

            if (peer) {
                peer.destroy();
            }

            location.reload();
        }
    );

}


// ========================================
// 🎮 開始遊戲
// ========================================

if (startGameButton) {

    startGameButton.addEventListener(
        "click",
        () => {

            if (!isHost) {
                return;
            }


            if (
                !playerConnections ||
                playerConnections.length < 1
            ) {

                return;
            }


            startGame();
        }
    );

}


// ========================================
// 🚀 開始遊戲
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

        currentChallenge: {

            creator: 1,

            challenger: 2,

            type: null
        },

        roundWinner: null,

        gameWinner: null
    };


    gameStarted = true;


    showGameScreen();

    setupRound();


    broadcast({

        type: "GAME_START",

        gameData: gameData
    });

}


// ========================================
// ⚔️ 設定回合
// ========================================

function setupRound() {

    gameData.roundWinner = null;

    gameData.currentChallenge = {

        creator:
            gameData.round % 2 === 1
                ? 1
                : 2,

        challenger:
            gameData.round % 2 === 1
                ? 2
                : 1,

        type: null
    };


    showGameScreen();

    updateGameUI();

}


// ========================================
// 🖥️ 顯示遊戲畫面
// ========================================

function showGameScreen() {

    const menu = $("menu");
    const roomScreen = $("roomScreen");
    const gameScreen = $("gameScreen");
    const resultScreen = $("resultScreen");


    if (menu) {
        menu.classList.add("hidden");
    }

    if (roomScreen) {
        roomScreen.classList.add("hidden");
    }

    if (gameScreen) {
        gameScreen.classList.remove("hidden");
    }

    if (resultScreen) {
        resultScreen.classList.add("hidden");
    }

}


// ========================================
// 🖥️ 更新遊戲畫面
// ========================================

function updateGameUI() {

    if (!gameStarted) {
        return;
    }


    const roundNumber = $("roundNumber");

    if (roundNumber) {

        roundNumber.textContent =
            `第 ${gameData.round} 戰 / ${gameData.maxRounds} 戰`;
    }


    const score1 = $("score1");

    if (score1) {
        score1.textContent =
            gameData.score1;
    }


    const score2 = $("score2");

    if (score2) {
        score2.textContent =
            gameData.score2;
    }


    const creator =
        gameData.currentChallenge.creator;

    const challenger =
        gameData.currentChallenge.challenger;


    const myRole = $("myRole");

    const opponentRole =
        $("opponentRole");


    if (myPlayerNumber === creator) {

        if (myRole) {
            myRole.textContent =
                "🎨 我的身分：出題者";
        }

        if (opponentRole) {
            opponentRole.textContent =
                "🎯 對手：挑戰者";
        }

    } else {

        if (myRole) {
            myRole.textContent =
                "🎯 我的身分：挑戰者";
        }

        if (opponentRole) {
            opponentRole.textContent =
                "🎨 對手：出題者";
        }
    }


    updateChallengeArea();

}


// ========================================
// 🎯 更新挑戰選單
// ========================================

function updateChallengeArea() {

    const challengeType =
        $("challengeType");

    if (!challengeType) {

        console.error(
            "❌ 找不到 #challengeType"
        );

        return;
    }


    const creator =
        gameData.currentChallenge.creator;

    const selected =
        gameData.currentChallenge.type;


    // ------------------------------
    // 已經選擇
    // ------------------------------

    if (selected) {

        const type =
            challengeTypes.find(
                item => item.id === selected
            );


        if (!type) {
            return;
        }


        challengeType.innerHTML = `

            <div class="challenge-selected">

                ${type.name}

                <div class="challenge-description">

                    ${type.description}

                </div>

            </div>

        `;


        updateGameMessage(
            `🎯 本戰挑戰：${type.name}`
        );

        return;
    }


    // ------------------------------
    // 出題者
    // ------------------------------

    if (
        myPlayerNumber === creator
    ) {

        challengeType.innerHTML = `

            <div style="
                margin-bottom:15px;
                color:#ffca28;
                font-size:18px;
            ">

                🎨 請選擇本戰的挑戰類型

            </div>

            ${createChallengeButtons()}

        `;


        updateGameMessage(
            "🎨 你是出題者，請選擇挑戰類型"
        );

    }


    // ------------------------------
    // 挑戰者
    // ------------------------------

    else {

        challengeType.innerHTML = `

            <div style="
                padding:20px;
                color:#90a4ae;
            ">

                ⏳

                等待出題者選擇挑戰類型...

            </div>

        `;


        updateGameMessage(
            "🎯 等待出題者選擇挑戰..."
        );
    }

}


// ========================================
// 🔘 建立挑戰按鈕
// ========================================

function createChallengeButtons() {

    let html = "";


    challengeTypes.forEach(
        type => {

            html += `

                <button
                    type="button"
                    class="challenge-button"
                    onclick="selectChallenge('${type.id}')"
                >

                    ${type.name}

                    <span class="challenge-description">

                        ${type.description}

                    </span>

                </button>

            `;
        }
    );


    return html;
}


// ========================================
// 🎯 選擇挑戰
// ========================================

function selectChallenge(typeId) {

    const creator =
        gameData.currentChallenge.creator;


    // 不是出題者
    if (
        myPlayerNumber !== creator
    ) {

        console.log(
            "❌ 你不是本戰出題者"
        );

        return;
    }


    // 已經選過
    if (
        gameData.currentChallenge.type
    ) {

        return;
    }


    const type =
        challengeTypes.find(
            item => item.id === typeId
        );


    if (!type) {

        console.error(
            "❌ 找不到挑戰類型:",
            typeId
        );

        return;
    }


    gameData.currentChallenge.type =
        typeId;


    console.log(
        "🎯 選擇挑戰:",
        type.name
    );


    // ====================================
    // 房主
    // ====================================

    if (isHost) {

        updateGameUI();


        broadcast({

            type: "CHALLENGE_SELECTED",

            gameData: gameData

        });


        return;
    }


    // ====================================
    // 玩家2
    // ====================================

    sendToHost({

        type: "CHALLENGE_SELECTED",

        gameData: gameData

    });


    updateGameUI();

}


// ========================================
// 📨 接收挑戰選擇
// ========================================

function receiveChallengeSelection(data) {

    gameData =
        data.gameData;


    gameStarted = true;


    updateGameUI();

}


// ========================================
// 📨 接收遊戲資料
// ========================================

function handleGameData(data) {

    console.log(
        "🎮 遊戲資料:",
        data
    );


    if (
        data.type === "GAME_START"
    ) {

        gameData =
            data.gameData;

        gameStarted = true;

        showGameScreen();

        updateGameUI();

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

        gameStarted = true;

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
// 📨 房間系統收到資料
// ========================================

if (
    typeof window !== "undefined"
) {

    window.handleGameData =
        handleGameData;

}


// ========================================
// 🏆 測試回合結果
// ========================================

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


    if (playerNumber === 1) {

        gameData.score1++;

    } else {

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

        finishGame();

        return;
    }


    if (nextRoundButton) {

        nextRoundButton.classList.remove(
            "hidden"
        );
    }

}


// ========================================
// ➡️ 下一戰
// ========================================

if (nextRoundButton) {

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

}


// ========================================
// 🏆 結束遊戲
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
// 🏆 顯示結果
// ========================================

function showResult() {

    const gameScreen =
        $("gameScreen");

    const resultScreen =
        $("resultScreen");


    if (gameScreen) {
        gameScreen.classList.add(
            "hidden"
        );
    }


    if (resultScreen) {

        resultScreen.classList.remove(
            "hidden"
        );
    }


    const winnerText =
        $("winnerText");

    const finalScore =
        $("finalScore");


    if (winnerText) {

        winnerText.textContent =
            `🏆 玩家 ${gameData.gameWinner} 勝利！`;
    }


    if (finalScore) {

        finalScore.textContent =
            `${gameData.score1} : ${gameData.score2}`;
    }

}


// ========================================
// 🎮 更新開始遊戲按鈕
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
// 🧪 除錯資訊
// ========================================

console.log(
    "🎮 AI Card Challenge game.js 已載入"
);

console.log(
    "🎯 挑戰類型數量:",
    challengeTypes.length
);
