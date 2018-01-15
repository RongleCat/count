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
        loadingEnd: false,
        smallImg: [],
        bigImg: [],
        goods: [],
        selectCount: 0,
        moneyCount: 0,
        childSelectCount: 0,
        childMoneyCount: 0,
        slideOpen: false,
        closeIng: false,
        Regions: [],
        selectRegion: -1,
        headName: ['全部公开', '全部匿名'],
        selectHeadName: -1,
        join: [],
        inputPopOpen: false,
        outPopOpen: false,
        isNull: false,
        popInputValue: '',
        popOutValue: '',
        joined: false,
        isChange: false,
        isChangeSend: false,
        childGoodPop: false,
        childItem: {},
        goodsArray: [],
        editChild: false,
        childId: -1,
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
        wx.showLoading({title:'正在加载'})
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
                    let joined = res.data.result.IncludeMe
                    data.Imgs.forEach(function (item) {
                        smallImg = [...smallImg, 'https://weapp.fmcat.top/' + item.Thumb]
                        bigImg = [...bigImg, 'https://weapp.fmcat.top/' + item.Origin]
                    }, this);
                    that.setData({
                        detail: res.data.result,
                        smallImg,
                        bigImg,
                        Regions: data.Regions,
                        loadingEnd: true,
                        joined
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
                sessionId,
                isManage: true
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
                slideOpen: false,
                editChild: false
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
                        that.setData({
                            outPopOpen: true
                        })
                    },
                    edit() {
                        wx.navigateTo({
                            url: '../edit/edit?id=' + orderId
                        })
                    },
                    stop() {
                        wx.showLoading({title:'正在截止'})
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
                        wx.showLoading({title:'正在开启'})
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
        let editChild = that.data.editChild
        if (editChild) {
            goods = that.data.goodsArray
        }
        if (type == 'add') {
            goods[index].MyOrderCount++
        } else {
            if (goods[index].MyOrderCount < 1) {
                return false
            }
            goods[index].MyOrderCount--
        }
        if (!editChild) {
            that.mySelectCount()
            that.setData({
                goods
            })
        } else {
            that.childSelectCount()
            that.setData({
                goodsArray: goods
            })
        }

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
    childSelectCount() {
        let childSelectCount = 0
        let childMoneyCount = 0
        let that = this
        let goods = that.data.goodsArray
        goods.forEach(function (item) {
            childSelectCount += parseInt(item.MyOrderCount || 0)
            childMoneyCount += parseInt(item.MyOrderCount || 0) * parseFloat(item.Price)
        }, this);
        that.setData({
            childSelectCount,
            childMoneyCount: childMoneyCount.formatMoney(2, '')
        })
    },
    inputCount(e) {
        let that = this
        let index = e.currentTarget.dataset.index
        let goods = that.data.goods
        let editChild = that.data.editChild
        if (editChild) {
            goods = that.data.goodsArray
        }
        goods[index].MyOrderCount = e.detail.value
        if (!editChild) {
            that.mySelectCount()
            that.setData({
                goods
            })
        } else {
            that.childSelectCount()
            that.setData({
                goodsArray: goods
            })
        }
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
    popOut(e) {
        this.setData({
            popOutValue: e.detail.value
        })
    },
    popCancel() {
        let that = this
        this.setData({
            popInputValue: '',
            popOutValue: '',
            closeIng: true
        })
        setTimeout(function () {
            that.setData({
                closeIng: false,
                inputPopOpen: false,
                outPopOpen: false
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
    popOutConfirm() {
        let that = this
        let email = that.data.popOutValue
        let sessionId = wx.getStorageSync('sessionId')
        let orderId = parseInt(that.data.id)
        var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
        console.log(email, orderId);
        if (!reg.test(email)) {
            wx.showToast({
                title: '邮箱格式错误',
                image:'./icon-error.png',
                duration: 2000
            })
            that.setData({
                isNull: true
            })
            setTimeout(function () {
                that.setData({
                    isNull: false
                })
            }, 500);
            return false
        }
        wx.showLoading({title:'正在导出！'});
        wx.request({
            url: url + '/Order/Report',
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            data: {
                email,
                orderId,
                sessionId
            },
            success: function (res) {
                if (res.data.ok === 1) {
                    util.showSuccess('导出成功！')
                }
            }
        })
        that.popCancel()
    },
    sendJoin() {
        let that = this
        let submitJoin = that.data.submitJoin
        let d = that.data.detail
        let goods = that.data.goods
        let editChild = that.data.editChild
        let orderGoodsJson = []
        let api = '/Order/AddChild'
        if (editChild) {
            goods = that.data.goodsArray
        }
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
        // console.log(submitJoin);
        wx.showLoading({title:'正在提交'})
        if (that.data.isChangeSend) {
            submitJoin.childId = that.data.detail.MyId
            api = '/Order/EditChild'
        }
        wx.request({
            url: url + api,
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            data: submitJoin,
            success: function (res) {
                if (res.data.ok === 1) {
                    util.showSuccess('提交成功')
                    that.closeSlide()
                    that.getDetail()
                    that.setData({
                        editChild: false,
                        isChangeSend: false,
                        joined: true
                    })
                }
            },
            fail: function (res) {
                util.showModel('提示', '出现了错误，请稍后重试')
            }
        })
    },
    changeGood() {
        let that = this
        that.setData({
            joined: false,
            isChange: true
        })
    },
    changeJoin(itemData) {
        let that = this
        let data = that.data.detail
        let submitJoin = that.data.submitJoin
        let selectRegion = -1
        let selectHeadName = -1
        if (that.data.Regions) {
            selectRegion = that.data.Regions.indexOf(data.MyRegion)
            if (selectRegion == -1) {
                selectRegion = 0
            }
        }
        if (data.MyShowHeadNick) {
            selectHeadName = 0
        } else {
            selectHeadName = 1
        }
        submitJoin.realname = data.MyName
        submitJoin.phone = data.MyPhone
        submitJoin.weixin = data.MyWeixin
        submitJoin.region = data.MyRegion
        submitJoin.memo = data.MyMemo
        that.setData({
            slideOpen: true,
            submitJoin,
            selectRegion,
            isChange: false,
            isChangeSend: true,
            selectHeadName
        })
    },
    adminChangeJoin(e) {
        let that = this
        let item, childGood, itemIndex = e.target.dataset.itemindex.toString();
        let goods = that.data.goods
        let goodsOut = {},
            goodsArray = []
        if (that.data.detail.MyRole != 2 && that.data.detail.MyRole != 3) {
            return false
        }
        if (itemIndex) {
            item = that.data.join[itemIndex]
            childGood = item.GoodsList
        }
        goods.forEach(item => {
            item.MyOrderCount = 0
            goodsOut[item.Id] = item
        })
        childGood.forEach(item => {
            goodsOut[item.GoodsId].MyOrderCount = item.Count
        });
        for (var i in goodsOut) {
            goodsArray.push(goodsOut[i])
        }
        that.setData({
            childGoodPop: true,
            childItem: item,
            goodsArray,
            editChild: true
        })
    },
    closePop() {
        let that = this
        let item = that.data.childItem,
            changeData = {}
        changeData.MyName = item.Name
        changeData.MyPhone = item.Phone
        changeData.MyRegion = item.Region
        changeData.MyShowHeadNick = item.ShowHeadNick
        changeData.MyWeixin = item.Weixin
        changeData.MyMemo = item.ConsumerMemo
        that.setData({
            closeIng: true
        })
        setTimeout(function () {
            that.setData({
                closeIng: false,
                childGoodPop: false,
                isChangeSend: true,
                isChange: false
            })
            that.changeJoin(changeData)
        }, 300);
    },
    examineJoin(e) {
        let post = {
            childId: e.target.dataset.id
        }
        let that = this
        post.sessionId = wx.getStorageSync('sessionId')
        wx.showActionSheet({
            itemList: ['不通过', '通过'],
            success: function (res) {
                post.status = res.tapIndex
                wx.showLoading({title:'正在提交'})
                wx.request({
                    url: url + '/order/ChildConfirm',
                    header: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    method: 'POST',
                    data: post,
                    success: function (res) {
                        if (res.data.ok === 1) {
                            util.showSuccess('操作成功！')
                            that.getDetail()
                        }
                    },
                    fail: function (res) {
                        util.showModel('提示', '出现了错误，请稍后重试')
                    }
                })
            },
            fail: function (res) {
                console.log(res.errMsg)
            }
        })
    }
})