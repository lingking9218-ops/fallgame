// ========================================
// 🌐 AI Card Challenge
// 房間 / PeerJS 系統
// ========================================

let peer = null;

let isHost = false;

let myPeerId = "";

let hostConnection = null;

let playerConnections = [];


// ========================================
// 初始化 PeerJS
// ========================================

function initPeer() {

    // 產生 4 位數房號
    const roomCode = Math.floor(
        1000 + Math.random() * 9000
    ).toString();

    peer = new Peer(roomCode);


    // PeerJS 建立完成
    peer.on("open", (id) => {

        myPeerId = id;

        console.log("我的 Peer ID:", id);

    });


    // 有玩家連進我的房間
    peer.on("connection", (connection) => {

        console.log("有人加入房間:", connection.peer);

        isHost = true;

        playerConnections.push(connection);

        setupConnection(connection);

        updateRoomStatus();

    });


    // 發生錯誤
    peer.on("error", (error) => {

        console.error("PeerJS 錯誤:", error);

    });

}


// ========================================
// 設定連線
// ========================================

function setupConnection(connection) {

    connection.on("open", () => {

        console.log(
            "連線成功:",
            connection.peer
        );

    });


    connection.on("data", (data) => {

        console.log("收到資料:", data);

        handleRoomData(data);

    });


    connection.on("close", () => {

        console.log(
            "玩家離開:",
            connection.peer
        );

        playerConnections =
            playerConnections.filter(
                c => c !== connection
            );

        updateRoomStatus();

    });

}


// ========================================
// 加入房間
// ========================================

function joinRoom(roomCode) {

    if (!peer) {

        initPeer();

    }


    console.log(
        "正在加入房間:",
        roomCode
    );


    const connection =
        peer.connect(roomCode);


    hostConnection = connection;

    isHost = false;

    setupConnection(connection);


    connection.on("open", () => {

        console.log(
            "成功加入房間:",
            roomCode
        );

        updateRoomStatus();

    });

}


// ========================================
// 傳送資料給房主
// ========================================

function sendToHost(data) {

    if (!hostConnection) {

        console.warn("目前沒有連線到房主");

        return;

    }


    hostConnection.send(data);

}


// ========================================
// 房主廣播資料
// ========================================

function broadcast(data) {

    if (!isHost) {

        return;

    }


    playerConnections.forEach(
        connection => {

            if (connection.open) {

                connection.send(data);

            }

        }
    );

}


// ========================================
// 房間資料處理
// ========================================

function handleRoomData(data) {

    console.log(
        "收到房間資料:",
        data
    );


    // 這裡之後會交給遊戲系統
}


// ========================================
// 更新房間狀態
// ========================================

function updateRoomStatus() {

    const status =
        document.getElementById("roomStatus");


    if (!status) {

        return;

    }


    if (isHost) {

        status.textContent =
            `🏠 房主｜等待玩家加入`;

    } else {

        status.textContent =
            `🔗 已連線到房主`;

    }

}
