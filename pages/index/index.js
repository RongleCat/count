// pages/index/index.js
const app = getApp()
const url = 'https://weapp.fmcat.top'

Page({
    data: {
        nickName: '点击登录',
        hasUserInfo: false,
        tabList: ['我创建的', '我参加的', '我接管的'],
        tabSelect: 0,
        list: [],
        page: 0
    },
    onLoad: function(options) {
        let that = this
        if (wx.getStorageSync('sessionId').length != 0) {
            that.requestList()
        } else {
            app.index = () => {
                that.requestList()
            }
        }
    },
    getUserInfo() {
        app.loginFun()
    },
    changeTab(e) {
        let index = parseInt(e.currentTarget.dataset.index)
        this.setData({
            tabSelect: index,
            page: 0,
            list: []
        })
        this.requestList()
    },
    InfiniteLoad(e) {
        console.log(e);
    },
    //请求tab列表信息
    requestList() {
        wx.showLoading({
            title: '请稍后...'
        })
        let that = this
        let page = this.data.page
        let tabSelect = this.data.tabSelect
        console.log(tabSelect);
        let urlname = ['MyPublish', 'MyPartake', 'MyPublish']
        console.log(urlname[tabSelect]);
        wx.request({
            url: url + '/Order/' + urlname[tabSelect],
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                sessionId: wx.getStorageSync('sessionId'),
                page: page,
                pagesize: 3
            },
            success: function(res) {
                console.log(res.data.result);
                that.setData({
                    list: res.data.result.data
                })
                wx.hideLoading();
            }
        })
    },
    goOrderDetail(e) {
        let id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '../detail/detail?id=' + id
        })
    }
})