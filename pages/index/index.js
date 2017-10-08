// pages/index/index.js
const app = getApp()
Page({
    data: {
        nickName: '点击登录',
        userInfo: {},
        hasUserInfo: false,
        tabList:['我创建的','我参加的'],
        tabSelect:0,
        list:[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]
    },
    onLoad: function (options) {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        } else {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = res => {
                this.setData({
                    userInfo: res,
                    hasUserInfo: true
                })
            }
        }
    },
    scroll(e) {
        console.log(e)
    },
    getUserInfo() {
        app.loginFun()
    },
    changeTab(e){
        this.setData({
            tabSelect:parseInt(e.currentTarget.dataset.index)
        })
    }
})