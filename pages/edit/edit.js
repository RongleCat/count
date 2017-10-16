// pages/detail/detail.js
const app = getApp()
const util = require('../../utils/util')

const url = 'https://weapp.fmcat.top'

Page({
    data: {
        img: [],
        bigImg: [],
        moreOpen: false,
        info: { phone: false, realname: false, weixin: false },
        endDate: '',
        endTime: '',
        goods: [],
        editIndex: -1,
        region: false,
        regionname: [],
        goodItem: {
            Id: '',
            Name: '',
            Price: '',
            StockCount: ''
        },
        password: {
            adminpwd: '',
            managepwd: ''
        },
        title: '',
        hideprice: false,
        popOpen: false,
        closeIng: false,
        headshowmode: ['公开', '接龙者自选', '匿名隐藏'],
        headSelect: 0,
        inputPopOpen: false,
        popInputValue: '',
        isNull: false,
        endcount: '',
        vip: false,
        orderId: '',
        Imgs: []
    },
    onLoad: function(e) {
        let that = this
        this.setData({
            orderId: e.id
        })
        if (wx.getStorageSync('sessionId').length != 0) {
            that.getDetail(e.id)
        } else {
            app.edit = () => {
                that.getDetail(e.id)
            }
        }
    },
    getDetail(id) {
        let that = this
        let sessionId = wx.getStorageSync('sessionId')
        wx.showLoading('请稍后...')
        wx.request({
            url: url + '/Order/GetDetail',
            data: {
                id,
                sessionId
            },
            success: function(res) {
                let data = res.data.result
                let img = []
                let bigImg = []
                let info = that.data.info
                let endDate = ''
                let endTime = ''
                let jindu = []
                if (data.EndTime != null) {
                    let all = data.EndTime.split(' ')
                    let time = all[1].split(':')
                    endDate = all[0]
                    endTime = time[0] + ':' + time[1]
                }
                console.log(data.EndTime);
                //设置图片
                data.Imgs.forEach(function(item) {
                    img = [...img, 'https://weapp.fmcat.top/' + item.Thumb]
                    bigImg = [...bigImg, 'https://weapp.fmcat.top/' + item.Origin]
                    jindu.push(0)
                }, this);
                //设置报名附加信息
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        if (data[key]) {
                            if (key == 'NeedPhone') {
                                info.phone = true
                            }
                            if (key == 'NeedName') {
                                info.realname = true
                            }
                            if (key == 'NeedWeixin') {
                                info.weixin = true
                            }
                        }
                    }
                }
                //判断更多选项是否开启
                if (data.NeedRegion || data.HidePrice || data.HeadShowType != 1 || data.AdminPwd.length != 0 || data.ManagePwd.length != 0) {
                    that.setData({
                        vip: true,
                        moreOpen: true
                    })
                }
                that.setData({
                    Imgs: data.Imgs,
                    img,
                    bigImg,
                    info,
                    title: data.Title,
                    headSelect: data.HeadShowType - 1,
                    hideprice: data.HidePrice,
                    password: {
                        adminpwd: data.AdminPwd,
                        managepwd: data.ManagePwd
                    },
                    region: data.NeedRegion,
                    endDate,
                    endTime,
                    endcount: data.EndCount,
                    regionname: data.Regions,
                    jindu
                })
                wx.hideLoading()
            },
            fail(res) {
                wx.hideLoading()
                that.getDetail(id)
            }
        })
        wx.request({
            url: url + '/Order/GetDetailGoods',
            data: {
                orderId: id,
                sessionId
            },
            success: function(res) {
                that.setData({
                    goods: res.data.result
                })
            }
        })
    },
    upImage() {
        let that = this;
        //上传图片部分代码
        let upImage = (imgurl) => {
            let index = that.data.img.indexOf(imgurl)
            let uploadTask = wx.uploadFile({
                url: url + '/order/AddImg', //仅为示例，非真实的接口地址
                filePath: imgurl,
                name: 'file',
                formData: {
                    sessionId: wx.getStorageSync('sessionId'),
                    orderId: that.data.orderId
                },
                success: function(res) {
                    let result = JSON.parse(res.data).result
                    let Imgs = that.data.Imgs
                    let bigImg = that.data.bigImg
                    let img = that.data.img
                    console.log(result);
                    that.setData({
                        bigImg: [...bigImg, result.origin],
                        Imgs: [...Imgs, result]
                    })
                },
                fail: res => {
                    console.log(res)
                }
            })
            uploadTask.onProgressUpdate((res) => {
                let jindu = that.data.jindu
                if (res.progress == 100) {
                    jindu[index] = 0
                } else {
                    jindu[index] = res.progress
                }
                that.setData({
                    jindu: jindu
                })
            })
        }
        wx.chooseImage({ //选择图片并调用上传接口
            count: 5 - that.data.img.length, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function(res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                let tempFilePaths = res.tempFilePaths
                let count = tempFilePaths.length
                let img = that.data.img
                let jindu = that.data.jindu
                for (let i = 0; i < count; i++) {
                    jindu.push(0)
                }
                that.setData({
                    img: [...img, ...tempFilePaths],
                    jindu: jindu
                })
                tempFilePaths.forEach(function(item) {
                    upImage(item)
                }, this);
            }
        })
    },
    //预览图片
    viewImage(e) {
        let current = e.currentTarget.dataset.src
        wx.previewImage({
            current: current, // 当前显示图片的http链接
            urls: this.data.bigImg
        })
    },
    //检查时间
    checkTime(date) {
        let now = Date.parse(new Date())
        let select = Date.parse(new Date(date))
        if (date.length == 1) {
            return false
        }
        if (select > now) {
            return false
        } else {
            return true
        }
    },
    setEndCount(e) {
        this.setData({
            endcount: e.detail.value
        })
    },
    //打开输入框添加地区
    createNewRegion() {
        this.setData({
            inputPopOpen: true
        })
    },
    //删除一个地区
    deleteRegion(e) {
        let that = this
        let index = e.currentTarget.dataset.index
        let regionname = that.data.regionname
        regionname.remove(index)
        this.setData({
            regionname
        })
    },
    //绑定密码值
    setPassword(e) {
        let param = e.currentTarget.dataset.param
        let password = this.data.password
        password[param] = e.detail.value
        this.setData({
            password
        })
    },
    //设置隐藏单价
    setHidePrice(e) {
        this.setData({
            hideprice: e.detail.value
        })
    },
    //设置地区
    setRegion(e) {
        this.setData({
            region: e.detail.value
        })
    },
    //弹窗文本框值绑定
    popInput(e) {
        this.setData({
            popInputValue: e.detail.value
        })
    },
    //弹窗取消按钮
    popCancel() {
        let that = this
        this.setData({
            popInputValue: '',
            closeIng: true
        })
        setTimeout(function() {
            that.setData({
                closeIng: false,
                inputPopOpen: false
            })
        }, 300);
    },
    //弹窗确定添加新地区
    popConfirm() {
        let regionname = this.data.regionname
        let that = this
        if (that.data.popInputValue != '') {
            regionname.push(that.data.popInputValue)
            that.setData({
                regionname
            })
            that.popCancel()
        } else {
            that.setData({
                isNull: true
            })
            setTimeout(function() {
                that.setData({
                    isNull: false
                })
            }, 500);
        }
    },
    //绑定头像显示模式选择
    bindPickerChange(e) {
        this.setData({
            headSelect: e.detail.value
        })
    },
    //绑定日期选择值
    bindDateChange(e) {
        let endTime = this.data.endTime
        let nowTime = ''
        if (endTime == '') {
            nowTime = util.dateFormat(new Date(), 'HH:mm')
            endTime = nowTime
        }
        this.setData({
            endDate: e.detail.value,
            endTime
        })
    },
    //判断选择时间是否比当前时间小
    bindTimeChange(e) {
        let nowTime = Date.parse(new Date());
        let selectTime = Date.parse(new Date(this.data.endDate + ' ' + e.detail.value));
        if (selectTime < nowTime) {
            util.showModel('提示', '截止时间不能小于当前时间！')
            return false
        } else {
            this.setData({
                endTime: e.detail.value
            })
        }
    },
    //检测是否vip，打开弹窗或者更多选项
    openMoreOpation() {
        let that = this;
        if (this.data.moreOpen) {
            return
        }
        if (!this.data.vip) {
            wx.request({
                url: url + '/Order/IsVIP',
                data: {
                    sessionId: wx.getStorageSync('sessionId')
                },
                success: function(res) {
                    console.log(res);
                    if (res.data.result.vip) {
                        that.setData({
                            moreOpen: true,
                            vip: true
                        })
                    } else {
                        that.setData({
                            popOpen: true
                        })
                    }
                }
            })
        } else {
            that.setData({
                moreOpen: true
            })
        }
    },
    //弹窗关闭
    closePop() {
        let that = this
        that.setData({
            closeIng: true
        })
        setTimeout(function() {
            that.setData({
                closeIng: false,
                popOpen: false
            })
        }, 300);
    },
    //删除图片
    delImage(e) {
        let that = this
        let index = e.currentTarget.dataset.index
        let img = this.data.img
        let jindu = this.data.jindu
        let bigImg = this.data.bigImg
        let Imgs = this.data.Imgs
        let imgItem = Imgs[index]
        let imgid = imgItem.Id || imgItem.imgid
        let sessionId = wx.getStorageSync('sessionId')

        console.log(imgid);
        wx.request({
            url: url + '/Order/DeleteImg',
            method: 'POST',
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                sessionId,
                imgid
            },
            success: function(res) {
                if (res.data.ok == 1) {
                    img.remove(index)
                    jindu.remove(index)
                    bigImg.remove(index)
                    Imgs.remove(index)
                    that.setData({
                        img,
                        jindu,
                        bigImg,
                        Imgs
                    })
                }
            },
            fail: function(res) {
                console.log(res);
            }
        })
    },
    //添加商品
    addGood(e) {
        let that = this
        let goodinfo = this.data.goodItem
        let goods = this.data.goods
        let editIndex = this.data.editIndex
        let sessionId = wx.getStorageSync('sessionId')
        let orderId = this.data.orderId
        if (goodinfo.Name.length === 0) {
            util.showModel('提示', '请填写商品名称！')
            return false
        }
        if (goodinfo.Price.length === 0) {
            util.showModel('提示', '请填写商品单价！')
            return false
        }
        if (editIndex === -1) {
            wx.request({
                url: url + '/Order/AddGoods',
                method: 'POST',
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: {
                    sessionId,
                    orderId,
                    name: goodinfo.Name,
                    price: util.toDecimal2(goodinfo.Price),
                    count: parseInt(goodinfo.StockCount)
                },
                success: function(res) {
                    if (res.data.ok == 1) {
                        goodinfo.Id = res.data.result.goodsId
                        goods = [...goods, goodinfo]
                        that.setData({
                            goods,
                            goodEdit: false,
                            goodItem: {
                                Id: '',
                                Name: '',
                                Price: '',
                                StockCount: ''
                            },
                            editIndex: -1
                        })
                    }
                },
                fail: function(res) {
                    console.log(res);
                }
            })
        } else {
            wx.request({
                url: url + '/Order/EditGoods',
                method: 'POST',
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: {
                    sessionId,
                    goodsId: goods[editIndex].Id,
                    name: goodinfo.Name,
                    price: util.toDecimal2(goodinfo.Price),
                    count: parseInt(goodinfo.StockCount)
                },
                success: function(res) {
                    if (res.data.ok == 1) {
                        goods[editIndex] = goodinfo
                        that.setData({
                            goods,
                            goodEdit: false,
                            goodItem: {
                                Id: '',
                                Name: '',
                                Price: '',
                                StockCount: ''
                            },
                            editIndex: -1
                        })
                    }
                },
                fail: function(res) {
                    console.log(res);
                }
            })
        }

    },
    //设置input绑定
    setGoodValue(e) {
        let goodItem = this.data.goodItem
        let param = e.currentTarget.dataset.param
        goodItem[param] = e.detail.value
        this.setData({
            goodItem
        })
    },
    //新建一个商品
    createNewGood() {
        this.setData({
            goodEdit: true
        })
    },
    //编辑已添加的商品
    editGood(e) {
        let index = e.currentTarget.dataset.index
        let goods = this.data.goods
        let goodItem = goods[index]
        this.setData({
            goodItem,
            goodEdit: true,
            editIndex: index
        })
    },
    //删除已添加的商品
    deleteGood(e) {
        let index = e.currentTarget.dataset.index
        let goods = this.data.goods
        let that = this
        if (goods.length > 1) {
            wx.request({
                url: url + '/Order/DeleteGoods',
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                method: 'POST',
                data: {
                    sessionId: wx.getStorageSync('sessionId'),
                    goodsId: goods[index].Id
                },
                success: function(res) {
                    if (res.data.ok == 1) {
                        util.showSuccess('删除成功')
                        goods.remove(index)
                        that.setData({
                            goods
                        })
                    }
                }
            })
        } else {
            util.showModel('提示', '至少保留一个商品')
        }
    },
    //设置主题文本框值
    setTitleValue(e) {
        this.setData({
            title: e.detail.value
        })
    },
    //获取复选框值
    checkboxChange(e) {
        let info = { phone: false, realname: false, weixin: false }
        e.detail.value.forEach(function(item) {
            info[item] = true
        }, this);
        this.setData({
            info
        })
    },
    changeSubmit(e) {
        let that = this
        let d = that.data
        let info = d.info
        let post = {
            orderId: d.orderId,
            title: d.title,
            endtime: d.endDate + ' ' + d.endTime,
            endcount: d.endcount,
            region: d.region,
            regionnames: d.regionname.join(','),
            adminpwd: d.password.adminpwd,
            managepwd: d.password.managepwd,
            hideprice: d.hideprice,
            headshowtype: parseInt(d.headSelect) + 1,
            phone: info.phone,
            realname: info.realname,
            weixin: info.weixin,
            sessionId: wx.getStorageSync('sessionId')
        }
        if (post.title.length == 0) {
            util.showModel('提示', '请填写标题')
            return false
        }
        if (that.checkTime(post.endtime)) {
            util.showModel('提示', '截止时间不能小于当前时间！')
            return false
        }
        if (post.region) {
            if (post.regionnames.length === 0) {
                util.showModel('提示', '最少添加一地区')
                return false
            }
        }
        wx.request({
            url: url + '/Order/EditOrder',
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            data: post,
            success: function(res) {
                console.log(res);
                if (res.data.ok === 1) {
                    // let orderid = res.data.result.orderid
                    util.showSuccess('修改成功！')
                    setTimeout(function() {
                        wx.navigateTo({
                            url: '../detail/detail?id=' + that.data.orderId
                        })
                    }, 1000);
                }
            }
        })
    }
})