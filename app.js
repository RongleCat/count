//app.js
const url = 'https://weapp.fmcat.top'
App({
  onLaunch: function () {
    wx.removeStorageSync('sessionId')
    this.loginFun()
  },
  globalData: {
    userInfo: null,
    isVip:false
  },
  loginFun(){
    let that = this
    // 登录
    wx.showLoading({title: '正在登陆...'})
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: getinfo_res => {
              this.globalData.userInfo = getinfo_res.userInfo
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(getinfo_res.userInfo)
              }
              wx.login({
                success: login_res => {
                  // 发送 res.code 到后台换取 openId, sessionKey, unionId
                  // console.log(login_res)
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
                      wx.setStorageSync('sessionId',r.data.result.sessionId)
                      wx.hideLoading()
                    }
                  })
                }
              })
            },
            fail: function (failData) {
              console.info("用户拒绝授权");
            }
          })
        }
      }
    })
  }
})