// pages/detail/detail.js
const app = getApp()
const url = 'https://weapp.fmcat.top'
const util = require('../../utils/util')
Number.prototype.formatMoney = function (places, symbol, thousand, decimal) {
    places = !isNaN(places = Math.abs(places)) ? places : 2;
    symbol = symbol !== undefined ? symbol : "$";
    thousand = thousand || ",";
    decimal = decimal || ".";
    var number = this,
        negative = number < 0 ? "-" : "",
        i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
};

Page({
    data: {
        detail: {},
        id: '',
        smallImg: [],
        bigImg: [],
        goods: [],
        selectCount: 0,
        moneyCount: 0,
        slideOpen: false,
        closeIng: false,
        Regions: [],
        selectRegion: '',
        headName: ['全部公开', '全部匿名'],
        selectHeadName: ''
    },
    onLoad: function (e) {
        let that = this
        this.setData({
            id: e.id
        })
        if (wx.getStorageSync('sessionId').length != 0) {
            that.getDetail(e.id)
        } else {
            app.detail = () => {
                that.getDetail(e.id)
            }
        }
    },
    onShareAppMessage(res) {
        let that = this
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
        }
        return {
            title: that.data.detail.Title,
            path: '/pages/detail/detail?id=' + that.data.id,
            success: function (res) {
                // 转发成功
                util.showSuccess('转发成功！')
            },
            fail: function (res) {
                util.showModel('提示', '转发失败！')
            }
        }
    },
    getDetail(id) {
        let that = this

        let sessionId = wx.getStorageSync('sessionId')
        wx.request({
            url: url + '/Order/GetDetail',
            data: {
                id,
                sessionId
            },
            success: function (res) {
                if (res.data.ok === 1) {
                    let data = res.data.result
                    let smallImg = that.data.smallImg
                    let bigImg = that.data.bigImg
                    data.Imgs.forEach(function (item) {
                        smallImg = [...smallImg, 'https://weapp.fmcat.top/' + item.Thumb]
                        bigImg = [...bigImg, 'https://weapp.fmcat.top/' + item.Origin]
                    }, this);
                    that.setData({
                        detail: res.data.result,
                        smallImg,
                        bigImg,
                        Regions: data.Regions
                    })
                }
            }
        })
        wx.request({
            url: url + '/Order/GetDetailGoods',
            data: {
                orderId: id,
                sessionId
            },
            success: function (res) {
                console.log(res);
                that.setData({
                    goods: res.data.result
                })
            }
        })
    },
    viewImage(e) {
        let current = e.currentTarget.dataset.src
        wx.previewImage({
            current: current, // 当前显示图片的http链接
            urls: this.data.bigImg
        })
    },
    openSlide() {
        let that = this
        if (that.data.selectCount == 0) {
            util.showModel('提示', '请先选择商品！')
            return false
        }

        wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: '#0099ff',
            animation: {
                duration: 200,
                timingFunc: 'easeIn'
            }
        })
        this.setData({
            slideOpen: true
        })
    },
    closeSlide() {
        let that = this
        wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: '#26c6da',
            animation: {
                duration: 200,
                timingFunc: 'easeIn'
            }
        })
        that.setData({
            closeIng: true
        })
        setTimeout(function () {
            that.setData({
                closeIng: false,
                slideOpen: false
            })
        }, 200);
    },
    setSelectRegion(e) {
        let that = this
        console.log(e);
        that.setData({
            selectRegion: e.detail.value
        })
    },
    setSelectHeadName(e) {
        let that = this
        that.setData({
            selectHeadName: e.detail.value
        })
    },
    openManageList(e) {
        let list = ['编辑接龙', '停止接龙', '接管接龙']
        wx.showActionSheet({
            itemList: list,
            success: function (res) {
                console.log(res.tapIndex)
            },
            fail: function (res) {
                console.log(res.errMsg)
            }
        })
    },
    backHome() {
        wx.redirectTo({
            url: '../index/index'
        })
    },
    countChange(e){
        let that = this
        let type = e.currentTarget.dataset.type
        let index = e.currentTarget.dataset.index
        let goods = that.data.goods
        if (type == 'add') {
            goods[index].MyOrderCount++
        }else{
            if (goods[index].MyOrderCount<1) {
                return false
            }
            goods[index].MyOrderCount--
        }
        that.mySelectCount()
        that.setData({
            goods
        })
    },
    mySelectCount(){
        let selectCount = 0
        let moneyCount = 0
        let that = this
        let goods = that.data.goods
        goods.forEach(function(item) {
            selectCount+=parseInt(item.MyOrderCount)
            moneyCount+=parseInt(item.MyOrderCount)*parseFloat(item.Price)
        }, this);
        that.setData({
            selectCount,
            moneyCount:moneyCount.formatMoney(2,'')
        })
    }
})