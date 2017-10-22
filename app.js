//app.js
const url = 'https://weapp.fmcat.top'
App({
    onLaunch: function(e) {
        wx.removeStorageSync('sessionId')
        let path = e.path.split('/')
        this.loginFun(path[2])
    },
    onShow(e) {
        // console.log(e);
        // let path = e.path.split('/')
        // if (this[path[2]]) {
        //     this[path[2]]()
        // }
    },
    globalData: {
        userInfo: null,
        isVip: false
    },
    loginFun(funName) {
        let that = this
            // 登录
        wx.getSetting({
            success: res => {
                console.log(res);
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    that.weappLogin(that, funName)
                } else {
                    wx.authorize({
                        scope: 'scope.userInfo',
                        success() {
                            that.weappLogin(that, funName)
                        }
                    })
                }
            },
            fail: function(res) {
                console.log(res);
            }
        })
    },
    weappLogin(that, funName) {
        console.log(that);
        wx.showLoading({
            title: '正在登陆...'
        })
        wx.getUserInfo({
            success: getinfo_res => {
                this.globalData.userInfo = getinfo_res.userInfo
                if (this.userInfoReadyCallback) {
                    this.userInfoReadyCallback(getinfo_res.userInfo)
                }
                console.log(getinfo_res);
                wx.login({
                    success: login_res => {
                        console.log(login_res);
                        wx.request({
                            url: url + '/wxapp/onlogin',
                            data: {
                                code: login_res.code,
                                nickName: getinfo_res.userInfo.nickName,
                                avatarUrl: getinfo_res.userInfo.avatarUrl
                            },
                            method: 'POST',
                            success: (r) => {
                                console.log(r)
                                wx.setStorageSync('sessionId', r.data.result.sessionId)
                                wx.hideLoading()
                                if (that[funName]) {
                                    that[funName]()
                                }
                            }
                        })
                    }
                })
            },
            fail: function(failData) {
                console.info("用户拒绝授权");
            }
        })
    }
})