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
        page: 0,
        status: ['接龙中', '已截止', '已确认'],
        isLoading: false,
        isNoData: false
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
            list: [],
            isNoData: false
        })
        this.requestList()
    },
    InfiniteLoad(e) {
        let that = this
        if (that.data.isLoading || that.data.isNoData) {
            return false
        }
        let page = that.data.page
        that.setData({
            isLoading: true,
            page: ++page
        })
        that.requestList()
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
        let urlname = ['MyPublish', 'MyPartake', 'MyManage']
        let list = that.data.list
        console.log(urlname[tabSelect]);
        wx.request({
            url: url + '/Order/' + urlname[tabSelect],
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                sessionId: wx.getStorageSync('sessionId'),
                page: page,
                pagesize: 8
            },
            success: function(res) {
                console.log(res.data.result);
                let resList = res.data.result.data
                setTimeout(function() {
                    if (resList.length < 8 && page != 0) {
                        that.setData({
                            isNoData: true
                        })
                    }
                    that.setData({
                        list: [...list, ...resList]
                    })
                    that.setData({
                        isLoading: false
                    })
                    wx.hideLoading();
                }, 1000);
            }
        })
    },
    goOrderDetail(e) {
        let id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '../detail/detail?id=' + id
        })
    },
    copyOrder(e) {
        let that = this
        let orderId = e.currentTarget.dataset.id
        let sessionId = wx.getStorageSync('sessionId')
        console.log(orderId, sessionId);
        wx.request({
            url: url + '/Order/Copy',
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'GET',
            data: { orderId, sessionId },
            success: function(res) {
                if (res.data.ok === 1) {
                    app.globalData.copyJson = res.data.result
                    wx.navigateTo({
                        url: '../create/create?type=copy'
                    })
                }
            }
        })
    }
})