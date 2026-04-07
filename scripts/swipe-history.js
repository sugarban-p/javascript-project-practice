// 滑動記錄功能
let swipeHistory = [];

// 記錄滑動行為的函數
function recordSwipe(userId, userName, action, timestamp = new Date()) {
    const swipeRecord = {
        userId: userId,
        userName: userName,
        action: action, // 'like', 'reject', 'superlike'
        timestamp: timestamp
    };

    swipeHistory.push(swipeRecord);
    // console.log('記錄滑動:', swipeRecord);

    // 儲存到 sessionStorage
    sessionStorage.setItem('swipeHistory', JSON.stringify(swipeHistory));

    // 觸發自定義事件，可以用來做統計或其他功能
    document.dispatchEvent(new CustomEvent('userSwiped', {
        detail: swipeRecord
    }));
}

// 從 sessionStorage 載入歷史記錄
function loadSwipeHistory() {
    const stored = sessionStorage.getItem('swipeHistory');
    if (stored) {
        const users = JSON.parse(stored);
        let userIdList = [];
        let userActionList = [];
        for (let user of users) {
            if (user.action!=='reject') {
                userActionList.push(user.action);
                userIdList.push(user.userId);
            }
        }
        try {
            swipeHistory = JSON.parse(stored);
            console.log('載入滑動歷史記錄:', swipeHistory.length, '筆記錄');
        } catch (e) {
            console.error('載入滑動歷史記錄失敗:', e);
            swipeHistory = [];
        }
        return [userIdList,userActionList];
    }
    return ["",""];
}


// 監聽 DOM 變化來檢測卡片移除（被滑走）
function initSwipeDetection() {
    // 使用 MutationObserver 監聽卡片狀態變化
    const observer = new MutationObserver(function (mutations) {
        const mutation = mutations[0];
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            // 載入歷史記錄
            const [userIdList,userActionList] = loadSwipeHistory();
            const card = mutation.target;
            const classList = card.classList;

            // 檢查是否有用戶資料
            const userId = card.dataset.userId;
            const userName = card.dataset.userName;
            const userIndex = userIdList.indexOf(userId);

            // 避免重複回傳
            if (userId && userName && 
                (!userIdList.includes(userId) || userActionList[userIndex]==="reject")) {
                // 檢測滑動方向
                if (classList.contains('to-right')) {
                    recordSwipe(userId, userName, 'like');
                } else if (classList.contains('to-left')) {
                    recordSwipe(userId, userName, 'reject');
                } else if (classList.contains('to-upside')) {
                    recordSwipe(userId, userName, 'superlike');
                }
            }
        }
    });

    // 監聽所有卡片
    document.querySelectorAll('.dzSwipe_card').forEach(card => {
        observer.observe(card, {
            attributes: true,
            attributeFilter: ['class']
        });
    });

    console.log('滑動檢測已初始化');
}

// 清除滑動歷史記錄
function clearSwipeHistory() {
    swipeHistory = [];
    sessionStorage.removeItem('swipeHistory');
    console.log('已清除滑動歷史記錄');
}


// 監聽自定義滑動事件
// document.addEventListener('userSwiped', function (event) {
//     const swipeData = event.detail;
//     console.log('使用者滑動事件:', swipeData);

//     // 這裡可以添加更多的處理邏輯，例如：
//     // - 發送到後端API
//     // - 更新UI統計
//     // - 推送通知等
// });