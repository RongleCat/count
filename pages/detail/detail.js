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
        loadingEnd:false,
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
        selectHeadName: '',
        join: [],
        inputPopOpen: false,
        isNull: false,
        popInputValue: '',
        submitJoin: {
            realname: '',
            phone: '',
            weixin: '',
            region: '',
            memo: '',
            orderGoodsJson: '',
            showheadnickname: true
        }
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
    getDetail() {
        let that = this
        let sessionId = wx.getStorageSync('sessionId')
        let id = that.data.id
        wx.showLoading('正在加载')
        wx.request({
            url: url + '/Order/GetDetail',
            data: {
                id,
                sessionId
            },
            success: function (res) {
                if (res.data.ok === 1) {
                    let data = res.data.result
                    let smallImg = []
                    let bigImg = []
                    data.Imgs.forEach(function (item) {
                        smallImg = [...smallImg, 'https://weapp.fmcat.top/' + item.Thumb]
                        bigImg = [...bigImg, 'https://weapp.fmcat.top/' + item.Origin]
                    }, this);
                    that.setData({
                        detail: res.data.result,
                        smallImg,
                        bigImg,
                        Regions: data.Regions,
                        loadingEnd:true
                    })
                    wx.hideLoading()
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
                that.mySelectCount()
            }
        })
        wx.request({
            url: url + '/Order/GetDetailChildren',
            data: {
                orderId: id,
                sessionId
            },
            success: function (res) {
                console.log(res);
                that.setData({
                    join: res.data.result
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
        let submitJoin = that.data.submitJoin
        console.log(e);
        submitJoin.region = that.data.Regions[e.detail.value]
        that.setData({
            selectRegion: e.detail.value,
            submitJoin
        })
    },
    setSelectHeadName(e) {
        let that = this
        let submitJoin = that.data.submitJoin
        submitJoin.showheadnickname = !parseInt(e.detail.value)
        that.setData({
            selectHeadName: e.detail.value,
            submitJoin
        })
    },
    openManageList(e) {
        let that = this
        let role = parseInt(that.data.detail.MyRole)
        let state = parseInt(that.data.detail.Status)
        let sessionId = wx.getStorageSync('sessionId')
        let orderId = parseInt(that.data.id)
        let list = []
        switch (role) {
            case 0:
                list = ['接管接龙']
                break;
            case 1:
                list = ['导出报表', '接管接龙']
                break;
            case 2:
                list = ['导出报表', '编辑接龙', '截止接龙']
                break;
            case 3:
                list = ['导出报表', '编辑接龙', '截止接龙']
                break;
        }
        if (state === 1) {
            if (list.indexOf('截止接龙') != -1) {
                list[list.indexOf('截止接龙')] = '开启接龙'
            }
        }
        wx.showActionSheet({
            itemList: list,
            success: function (res) {
                let selectName = list[res.tapIndex]
                let funName = 'cancel'
                let funList = {
                    out() {
                        console.log('out');
                    },
                    edit() {
                        wx.navigateTo({
                            url: '../edit/edit?id=' + orderId
                        })
                    },
                    stop() {
                        wx.showLoading('正在截止')
                        wx.request({
                            url: url + '/Order/ChangeOrderStatus',
                            header: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            method: 'POST',
                            data: {
                                sessionId,
                                orderId,
                                status: 1
                            },
                            success: function (res) {
                                console.log(res);
                                if (res.data.ok === 1) {
                                    util.showSuccess('已截止')
                                    that.getDetail()
                                }
                            }
                        })
                    },
                    take() {
                        that.setData({
                            inputPopOpen: true
                        })
                    },
                    start() {
                        wx.showLoading('正在开启')
                        wx.request({
                            url: url + '/Order/ChangeOrderStatus',
                            header: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            method: 'POST',
                            data: {
                                sessionId,
                                orderId,
                                status: 0
                            },
                            success: function (res) {
                                console.log(res);
                                if (res.data.ok === 1) {
                                    util.showSuccess('已开启')
                                    that.getDetail()
                                }
                            }
                        })
                    },
                    cancel() {
                        return false
                    }
                }
                switch (selectName) {
                    case '导出报表':
                        funName = 'out'
                        break;
                    case '编辑接龙':
                        funName = 'edit'
                        break;
                    case '截止接龙':
                        funName = 'stop'
                        break;
                    case '接管接龙':
                        funName = 'take'
                        break;
                    case '开启接龙':
                        funName = 'start'
                        break;
                }
                funList[funName]()
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
    countChange(e) {
        let that = this
        let type = e.currentTarget.dataset.type
        let index = e.currentTarget.dataset.index
        let goods = that.data.goods
        if (type == 'add') {
            goods[index].MyOrderCount++
        } else {
            if (goods[index].MyOrderCount < 1) {
                return false
            }
            goods[index].MyOrderCount--
        }
        that.mySelectCount()
        that.setData({
            goods
        })
    },
    mySelectCount() {
        let selectCount = 0
        let moneyCount = 0
        let that = this
        let goods = that.data.goods
        goods.forEach(function (item) {
            selectCount += parseInt(item.MyOrderCount || 0)
            moneyCount += parseInt(item.MyOrderCount || 0) * parseFloat(item.Price)
        }, this);
        that.setData({
            selectCount,
            moneyCount: moneyCount.formatMoney(2, '')
        })
    },
    inputCount(e) {
        let that = this
        let index = e.currentTarget.dataset.index
        let goods = that.data.goods
        goods[index].MyOrderCount = e.detail.value
        that.mySelectCount()

        that.setData({
            goods
        })
    },
    inputCountBlur(e) {
        let that = this
        let index = e.currentTarget.dataset.index
        let goods = that.data.goods
        if (e.detail.value.length === 0) {
            goods[index].MyOrderCount = 0
        }
        that.setData({
            goods
        })
    },
    setSubmitData(e) {
        let that = this
        let submitJoin = that.data.submitJoin
        let param = e.currentTarget.dataset.param
        submitJoin[param] = e.detail.value
        that.setData({
            submitJoin
        })
    },
    popInput(e) {
        this.setData({
            popInputValue: e.detail.value
        })
    },
    popCancel() {
        let that = this
        this.setData({
            popInputValue: '',
            closeIng: true
        })
        setTimeout(function () {
            that.setData({
                closeIng: false,
                inputPopOpen: false
            })
        }, 300);
    },
    popConfirm() {
        let that = this
        let pwd = that.data.popInputValue
        let sessionId = wx.getStorageSync('sessionId')
        let orderId = parseInt(that.data.id)
        if (pwd != '') {
            wx.request({
                url: url + '/Order/ManageOrder',
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                method: 'POST',
                data: {
                    sessionId,
                    orderId,
                    pwd
                },
                success: function (res) {
                    if (res.data.ok === 1) {
                        util.showSuccess('已接管')
                        that.getDetail()
                    }
                }
            })
            that.popCancel()
        } else {
            that.setData({
                isNull: true
            })
            setTimeout(function () {
                that.setData({
                    isNull: false
                })
            }, 500);
        }
    },
    //打开输入框添加地区
    sendJoin() {
        let that = this
        let submitJoin = that.data.submitJoin
        let d = that.data.detail
        let goods = that.data.goods
        let orderGoodsJson = []
        goods.forEach(function (item) {
            if (parseInt(item.MyOrderCount) > 0) {
                orderGoodsJson.push({
                    GoodsId: item.Id,
                    GoodsName: item.Name,
                    Count: item.MyOrderCount
                })
            }
        }, this);
        if (orderGoodsJson.length === 0) {
            util.showModel('提示', '请先添加商品！')
            return false
        }
        if (d.NeedName) {
            if (submitJoin.realname.length === 0) {
                util.showModel('提示', '请填写真实姓名！')
                return false
            }
        }
        if (d.NeedPhone) {
            if (submitJoin.phone.length === 0) {
                util.showModel('提示', '请填写手机号码！')
                return false
            }
        }
        if (d.NeedWeixin) {
            if (submitJoin.weixin.length === 0) {
                util.showModel('提示', '请填写微信号！')
                return false
            }
        }
        if (d.NeedRegion) {
            if (submitJoin.region.length === 0) {
                util.showModel('提示', '请选择地区！')
                return false
            }
        }
        submitJoin.orderGoodsJson = JSON.stringify(orderGoodsJson)
        submitJoin.orderId = parseInt(that.data.id)
        submitJoin.sessionId = wx.getStorageSync('sessionId')
        console.log(submitJoin);
        wx.request({
            url: url + '/Order/AddChild',
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            data: submitJoin,
            success: function (res) {
                console.log(res);
                if (res.data.ok === 1) {
                    that.closeSlide()
                    that.getDetail()
                }
            }
        })
    }
})