// pages/detail/detail.js
const app = getApp()
const url = 'https://weapp.fmcat.top'

Page({
    data: {
        detail: {}
    },
    onLoad: function(e) {
        let that = this
        if (wx.getStorageSync('sessionId').length != 0) {
            that.getDetail(e.id)
        } else {
            app.detail = () => {
                that.getDetail(e.id)
            }
        }
    },
    getDetail(id) {
        wx.request({
            url: url + '/Order/GetDetail',
            data: {
                id,
                sessionId: wx.getStorageSync('sessionId')
            },
            success: function(res) {
                console.log(res);
            }
        })
    }
})